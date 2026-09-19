#!/usr/bin/env node

/**
 * =============================================================================
 * Automated Comprehensive E2E Verification Suite
 * Project: Forensic Drug Testing Government UI Transformation (UX4G & GIGW 3.0)
 * =============================================================================
 */

import { colors, symbols } from "./helpers.mjs";
import { runTier1 } from "./tier1_feature_coverage.mjs";
import { runTier2 } from "./tier2_boundary_corner.mjs";
import { runTier3 } from "./tier3_cross_feature.mjs";
import { runTier4 } from "./tier4_workflows.mjs";

const ARGS = process.argv.slice(2);
const TIER_ARG = ARGS.find(a => a.startsWith("--tier="))?.split("=")[1];
const SELECTED_TIERS = TIER_ARG ? TIER_ARG.split(",").map(Number) : [1, 2, 3, 4];
const JSON_OUTPUT = ARGS.includes("--json");
const BAIL = ARGS.includes("--bail");

async function main() {
  const startTime = Date.now();

  if (!JSON_OUTPUT) {
    console.log(`\n${colors.bold}${colors.blue}======================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.white}   NCB FORENSIC SUITE: AUTOMATED OPAQUE-BOX E2E VERIFICATION${colors.reset}`);
    console.log(`${colors.dim}   Compliance: Digital India UX4G & GIGW 3.0 Standard${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}\n`);
  }

  const allResults = {
    tier1: [],
    tier2: [],
    tier3: [],
    tier4: [],
  };

  let totalExecuted = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  const tiersToRun = [
    { num: 1, name: "Tier 1: Feature Coverage (Sanitization, Branding, Math & Canvas)", runner: runTier1, key: "tier1" },
    { num: 2, name: "Tier 2: Boundary & Corner Cases (WCAG AA Contrast, Empty States, CSS Tokens)", runner: runTier2, key: "tier2" },
    { num: 3, name: "Tier 3: Cross-Feature Combinations (Route Continuity & Forensic Sync Contract)", runner: runTier3, key: "tier3" },
    { num: 4, name: "Tier 4: Real-World Workflows (Static Typecheck & Production Build)", runner: runTier4, key: "tier4" },
  ];

  for (const tier of tiersToRun) {
    if (!SELECTED_TIERS.includes(tier.num)) continue;

    if (!JSON_OUTPUT) {
      console.log(`${colors.bold}${colors.cyan}▶ RUNNING ${tier.name}${colors.reset}`);
      console.log(`${colors.dim}${"─".repeat(70)}${colors.reset}`);
    }

    try {
      const tierResults = await tier.runner();
      allResults[tier.key] = tierResults;

      for (const res of tierResults) {
        totalExecuted++;
        if (res.pass) {
          totalPassed++;
          if (!JSON_OUTPUT) {
            console.log(`  ${symbols.pass}  ${colors.bold}[${res.id}]${colors.reset} ${res.name}`);
            if (res.details) {
              console.log(`         ${colors.dim}${res.details}${colors.reset}`);
            }
          }
        } else {
          totalFailed++;
          if (!JSON_OUTPUT) {
            console.log(`  ${symbols.fail}  ${colors.bold}${colors.red}[${res.id}]${colors.reset} ${res.name}`);
            if (res.details) {
              console.log(`         ${colors.yellow}${res.details}${colors.reset}`);
            }
            if (res.failureReason) {
              console.log(`         ${colors.red}Reason: ${res.failureReason}${colors.reset}`);
            }
          }
          if (BAIL) {
            if (!JSON_OUTPUT) console.log(`\n${colors.red}--bail flag set: Halting execution on first failure.${colors.reset}`);
            break;
          }
        }
      }
    } catch (tierError) {
      totalExecuted++;
      totalFailed++;
      if (!JSON_OUTPUT) {
        console.log(`  ${symbols.fail}  ${colors.bold}${colors.red}[CRITICAL]${colors.reset} Tier execution crashed: ${tierError.message}`);
      }
      allResults[tier.key].push({
        id: `T${tier.num}.CRASH`,
        name: `${tier.name} Crash`,
        pass: false,
        details: tierError.message,
        failureReason: tierError.stack,
      });
    }

    if (!JSON_OUTPUT) console.log();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const passRate = totalExecuted > 0 ? ((totalPassed / totalExecuted) * 100).toFixed(1) : "0.0";

  if (JSON_OUTPUT) {
    console.log(JSON.stringify({
      summary: {
        totalExecuted,
        totalPassed,
        totalFailed,
        passRate: `${passRate}%`,
        durationSeconds: Number(durationSec),
        success: totalFailed === 0,
      },
      results: allResults,
    }, null, 2));
  } else {
    console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.white}   E2E VERIFICATION SUMMARY MATRIX${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}`);
    console.log(`  Total Checks Executed : ${totalExecuted}`);
    console.log(`  Passed Checks         : ${colors.green}${totalPassed}${colors.reset}`);
    console.log(`  Failed Checks         : ${totalFailed > 0 ? colors.red : colors.green}${totalFailed}${colors.reset}`);
    console.log(`  Success Rate          : ${totalFailed === 0 ? colors.green : colors.yellow}${passRate}%${colors.reset}`);
    console.log(`  Execution Time        : ${durationSec}s`);
    console.log(`${colors.dim}${"─".repeat(70)}${colors.reset}`);

    for (const tier of tiersToRun) {
      if (!SELECTED_TIERS.includes(tier.num)) continue;
      const list = allResults[tier.key] || [];
      const passed = list.filter(r => r.pass).length;
      const total = list.length;
      const statusSymbol = passed === total ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL (${total - passed} defects)${colors.reset}`;
      console.log(`  Tier ${tier.num} [${tier.name.split(":")[1].trim()}] : ${passed}/${total} [${statusSymbol}]`);
    }

    console.log(`${colors.bold}${colors.blue}======================================================================${colors.reset}\n`);

    if (totalFailed > 0) {
      console.log(`${colors.red}${colors.bold}VERIFICATION FAILED: ${totalFailed} defect(s) detected.${colors.reset}\n`);
    } else {
      console.log(`${colors.green}${colors.bold}VERIFICATION PASSED: All ${totalPassed} checks succeeded!${colors.reset}\n`);
    }
  }

  process.exit(totalFailed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal runner error:", err);
  process.exit(1);
});
