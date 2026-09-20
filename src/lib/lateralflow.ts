import type { RasterImage } from "./autodetect";

export type PanelVerdict = "negative" | "positive" | "invalid";

export interface PanelResult {
  index: number;
  verdict: PanelVerdict;
  lines: number;
  /** centre of the strip band as a fraction of image width */
  x: number;
  reason: string;
  /** first line position within the membrane window, 0 = top, 1 = bottom */
  firstLinePos: number;
}

export interface LateralFlowResult {
  panels: PanelResult[];
  /** overall verdict: any positive panel => positive; else any invalid => inconclusive; else negative */
  result: "positive" | "negative" | "inconclusive";
  orientation: "vertical" | "horizontal";
}

interface Grid { w: number; h: number; L: Float32Array; P: Float32Array }

function toGrid(img: RasterImage, transpose: boolean): Grid {
  const ch = img.channels ?? 4;
  const scale = Math.max(1, Math.max(img.width, img.height) / 600);
  const sw = Math.max(8, Math.floor(img.width / scale));
  const sh = Math.max(8, Math.floor(img.height / scale));
  const w = transpose ? sh : sw;
  const h = transpose ? sw : sh;
  const L = new Float32Array(w * h);
  const P = new Float32Array(w * h);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      // box-average a scale x scale block to suppress sensor noise
      let r = 0, g = 0, b = 0, n = 0;
      const x0 = Math.floor(x * scale), y0 = Math.floor(y * scale);
      for (let j = 0; j < scale && y0 + j < img.height; j++) {
        for (let i = 0; i < scale && x0 + i < img.width; i++) {
          const o = ((y0 + j) * img.width + x0 + i) * ch;
          r += img.data[o]; g += img.data[o + 1]; b += img.data[o + 2]; n++;
        }
      }
      r /= n; g /= n; b /= n;
      const tx = transpose ? y : x, ty = transpose ? x : y;
      L[ty * w + tx] = r * 0.299 + g * 0.587 + b * 0.114;
      P[ty * w + tx] = r - g;
    }
  }
  return { w, h, L, P };
}

interface Strip { x0: number; x1: number; lines: { y: number; strength: number }[]; top: number; bottom: number }

function findStrips(gr: Grid): Strip[] {
  const { w, h, L, P } = gr;
  const sorted = Array.from(L).sort((a, b) => b - a);
  const white = sorted[Math.floor(sorted.length * 0.03)];
  if (white < 90) return [];
  const gap = Math.max(2, Math.round(h * 0.014));
  const mask = new Float32Array(w * h);
  const colCount = new Float32Array(w);
  for (let y = gap; y < h - gap; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x, up = L[i - gap * w], dn = L[i + gap * w], c = L[i];
      if (up < white * 0.72 || dn < white * 0.72) continue;
      if (c > Math.min(up, dn) * 0.88) continue;
      if (P[i] - (P[i - gap * w] + P[i + gap * w]) / 2 < 12) continue; // lines are pink/magenta, not grey/dark
      mask[i] = Math.min(up, dn) - c;
      colCount[x]++;
    }
  }
  const maxCol = Math.max(...colCount);
  if (maxCol < 3) return [];
  const thr = Math.max(3, maxCol * 0.15);
  const bands: [number, number][] = [];
  let start = -1, last = -10;
  for (let x = 0; x <= w; x++) {
    const on = x < w && colCount[x] >= thr;
    if (on) { if (start < 0) start = x; last = x; }
    else if (start >= 0 && x - last > 2) { bands.push([start, last]); start = -1; }
  }
  const strips: Strip[] = [];
  for (const [x0, x1] of bands) {
    const bw = x1 - x0 + 1;
    if (bw < Math.max(4, w * 0.015)) continue;
    const cov = new Float32Array(h), str = new Float32Array(h);
    for (let y = 0; y < h; y++) for (let x = x0; x <= x1; x++) if (mask[y * w + x] > 0) { cov[y]++; str[y] += mask[y * w + x]; }
    const lines: { y: number; strength: number }[] = [];
    let ys = -1, yl = -10;
    for (let y = 0; y <= h; y++) {
      const on = y < h && cov[y] >= bw * 0.6;
      if (on) { if (ys < 0) ys = y; yl = y; }
      else if (ys >= 0 && y - yl > 2) {
        let s = 0; for (let k = ys; k <= yl; k++) s += str[k] / bw;
        lines.push({ y: (ys + yl) / 2, strength: s });
        ys = -1;
      }
    }
    if (lines.length === 0) continue;
    // membrane extent: walk up/down from the lines through bright pixels at the band centre
    const cx = Math.round((x0 + x1) / 2);
    let top = Math.floor(lines[0].y), bottom = Math.ceil(lines[lines.length - 1].y);
    const okBright = (y: number) => {
      let bright = 0;
      for (let x = Math.max(0, cx - 2); x <= Math.min(w - 1, cx + 2); x++) {
        const i = y * w + x;
        // membrane = bright, or a pink line pixel (grey window frame / dark plastic stops the walk)
        if (L[i] >= white * 0.6 || (P[i] > 20 && L[i] >= white * 0.3)) bright++;
      }
      return bright >= 3;
    };
    while (top > 0 && okBright(top - 1)) top--;
    while (bottom < h - 1 && okBright(bottom + 1)) bottom++;
    strips.push({ x0, x1, lines, top, bottom });
  }
  return strips;
}

function judge(s: Strip): { verdict: PanelVerdict; reason: string } {
  if (s.lines.length >= 2) return { verdict: "negative", reason: "control and test lines present" };
  const pos = (s.lines[0].y - s.top) / Math.max(1, s.bottom - s.top);
  if (pos < 0.5) return { verdict: "positive", reason: "control line only, no test line" };
  return { verdict: "invalid", reason: "no control line" };
}

/**
 * Reads lateral-flow drug test strips/cups. Competitive assay logic (as printed in kit inserts):
 * control + test line = NEGATIVE, control line only = POSITIVE, no control line = INVALID.
 * Line intensity is ignored (a faint test line still means negative).
 * Assumes the control (C) end is towards the top of the image (or left, for a rotated photo).
 */
export function analyzeLateralFlow(img: RasterImage): LateralFlowResult | null {
  const v = findStrips(toGrid(img, false));
  const h = findStrips(toGrid(img, true));
  const useVertical = v.length >= h.length;
  const strips = useVertical ? v : h;
  if (strips.length === 0) return null;
  const gridW = useVertical ? Math.max(1, img.width) : Math.max(1, img.height);
  const scaleW = Math.max(1, Math.max(img.width, img.height) / 600);
  const wGrid = useVertical ? Math.floor(img.width / scaleW) : Math.floor(img.height / scaleW);
  void gridW;
  const panels: PanelResult[] = strips.map((s, i) => {
    const j = judge(s);
    return { index: i + 1, verdict: j.verdict, lines: s.lines.length, x: (s.x0 + s.x1) / 2 / Math.max(1, wGrid), reason: j.reason, firstLinePos: (s.lines[0].y - s.top) / Math.max(1, s.bottom - s.top) };
  });
  const result = panels.some((p) => p.verdict === "positive") ? "positive" : panels.some((p) => p.verdict === "invalid") ? "inconclusive" : "negative";
  return { panels, result, orientation: useVertical ? "vertical" : "horizontal" };
}
