import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "threat_alerts.json");
    const fileContents = await fs.readFile(dataPath, "utf8");
    const alerts = JSON.parse(fileContents);
    return NextResponse.json(alerts, { status: 200, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' } });
  } catch (error) {
    console.error("Error reading alerts:", error);
    return NextResponse.json([], { status: 200 }); // Fallback to empty array
  }
}
