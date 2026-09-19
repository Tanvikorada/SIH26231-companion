import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "threat_alerts.json");
    const fileContents = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(fileContents);
    const alertList = parsed.alerts ?? (Array.isArray(parsed) ? parsed : []);

    if (!alertList || alertList.length === 0) {
      throw new Error("Empty alerts in cache");
    }

    return NextResponse.json(
      {
        success: true,
        source: "live_cache",
        lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
        count: alertList.length,
        sourcesScraped: parsed.sourcesScraped ?? [],
        alerts: alertList,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.warn("Live cache read failed or empty, loading bundled fallback alerts:", error);
    try {
      const fallbackPath = path.join(process.cwd(), "src", "data", "threat_alerts_fallback.json");
      const fallbackContents = await fs.readFile(fallbackPath, "utf8");
      const fallbackData = JSON.parse(fallbackContents);
      const fallbackAlerts = fallbackData.alerts ?? (Array.isArray(fallbackData) ? fallbackData : []);

      return NextResponse.json(
        {
          success: true,
          source: "fallback",
          lastUpdated: fallbackData.lastUpdated ?? new Date().toISOString(),
          count: fallbackAlerts.length,
          sourcesScraped: fallbackData.sourcesScraped ?? [],
          alerts: fallbackAlerts,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    } catch (fallbackErr) {
      console.error("Critical: Failed to load fallback alerts:", fallbackErr);
      return NextResponse.json(
        {
          success: false,
          source: "fallback",
          count: 0,
          alerts: [],
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    }
  }
}
