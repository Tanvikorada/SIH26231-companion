/**
 * Live openFDA Drug Enforcement & Recalls Ingestion Source.
 * Queries the official US FDA openFDA public API for high-risk recalls,
 * counterfeit formulations, and contaminated pharmaceutical compounding agents.
 */

import { safeFetchJson } from "../fetcher.ts";
import { findReagentGuidance } from "./reagentMatcher.ts";
import type { ThreatAlert, ScraperSourceResult, ThreatLevel, ThreatCategory } from "../types.ts";

const FDA_API_URL =
  "https://api.fda.gov/drug/enforcement.json?search=classification:%22Class+I%22+OR+classification:%22Class+II%22&limit=5";

interface OpenFdaRecallRecord {
  recall_number?: string;
  reason_for_recall?: string;
  product_description?: string;
  classification?: string;
  report_date?: string;
  distribution_pattern?: string;
  recalling_firm?: string;
}

interface OpenFdaResponse {
  meta?: {
    last_updated?: string;
    results?: {
      total?: number;
      limit?: number;
    };
  };
  results?: OpenFdaRecallRecord[];
  error?: {
    code?: string;
    message?: string;
  };
}

export async function scrapeOpenFda(limit = 5): Promise<ScraperSourceResult> {
  const sourceName = "US FDA / openFDA";
  const alerts: ThreatAlert[] = [];

  try {
    const url = limit !== 5
      ? `https://api.fda.gov/drug/enforcement.json?search=classification:%22Class+I%22+OR+classification:%22Class+II%22&limit=${limit}`
      : FDA_API_URL;

    const data = await safeFetchJson<OpenFdaResponse>(url);

    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return {
        sourceName,
        alerts: [],
        success: false,
        error: data?.error?.message || "No results returned from openFDA",
      };
    }

    for (const item of data.results) {
      const desc = item.product_description || "Controlled Drug Formulation";
      const reason = item.reason_for_recall || "Official FDA Safety Alert";
      const classification = item.classification || "Class II";
      const combinedText = `${desc} ${reason}`.toLowerCase();

      const substance = extractSubstance(desc);
      const isCritical =
        classification === "Class I" ||
        /fentanyl|opioid|lethal|counterfeit|potent|nitazene/i.test(combinedText);

      const threatLevel: ThreatLevel = isCritical ? "CRITICAL" : "HIGH";

      let category: ThreatCategory = "RECALL";
      if (/counterfeit/i.test(combinedText)) {
        category = "COUNTERFEIT";
      } else if (/adulterat|tranq|xylazine/i.test(combinedText)) {
        category = "ADULTERANT";
      } else if (/contamin|microbiol|particulate/i.test(combinedText)) {
        category = "CONTAMINATION";
      } else if (/opioid/i.test(combinedText)) {
        category = "NOVEL_OPIOID";
      }

      const rawId = item.recall_number
        ? item.recall_number.replace(/[^a-zA-Z0-9-]/g, "")
        : Math.random().toString(36).substring(2, 9).toUpperCase();

      const publishedAt = formatFdaDate(item.report_date);
      const reagentGuidance = findReagentGuidance(substance, combinedText);

      alerts.push({
        id: `FDA-REC-${rawId}`,
        source: sourceName,
        substance,
        category,
        threatLevel,
        publishedAt,
        region: "United States",
        summary: truncate(desc, 90),
        details: reason,
        reagentGuidance,
        status: "ACTIVE",
        url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
      });
    }

    return {
      sourceName,
      alerts,
      success: true,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      sourceName,
      alerts: [],
      success: false,
      error: errorMsg,
    };
  }
}

function extractSubstance(desc: string): string {
  const matches = desc.match(
    /(fentanyl|morphine|codeine|semaglutide|amphetamine|oxycodone|diazepam|alprazolam|methamphetamine|ketamine|cannabinoid|xylazine|heroin|acetaminophen|tramadol|buprenorphine|pregabalin|gabapentin)/i
  );
  if (matches) {
    // Capitalize first letter of each word
    return matches[0].charAt(0).toUpperCase() + matches[0].slice(1).toLowerCase();
  }
  // Extract primary medication token
  const words = desc.split(/[,;\s]+/);
  if (words[0] && words[0].length > 3) {
    return words[0];
  }
  return "Controlled Formulation";
}

function formatFdaDate(raw?: string): string {
  if (!raw || raw.length !== 8) {
    return new Date().toISOString();
  }
  const year = raw.slice(0, 4);
  const month = raw.slice(4, 6);
  const day = raw.slice(6, 8);
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}
