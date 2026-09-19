import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, "..");

/**
 * ANSI Color Helpers for clean CLI output
 */
export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
};

export const symbols = {
  pass: `${colors.green}✔ PASS${colors.reset}`,
  fail: `${colors.red}✖ FAIL${colors.reset}`,
  warn: `${colors.yellow}⚠ WARN${colors.reset}`,
  bullet: "•",
};

/**
 * Recursively find all files matching extensions within a directory
 */
export function scanFiles(dir, extensions = [".ts", ".tsx", ".css", ".js", ".jsx"], ignoreDirs = ["node_modules", ".next", ".git", ".agents", "tests"]) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name)) {
          walk(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(path.join(currentDir, entry.name));
        }
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Read file contents as UTF-8 string
 */
export function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Search files for regex pattern matches with line numbers
 */
export function searchInFiles(pattern, files) {
  const matches = [];
  for (const file of files) {
    const content = readFile(file);
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (pattern.test(line)) {
        matches.push({
          file: path.relative(PROJECT_ROOT, file),
          line: idx + 1,
          content: line.trim(),
        });
      }
    });
  }
  return matches;
}

/**
 * Parse hex color to RGB [r, g, b]
 */
export function hexToRgb(hex) {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Convert 8-bit sRGB channel to linear light per WCAG 2.1 formula
 */
function sRGBtoLin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance per WCAG 2.1
 */
export function getLuminance(rgb) {
  const r = sRGBtoLin(rgb[0]);
  const g = sRGBtoLin(rgb[1]);
  const b = sRGBtoLin(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG 2.1 contrast ratio between two colors
 */
export function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const top = Math.max(l1, l2);
  const bot = Math.min(l1, l2);
  return (top + 0.05) / (bot + 0.05);
}

/**
 * Dynamically load `src/lib/engine.ts` using Vite SSR loader
 */
export async function loadEngineModule() {
  const { createServer } = await import("vite");
  const server = await createServer({
    root: PROJECT_ROOT,
    logLevel: "silent",
    server: { middlewareMode: true },
  });

  try {
    const enginePath = path.resolve(PROJECT_ROOT, "src/lib/engine.ts");
    const mod = await server.ssrLoadModule(enginePath);
    return { mod, close: () => server.close() };
  } catch (err) {
    await server.close();
    throw err;
  }
}

/**
 * Run shell command asynchronously with timeout
 */
export function executeCommand(command, cwd = PROJECT_ROOT, timeoutMs = 90000, extraEnv = {}) {
  const cleanEnv = { ...process.env, NODE_ENV: "production", ...extraEnv };
  return new Promise((resolve) => {
    exec(command, { cwd, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024, env: cleanEnv }, (error, stdout, stderr) => {
      resolve({
        code: error ? error.code || 1 : 0,
        stdout: stdout || "",
        stderr: stderr || "",
        error,
      });
    });
  });
}
