/**
 * Colorimetric Reagent Cross-Referencer.
 * Cross-references substance names with src/lib/color_library.json
 * and forensic literature to attach official spot-test guidance.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ReagentGuidance } from "../types.ts";

export interface ColorLibraryEntry {
  reagent: string;
  drug: string;
  positive_rgb: [number, number, number];
  negative_rgb: [number, number, number];
}

let cachedLibrary: ColorLibraryEntry[] | null = null;

function getBaseDir(): string {
  if (typeof __dirname !== "undefined") return __dirname;
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
}

function loadLibrary(): ColorLibraryEntry[] {
  if (cachedLibrary) return cachedLibrary;

  const baseDir = getBaseDir();
  const candidatePaths = [
    path.resolve(process.cwd(), "src/lib/color_library.json"),
    path.resolve(baseDir, "../../color_library.json"),
    path.resolve(baseDir, "../../../lib/color_library.json"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        cachedLibrary = JSON.parse(raw);
        return cachedLibrary!;
      }
    } catch {
      // Continue to next path
    }
  }

  // Built-in core references if file cannot be read
  cachedLibrary = [
    { reagent: "Marquis", drug: "Morphine Sulfate", positive_rgb: [16, 6, 13], negative_rgb: [215, 209, 199] },
    { reagent: "Marquis", drug: "Heroin", positive_rgb: [17, 7, 14], negative_rgb: [165, 161, 156] },
    { reagent: "Marquis", drug: "Codeine", positive_rgb: [25, 11, 23], negative_rgb: [177, 171, 167] },
    { reagent: "Marquis", drug: "Amphetamine", positive_rgb: [139, 48, 14], negative_rgb: [182, 173, 157] },
    { reagent: "Marquis", drug: "Methamphetamine", positive_rgb: [137, 53, 17], negative_rgb: [169, 157, 136] },
    { reagent: "Marquis", drug: "Fentanyl", positive_rgb: [185, 135, 26], negative_rgb: [176, 161, 141] },
    { reagent: "Cobalt", drug: "Thiocyanate Cocaine HCl", positive_rgb: [2, 65, 121], negative_rgb: [194, 146, 158] },
    { reagent: "Marquis", drug: "Diazepam", positive_rgb: [163, 156, 132], negative_rgb: [168, 162, 154] },
  ];
  return cachedLibrary!;
}

/**
 * Finds reagent guidance for a given substance and context.
 */
export function findReagentGuidance(substance: string, contextText = ""): ReagentGuidance | undefined {
  const combined = `${substance} ${contextText}`.toLowerCase();

  // 1. Emerging Novel Synthetic Opioids (Nitazenes)
  if (/nitazen|protonitazep|isotonitazep|metonitazep|etonitazep/i.test(combined)) {
    return {
      reagent: "Marquis / Strip",
      expectedReaction: "Yellow-brown delayed reaction (reagent does not confirm nitazene; test strip required)",
      rgbTarget: [180, 150, 40],
      cautionNote: "High potency synthetic opioid (up to 20-40x fentanyl). Reagent presumptive only; requires GC-MS or immunoassay.",
    };
  }

  // 2. Medetomidine / Xylazine Adulterants
  if (/xylazine|medetomidine|tranq/i.test(combined)) {
    return {
      reagent: "Marquis / Xylazine Strip",
      expectedReaction: "No direct Marquis color change; Marquis detects base opioid while adulterant remains masked",
      rgbTarget: [16, 6, 13],
      cautionNote: "Non-opioid alpha-2 agonist unresponsive to naloxone. Use dedicated test strip.",
    };
  }

  // 3. Novel Benzodiazepines (Bromazolam, Clonazolam, Flubromazolam)
  if (/bromazolam|clonazolam|flubromazolam|etizolam|desalkylgidazepam/i.test(combined)) {
    return {
      reagent: "Zimmerman / Marquis",
      expectedReaction: "Faint grey-brown to no reaction with Marquis; purple-violet with Zimmerman reagent",
      rgbTarget: [140, 110, 150],
      cautionNote: "Reagent reaction frequently masked by excipients in pressed counterfeit tablets.",
    };
  }

  // 4. Synthetic Cannabinoids
  if (/synthetic cannabinoid|spice|k2|mdmb|pinaca|fubinaca/i.test(combined)) {
    return {
      reagent: "Duquenois-Levine",
      expectedReaction: "Inconclusive / No violet layer (synthetic cannabinoids lack natural THC chromophore)",
      rgbTarget: [150, 150, 150],
      cautionNote: "Rapidly mutating indazole/indole core structures require LC-MS/MS confirmation.",
    };
  }

  // 5. Query color_library.json for exact or word-boundary match
  const library = loadLibrary();
  const normalizedSubstance = substance.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();

  const candidateEntries: ColorLibraryEntry[] = [];

  // Phase 1: Exact match
  for (const entry of library) {
    const entryDrug = entry.drug.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    if (entryDrug === normalizedSubstance) {
      candidateEntries.push(entry);
    }
  }

  // Phase 2: Word-boundary token match if no exact match found
  if (candidateEntries.length === 0) {
    for (const entry of library) {
      const entryDrug = entry.drug.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
      const drugTokens = entryDrug
        .split(/\s+/)
        .filter((t) => t.length > 3 && t !== "sulfate" && t !== "acid" && t !== "test" && t !== "base" && t !== "salt");

      const matchesWordBoundary = drugTokens.some((token) => {
        const regex = new RegExp(`\\b${token}\\b`, "i");
        return regex.test(normalizedSubstance);
      });

      if (matchesWordBoundary) {
        candidateEntries.push(entry);
      }
    }
  }

  if (candidateEntries.length > 0) {
    // Prefer Marquis as the primary field reagent if available
    const chosen = candidateEntries.find((e) => e.reagent.toLowerCase() === "marquis") || candidateEntries[0];
    const colorDesc = describeRgb(chosen.positive_rgb);
    return {
      reagent: chosen.reagent,
      expectedReaction: `${colorDesc} (RGB: ${chosen.positive_rgb.join(", ")})`,
      rgbTarget: chosen.positive_rgb,
      cautionNote: "Standard forensic presumptive spot test. Observe within 10-30 seconds.",
    };
  }

  return undefined;
}

function describeRgb([r, g, b]: [number, number, number]): string {
  if (r < 30 && g < 30 && b < 30) return "Dark Violet / Black";
  if (r > 150 && g < 100 && b < 50) return "Orange to Reddish-Brown";
  if (r < 50 && g > 50 && b > 100) return "Cobalt Blue";
  if (r > 150 && g > 120 && b < 50) return "Yellow to Golden-Brown";
  if (r > 150 && g < 150 && b > 150) return "Violet / Purple";
  return "Characteristic Color Change";
}
