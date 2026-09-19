# Original User Request

## 2026-09-19T16:24:50Z

# Teamwork Project Prompt — Draft

> Status: Launched.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Rewrite the front-end user interface of a Next.js (App Router) forensic drug-testing application to strictly conform to the Digital India UX4G design system and GIGW 3.0 (Guidelines for Indian Government Websites), replacing the existing "startup/glassmorphic" aesthetic with a highly authoritative, utilitarian, and accessible government design.

Working directory: c:\Users\Thanvi\OneDrive\Desktop\drug testing
Integrity mode: demo

## Requirements

### R1. Government Branding and Aesthetics
Remove all glassmorphism, background noise SVGs, spring animations, and pastel gradients. Implement a strict, high-contrast color palette derived from the Indian flag and DBIM (Digital Brand Identity Manual): stark white backgrounds, deep Navy Blue headers/accents, and functional semantic colors (Saffron/Green). Buttons and inputs must be solid, high-contrast, and strictly utilitarian (WCAG 2.1 Level AA compliant). 

### R2. Layout and Structure
Replace the "Bento-Box" layout on the dashboard with a traditional, dense, information-heavy government portal layout. Use a prominent top header navigation with official placeholders (e.g., space for the National Emblem). Data should be presented in clean, borders-and-tables structures rather than floating floating cards. 

### R3. Maintain Core Functionality
Do NOT alter the underlying forensic CIEDE2000 math, the SHA-256 hashing logic, the hidden canvas pixel extraction, or the Prisma database connections. Only the visual presentation layers (Tailwind classes, layouts, component structures) in `src/app/` should be rewritten.

## Acceptance Criteria

### Visual Compliance
- [ ] No `backdrop-blur`, `bg-gradient-to-*`, or complex `framer-motion` spring animations exist in the final codebase.
- [ ] Primary headers and active interactive elements utilize Navy Blue or strict DBIM semantic colors.
- [ ] The dashboard layout utilizes a traditional column or grid-based layout suited for high information density, rather than sparse "bento" cards.

### Functional Integrity
- [ ] The forensic scanning workflow (Extracting -> Math -> Hashing -> Syncing) still operates perfectly from a functional standpoint.
- [ ] The app builds successfully (`npm run build`) without Tailwind or TypeScript compilation errors.

## 2026-09-19T17:32:33Z

# Teamwork Project Prompt — Draft

> Status: Launched.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Enhance the core forensic analysis engine of a Next.js application by calibrating the CIEDE2000 math for high accuracy, and build a web scraping pipeline to ingest live drug threat data.

Working directory: c:\Users\Thanvi\OneDrive\Desktop\drug testing
Integrity mode: development

## Requirements

### R1. Core Accuracy Calibration
Overhaul the existing `src/lib/engine.ts` colorimetric logic. The CIEDE2000 math must be calibrated to handle real-world lighting variance (shadows, overexposure). It should accurately map raw RGB camera inputs to known reagent color profiles.

### R2. Web Scraping Data Pipeline
Implement a web scraping module (e.g., using Puppeteer, Cheerio, or standard fetch) that can pull live drug alerts, emerging threat data, and official colorimetric references from public health/government sources. 

### R3. Safe Infrastructure Constraints
The web scraping module must respect `robots.txt`, implement reasonable rate-limiting (e.g., waiting between requests), and handle network failures gracefully without crashing the main application.

## Acceptance Criteria

### Accuracy Verification
- [ ] An automated test suite (`npm run test`) exists that runs the CIEDE2000 engine against a matrix of synthetic mock colors under varying simulated lighting conditions.
- [ ] The test suite must programmatically verify that the engine successfully classifies at least 95% of the mock samples to the correct reagent profile.

### Scraping Verification
- [ ] The scraping module can be executed via a programmatic command (e.g., `npm run scrape`) and successfully outputs a parsed, structured JSON file of threat data without encountering blocking errors.
- [ ] The dashboard UI successfully reads and displays the scraped threat data in a dedicated "Live Alerts" tabular section.
