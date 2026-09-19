import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GET } from "../src/app/api/v1/alerts/route";
import { StampBadge } from "../src/components/ui/StampBadge";
import { StateEmblem } from "../src/components/ui/StateEmblem";
import Dashboard from "../src/app/dashboard/page";

describe("Milestone 3: Alerts API Route Handler (/api/v1/alerts)", () => {
  it("GET returns HTTP 200 with structured alerts payload and cache control headers", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const headers = response.headers;
    expect(headers.get("Cache-Control")).toContain("no-cache");
    expect(headers.get("Cache-Control")).toContain("no-store");

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(["live_cache", "fallback"]).toContain(data.source);
    expect(Array.isArray(data.alerts)).toBe(true);
    expect(data.alerts.length).toBeGreaterThan(0);

    // Verify first alert structure adheres to ThreatAlert schema
    const firstAlert = data.alerts[0];
    expect(firstAlert).toHaveProperty("id");
    expect(firstAlert).toHaveProperty("source");
    expect(firstAlert).toHaveProperty("substance");
    expect(firstAlert).toHaveProperty("threatLevel");
    expect(firstAlert).toHaveProperty("publishedAt");
    expect(firstAlert).toHaveProperty("summary");
  });

  it("Alerts contain colorimetric reagentGuidance for substances matching field kits", async () => {
    const response = await GET();
    const data = await response.json();

    const alertsWithReagent = data.alerts.filter((a: any) => a.reagentGuidance);
    expect(alertsWithReagent.length).toBeGreaterThan(0);

    const guidance = alertsWithReagent[0].reagentGuidance;
    expect(guidance).toHaveProperty("reagent");
    expect(guidance).toHaveProperty("expectedReaction");
  });
});

describe("Milestone 3: Live Alerts Dashboard UI Empirical Verification", () => {
  it("renders Dashboard with StateEmblem (size 44, variant navy) without crashing", () => {
    const html = renderToStaticMarkup(<Dashboard />);
    expect(html).toBeTruthy();
    expect(html).toContain("State Emblem of India");
    expect(html).toContain("सत्यमेव जयते");
    expect(html).toContain("text-[#003366]");
  });

  it("renders bilingual Live Alerts header adhering to GIGW 3.0 / UX4G", () => {
    const html = renderToStaticMarkup(<Dashboard />);
    expect(html).toContain("राष्ट्रीय मादक पदार्थ चेतावनी प्रणाली");
    expect(html).toContain("National Drug Threat Advisories &amp; Early Warning System");
    expect(html).toContain("FEED ACTIVE");
  });

  it("renders all 5 dense data table columns in the Live Alerts tabular section", () => {
    const html = renderToStaticMarkup(<Dashboard />);
    expect(html).toContain("Advisory ID &amp; Date (IST)");
    expect(html).toContain("Threat Level");
    expect(html).toContain("Substance &amp; Classification");
    expect(html).toContain("Originating Agency &amp; Region");
    expect(html).toContain("Advisory Summary &amp; Reagent Marker");
  });

  it("renders filter controls (ALL, CRITICAL, HIGH, ELEVATED) and refresh button", () => {
    const html = renderToStaticMarkup(<Dashboard />);
    expect(html).toContain("ALL");
    expect(html).toContain("CRITICAL");
    expect(html).toContain("HIGH");
    expect(html).toContain("ELEVATED");
    expect(html).toContain("Refresh Feed");
    expect(html).toContain("Filter substance, agency, ID...");
  });

  it("renders StampBadge sm correctly for each threat level", () => {
    const criticalBadge = renderToStaticMarkup(<StampBadge size="sm" variant="danger" text="CRITICAL" />);
    const highBadge = renderToStaticMarkup(<StampBadge size="sm" variant="saffron" text="HIGH" />);
    const elevatedBadge = renderToStaticMarkup(<StampBadge size="sm" variant="brass" text="ELEVATED" />);
    const advisoryBadge = renderToStaticMarkup(<StampBadge size="sm" variant="navy" text="ADVISORY" />);

    expect(criticalBadge).toContain("CRITICAL");
    expect(highBadge).toContain("HIGH");
    expect(elevatedBadge).toContain("ELEVATED");
    expect(advisoryBadge).toContain("ADVISORY");

    // All must be compact (sm) and have status role
    expect(criticalBadge).toContain('role="status"');
    expect(highBadge).toContain('role="status"');
    expect(elevatedBadge).toContain('role="status"');
    expect(advisoryBadge).toContain('role="status"');
  });
});
