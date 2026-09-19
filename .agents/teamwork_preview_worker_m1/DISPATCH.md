## 2026-09-19T16:36:45Z
You are Worker M1 (Milestone 1 Implementation Worker).
Your identity:
- Archetype: teamwork_preview_worker
- Role: Milestone 1 Implementation Worker
- Working directory: c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m1

MANDATORY FIRST STEP: Read ORIGINAL_REQUEST.md and PROJECT.md at:
- c:\Users\Thanvi\OneDrive\Desktop\drug testing\ORIGINAL_REQUEST.md
- c:\Users\Thanvi\OneDrive\Desktop\drug testing\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY EXPLORER BLUEPRINTS TO READ BEFORE EDITING:
1. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_m1_1\m1_token_plan.md`
2. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_m1_2\m1_shell_plan.md`
3. `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_m1_3\m1_assets_plan.md`
4. Ready-to-use component source: `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_m1_3\proposed_StateEmblem.tsx`
5. Ready-to-use component source: `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_explorer_m1_3\proposed_StampBadge.tsx`

Your Exclusive File Write Ownership:
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/ui/StampBadge.tsx`
- `src/components/ui/StateEmblem.tsx`
- `public/` (remove or clear noise.svg)

STRICT BOUNDARIES (DO NOT TOUCH):
- `src/lib/engine.ts`, `src/lib/color_library.json`, `src/lib/prisma.ts`, `prisma/schema.prisma`, `src/app/api/v1/**`.
- `src/app/dashboard/**`, `src/app/capture/**`, `src/app/ledger/**`, `src/app/logs/**`, `src/app/result/**`.

Tasks to Implement:
1. Update `src/app/globals.css`:
   - Define all DBIM and UX4G design tokens in both `@theme inline` and `:root` (including `--color-navy: #003366`, `--color-brass: #855800`, saffron, green, stark white, dense border styles, skip-to-content styling, accessible high-contrast mode, print styling).
   - Remove any radial gradient dot patterns, noise references, or spring animation utilities.
2. Create `src/components/ui/StateEmblem.tsx`:
   - Copy or implement the official vector State Emblem of India (Ashoka Lion Capital with "सत्यमेव जयते") from `proposed_StateEmblem.tsx`.
3. Update `src/components/ui/StampBadge.tsx`:
   - Implement the utilitarian, official government verification stamp badge from `proposed_StampBadge.tsx`. Support both `{ status }` and `{ variant, text }`. Remove all rotation (`rotate-[-5deg]`) and spring animations.
4. Update `src/app/layout.tsx`:
   - Remove `noise.svg` overlay, radial dot gradient, and pastel tricolor gradient bar.
   - Implement the GIGW 3.0 3-Tier Header:
     - Tier 1: Top Accessibility Bar (Skip to Content, भारत सरकार | Government of India, A-/A/A+ font resizer, Contrast toggle, Language switch).
     - Tier 2: Ministry & Portal Identity Header with `StateEmblem`, bilingual portal title ("राष्ट्रीय फोरेंसिक औषधि परीक्षण पोर्टल" / "National Forensic Drug Testing Laboratory Portal"), and official regulatory seal.
     - Tier 3: Main Navigation Bar in Navy Blue (`#003366`) with links to `/dashboard`, `/capture`, `/ledger`, `/logs` and active indicator.
   - Implement the GIGW 3.0 4-column Government Footer with NIC attribution, legal mandates, and policy links.
5. Remove or clear `public/noise.svg`.
6. Run verification commands:
   - `npx tsc --noEmit` (must exit 0)
   - `npm run build` (must exit 0)

Output Requirements:
- Document all modified files and verification results in: `c:\Users\Thanvi\OneDrive\Desktop\drug testing\.agents\teamwork_preview_worker_m1\handoff.md`.
- Send completion message to parent when finished.
