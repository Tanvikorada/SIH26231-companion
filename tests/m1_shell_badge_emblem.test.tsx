import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
}));

import { StampBadge, type StampBadgeProps } from "../src/components/ui/StampBadge";
import { StateEmblem, type StateEmblemProps } from "../src/components/ui/StateEmblem";
import RootLayout from "../src/app/layout";

describe("Milestone 1: StampBadge Component Empirical Verification", () => {
  it("renders properly with { status: 'AUTHENTIC' } without crashing or undefined classNames", () => {
    const html = renderToStaticMarkup(<StampBadge status="AUTHENTIC" />);
    
    // Assert successful rendering
    expect(html).toBeTruthy();
    expect(typeof html).toBe("string");
    
    // Assert no undefined classNames or attributes
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("null");
    
    // Assert text content and role
    expect(html).toContain("AUTHENTIC");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Status: AUTHENTIC"');
    
    // Assert default fallback variant is navy
    expect(html).toContain("border-[var(--color-navy,#003366)]");
    expect(html).toContain("text-[var(--color-navy,#003366)]");
    expect(html).toContain("bg-[#F0F4F8]");
    expect(html).toContain("outline-[var(--color-navy,#003366)]");
    
    // Assert sharp utilitarian borders (no rounded-*)
    expect(html).toContain("rounded-none");
  });

  it("renders properly with { variant: 'navy', text: 'Verified' } without crashing or undefined classNames", () => {
    const html = renderToStaticMarkup(<StampBadge variant="navy" text="Verified" />);
    
    // Assert successful rendering
    expect(html).toBeTruthy();
    expect(typeof html).toBe("string");
    
    // Assert no undefined classNames or attributes
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("null");
    
    // Assert text content and accessibility
    expect(html).toContain("Verified");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Status: Verified"');
    
    // Assert navy variant styling
    expect(html).toContain("border-[var(--color-navy,#003366)]");
    expect(html).toContain("text-[var(--color-navy,#003366)]");
    expect(html).toContain("bg-[#F0F4F8]");
  });

  it("renders all standard variants cleanly without undefined in classNames", () => {
    const variants: StampBadgeProps["variant"][] = ["navy", "brass", "saffron", "green", "danger", "neutral"];
    
    for (const variant of variants) {
      const html = renderToStaticMarkup(<StampBadge variant={variant} text={`Test-${variant}`} />);
      expect(html).not.toContain("undefined");
      expect(html).not.toContain("null");
      expect(html).toContain(`Test-${variant}`);
    }
  });

  it("resolves all semantic test statuses to appropriate variants without undefined classNames", () => {
    const statusMap: Record<string, string> = {
      positive: "border-red-700",
      danger: "border-red-700",
      flagged: "border-red-700",
      negative: "border-[#138808]",
      clear: "border-[#138808]",
      pass: "border-[#138808]",
      inconclusive: "border-[var(--color-brass,#855800)]",
      retest: "border-[var(--color-brass,#855800)]",
      warning: "border-[var(--color-brass,#855800)]",
      pending: "border-[#C2410C]",
      saffron: "border-[#C2410C]",
      verified: "border-[var(--color-navy,#003366)]",
      unknown: "border-[var(--color-navy,#003366)]",
    };

    for (const [status, expectedBorder] of Object.entries(statusMap)) {
      const html = renderToStaticMarkup(<StampBadge status={status} />);
      expect(html).not.toContain("undefined");
      expect(html).toContain(expectedBorder);
    }
  });

  it("handles size variants and subtext properly", () => {
    // sm size
    const smHtml = renderToStaticMarkup(<StampBadge variant="green" text="PASS" size="sm" />);
    expect(smHtml).toContain("text-xs");
    expect(smHtml).not.toContain("undefined");

    // lg size with default subtext
    const lgHtml = renderToStaticMarkup(<StampBadge variant="danger" text="POSITIVE" size="lg" />);
    expect(lgHtml).toContain("NARCOTIC DETECTED");
    expect(lgHtml).toContain("text-base");
    expect(lgHtml).not.toContain("undefined");

    // custom subtext
    const customHtml = renderToStaticMarkup(
      <StampBadge variant="navy" text="SECURE" subtext="CENTRAL FORENSIC LAB" />
    );
    expect(customHtml).toContain("CENTRAL FORENSIC LAB");
    expect(customHtml).not.toContain("undefined");
  });

  it("handles empty / default props safely", () => {
    const html = renderToStaticMarkup(<StampBadge />);
    expect(html).not.toContain("undefined");
    expect(html).toContain("NAVY");
    expect(html).toContain('role="status"');
  });
});

describe("Milestone 1: StateEmblem Component Empirical Verification", () => {
  it("renders valid vector SVG with correct default viewBox and attributes", () => {
    const html = renderToStaticMarkup(<StateEmblem />);
    
    // Assert SVG root element
    expect(html).toContain("<svg");
    expect(html).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-labelledby="stateEmblemTitle stateEmblemDesc"');
    
    // Assert default viewBox including motto
    expect(html).toContain('viewBox="0 0 200 240"');
    
    // Assert title and desc for accessibility
    expect(html).toContain('<title id="stateEmblemTitle">State Emblem of India</title>');
    expect(html).toContain('<desc id="stateEmblemDesc">Lion Capital of Ashoka with Satyameva Jayate</desc>');
    
    // Assert National Motto in Devanagari script
    expect(html).toContain("सत्यमेव जयते");
  });

  it("adjusts viewBox and excludes motto when showMotto is false", () => {
    const html = renderToStaticMarkup(<StateEmblem showMotto={false} />);
    
    // Assert reduced viewBox excluding motto
    expect(html).toContain('viewBox="0 0 200 210"');
    expect(html).not.toContain("सत्यमेव जयते");
  });

  it("renders key anatomical and architectural components of the Lion Capital", () => {
    const html = renderToStaticMarkup(<StateEmblem />);
    
    // Left & right profile lions
    expect(html).toContain("M 58 36"); // left lion path
    expect(html).toContain("M 142 36"); // right lion path
    
    // Central lion
    expect(html).toContain("M 90 32"); // center lion ear
    
    // Ashoka Chakra (central wheel)
    expect(html).toContain('cx="100" cy="163" r="12"');
    
    // Abacus beads / frieze
    expect(html).toContain('rect x="20" y="142" width="160"');
    
    // Galloping horse & charging bull
    expect(html).toContain("M 44 168"); // horse path
    expect(html).toContain("M 126 163"); // bull path
    
    // Lotus pedestal
    expect(html).toContain("M 40 186"); // lotus petal path
  });

  it("supports all color variants cleanly", () => {
    const variants: StateEmblemProps["variant"][] = ["default", "navy", "gold", "white", "monochrome"];
    
    for (const variant of variants) {
      const html = renderToStaticMarkup(<StateEmblem variant={variant} />);
      expect(html).not.toContain("undefined");
      if (variant === "navy") expect(html).toContain("text-[#003366]");
      if (variant === "gold") expect(html).toContain("text-[#854D0E]");
      if (variant === "white") expect(html).toContain("text-white");
    }
  });

  it("calculates proportional dimensions correctly", () => {
    // Numeric size (aspect ratio ~1.2)
    const htmlNum = renderToStaticMarkup(<StateEmblem size={50} />);
    expect(htmlNum).toContain('width="50"');
    expect(htmlNum).toContain('height="60"'); // 50 * 1.2 = 60

    // Explicit width and height
    const htmlCustom = renderToStaticMarkup(<StateEmblem width={80} height={100} />);
    expect(htmlCustom).toContain('width="80"');
    expect(htmlCustom).toContain('height="100"');
  });
});

describe("Milestone 1: RootLayout & GIGW 3.0 Shell Verification", () => {
  it("renders root layout HTML structure without syntax errors or runtime exceptions", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div id="test-child">Child Content</div>
      </RootLayout>
    );

    // Root html and body
    expect(html).toContain('<html lang="en"');
    expect(html).toContain("<body");
    expect(html).toContain("Child Content");

    // Tricolor flag bands
    expect(html).toContain("bg-[#FF9933]");
    expect(html).toContain("bg-[#FFFFFF]");
    expect(html).toContain("bg-[#138808]");

    // Accessibility Skip Link
    expect(html).toContain('href="#main-content"');
    expect(html).toContain("skip-to-content");
    expect(html).toContain("मुख्य सामग्री पर जाएं / Skip to Main Content");

    // Font size controls
    expect(html).toContain('id="font-decrease"');
    expect(html).toContain('id="font-normal"');
    expect(html).toContain('id="font-increase"');

    // High contrast toggle
    expect(html).toContain('id="contrast-toggle"');
    expect(html).toContain('aria-pressed="false"');

    // Language switcher
    expect(html).toContain('id="lang-toggle"');

    // State Emblem integration
    expect(html).toContain("State Emblem of India");
    expect(html).toContain("सत्यमेव जयते");

    // Official titles
    expect(html).toContain("भारत सरकार");
    expect(html).toContain("Government of India");
    expect(html).toContain("National Forensic Drug Testing Laboratory Portal");

    // Navigation links
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('href="/capture"');
    expect(html).toContain('href="/ledger"');
    expect(html).toContain('href="/logs"');

    // Main content landmark
    expect(html).toContain('id="main-content"');
    expect(html).toContain('tabindex="-1"');

    // 4-column footer
    expect(html).toContain("Legal Mandate");
    expect(html).toContain("NDPS Act 1985");
    expect(html).toContain("Website Policies");
    expect(html).toContain("Guidelines for Indian Govt. Websites (GIGW 3.0)");
    expect(html).toContain("Not an official Government of India service");
  });

  it("ensures root layout contains no glassmorphism or background noise", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    expect(html).not.toContain("backdrop-blur");
    expect(html).not.toContain("noise.svg");
    expect(html).not.toContain("radial-gradient");
  });
});
