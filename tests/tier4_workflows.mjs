import { executeCommand } from "./helpers.mjs";

/**
 * Run Tier 4 - Real-World Workflows Tests
 * @returns {Promise<Array<{ id: string, name: string, pass: boolean, details: string, failureReason?: string }>>}
 */
export async function runTier4() {
  const results = [];

  // =========================================================================
  // 4.1 TypeScript Static Typecheck (`npx tsc --noEmit`)
  // =========================================================================
  {
    const { code, stdout, stderr } = await executeCommand("npx tsc --noEmit", undefined, 90000);
    const pass = code === 0;
    results.push({
      id: "T4.1",
      name: "TypeScript static typecheck ('npx tsc --noEmit' exits 0)",
      pass,
      details: pass
        ? "TypeScript static type analysis passed with 0 errors."
        : `tsc exited with code ${code}.\n${stderr || stdout}`,
      failureReason: pass ? undefined : "TypeScript compilation must complete with zero type errors.",
    });
  }

  // =========================================================================
  // 4.2 Production Application Build (`npm run build`)
  // =========================================================================
  {
    const { code, stdout, stderr } = await executeCommand("npm run build", undefined, 120000);
    const pass = code === 0;
    results.push({
      id: "T4.2",
      name: "Production application build ('npm run build' exits 0)",
      pass,
      details: pass
        ? "Next.js production build succeeded with Turbopack and static page generation."
        : `npm run build exited with code ${code}.\n${stderr || stdout}`,
      failureReason: pass ? undefined : "Next.js production build must compile and optimize cleanly with zero errors.",
    });
  }

  return results;
}
