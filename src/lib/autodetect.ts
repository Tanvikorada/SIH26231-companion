import { rgb2lab, deltaE00 } from "./engine";

export interface RasterImage {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
  channels?: number;
}

export interface AutoDetectResult {
  white: number[];
  spot: number[];
  spotX: number;
  spotY: number;
  /** deltaE between spot and estimated white: how strongly the spot stands out */
  contrast: number;
  /** true when the estimated white is bright and consistent enough to trust as an illuminant */
  whiteReliable: boolean;
}

function pixel(img: RasterImage, x: number, y: number) {
  const ch = img.channels ?? 4;
  const cx = Math.min(img.width - 1, Math.max(0, Math.round(x)));
  const cy = Math.min(img.height - 1, Math.max(0, Math.round(y)));
  const o = (cy * img.width + cx) * ch;
  return [img.data[o], img.data[o + 1], img.data[o + 2]];
}

function meanAt(img: RasterImage, x: number, y: number, r: number, pts = 5) {
  const acc = [0, 0, 0];
  const luma: number[] = [];
  let n = 0;
  for (let j = 0; j < pts; j++) {
    for (let i = 0; i < pts; i++) {
      const p = pixel(img, x + ((i / (pts - 1)) * 2 - 1) * r, y + ((j / (pts - 1)) * 2 - 1) * r);
      acc[0] += p[0]; acc[1] += p[1]; acc[2] += p[2]; n++;
      luma.push(p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114);
    }
  }
  const mean = acc.map((v) => v / n);
  const ml = luma.reduce((a, b) => a + b, 0) / luma.length;
  const sd = Math.sqrt(luma.reduce((a, b) => a + (b - ml) * (b - ml), 0) / luma.length);
  return { mean, sd, luma: ml };
}

/**
 * Reference-free analysis: estimate the illuminant from the brightest surfaces (white plate / paper)
 * and locate the reagent spot as a uniform patch that differs from the white surface surrounding it.
 * Returns null when no spot can be found.
 */
export function autoDetectSpot(img: RasterImage): AutoDetectResult | null {
  const step = Math.max(1, Math.floor(Math.min(img.width, img.height) / 120));
  const samples: number[][] = [];
  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      const p = pixel(img, x, y);
      samples.push([p[0], p[1], p[2], p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114]);
    }
  }
  samples.sort((a, b) => b[3] - a[3]);
  const top = samples.slice(0, Math.max(10, Math.floor(samples.length * 0.06)));
  const white = [0, 1, 2].map((k) => Math.round(top.reduce((a, s) => a + s[k], 0) / top.length));
  const whiteLuma = white[0] * 0.299 + white[1] * 0.587 + white[2] * 0.114;
  const topSd = Math.sqrt(top.reduce((a, s) => a + Math.pow(s[3] - whiteLuma, 2), 0) / top.length);
  const whiteReliable = whiteLuma >= 90 && topSd < 25;

  const whiteLab = rgb2lab(white);
  let best: { x: number; y: number; score: number; mean: number[]; r: number } | null = null;

  // Spot size relative to the frame is unknown, so search several scales.
  for (const frac of [0.018, 0.028, 0.042, 0.06]) {
    const r = Math.max(4, Math.round(Math.min(img.width, img.height) * frac));
    const ringR = r * 3.4;
    const stride = Math.max(2, Math.round(r * 0.8));
    for (let y = ringR; y < img.height - ringR; y += stride) {
      for (let x = ringR; x < img.width - ringR; x += stride) {
        const cell = meanAt(img, x, y, r * 0.7);
        if (cell.sd > 14) continue; // spot interior must be uniform
        let ringOk = 0;
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          const p = pixel(img, x + Math.cos(ang) * ringR, y + Math.sin(ang) * ringR);
          const pl = p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114;
          if (pl >= whiteLuma * 0.72) ringOk++;
        }
        if (ringOk < 7) continue; // must be surrounded by the bright surface
        const score = deltaE00(rgb2lab(cell.mean), whiteLab);
        if (!best || score > best.score) best = { x, y, score, mean: cell.mean, r };
      }
    }
  }
  if (!best || best.score < 12) return null;

  // refine: average a small window at the best position
  const fine = meanAt(img, best.x, best.y, best.r * 0.35, 9);
  return {
    white,
    spot: fine.mean.map(Math.round),
    spotX: best.x,
    spotY: best.y,
    contrast: best.score,
    whiteReliable,
  };
}
