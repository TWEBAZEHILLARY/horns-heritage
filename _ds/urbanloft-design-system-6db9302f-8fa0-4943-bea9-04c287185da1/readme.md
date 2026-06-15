# UrbanLoft Design System

UrbanLoft is a modern, urban, architecturally inspired design system for commercial real estate and urban property platforms. Its monochromatic foundation of **charcoal and concrete** is punctuated by **precise blue accents**, reflecting the clean lines of contemporary architecture. The system emphasizes structure, data clarity, and professional presentation.

This project is the design system itself — token CSS, reusable React components, foundation specimen cards, and a product UI kit. A consuming project links one file: **`styles.css`**.

> **Sources.** This system was authored from a written brand specification (no codebase or Figma was provided). If a source repo or Figma file exists, link it here so future editors can reconcile against it.

---

## Content fundamentals — how UrbanLoft writes

The voice is **institutional, precise, and quietly confident** — a brokerage that respects your time.

- **Tone:** professional and architectural, never playful or salesy. State facts; let the property and the data speak.
- **Person:** address the user as **"you"** for actions ("List your space", "Save this search"); describe inventory in the **third person** ("540 Mott St is available now").
- **Casing:** Sentence case for headings and body. **UPPERCASE with 0.5px tracking** for chips, status labels, and category tags only — this is a deliberate institutional signal, used nowhere else.
- **Numbers & data:** always set in **JetBrains Mono** for tabular alignment — rents, square footage, cap rates, lease terms. Use real units ($/mo, sqft, RSF, NNN). Abbreviate industry terms and explain them in a Tooltip rather than inline.
- **Emoji:** never. No exclamation points in product copy.
- **Vibe examples:**
  - CTA: "List Property" · "Schedule a Tour" · "Request Financials" (verb-led, no fluff)
  - Status: "Available" · "Pending" · "Off-market" · "New Development"
  - Empty state: "No listings match these filters. Widen your area or clear filters."
  - Microcopy: "Monthly, excludes CAM" · "Net rentable area" — terse, parenthetical-free where possible.

---

## Visual foundations

**Color & rhythm.** The primary visual rhythm is **charcoal (#1C1917) on white (#FFFFFF)**, over a soft concrete page background (#FAFAFA). Greys (concrete #9CA3AF, stone scale) carry borders and secondary text. **Accent blue (#2563EB) is reserved strictly for interactive elements** — links and the occasional highlight — never for decorative fills or primary buttons (primary buttons are charcoal). Semantic colors (green/amber/red/blue) appear only as status. No warm or playful hues; the palette is strictly architectural.

**Imagery.** High-quality architectural photography with minimal filters — neutral-to-cool, true-to-life, no heavy grading or vignettes. Images sit in the top slot of cards with a `4px 4px 0 0` radius. When photography is absent, use a quiet charcoal→stone gradient placeholder rather than inventing content.

**Type.** Geometric **Space Grotesk** for all headlines (Display 40 → H4 16), humanist **Inter** for body (18/16/14/12), **JetBrains Mono** for all numeric/tabular data and code. Headlines are tight (1.15–1.35 line height); body is generous (1.5–1.6). Never use decorative or rounded display faces — Space Grotesk's precision is the point.

**Spacing & layout.** 8px base unit (xs 4 → 3xl 64). Layouts echo **architectural floor plans**: clean grids, structured data tables, generous gutters, strong alignment. Lean on CSS grid. Lease/financial data belongs in mono-set tables.

**Corners & borders.** A consistent, subtle **4px radius** on buttons, cards, and inputs (2px on chips/badges, 6px modals, 8px large containers, full for avatars/status dots). Borders are hairline **#E7E5E4**; controls use **#D6D3D1**; dividers **#F5F5F4**. Sharper corners reinforce the modern, urban identity — never round things heavily.

**Elevation.** Deliberately understated, architectural shadows — all near-black at very low opacity: `sm` (chips/buttons), `default` (cards/dropdowns), `md` (elevated cards), `lg` (modals/panels). Default cards carry **no shadow at all** — just a hairline border. Avoid heavy drop shadows.

**Cards.** Two kinds: **Default** (white, 1px #E7E5E4 border, no shadow, 4px radius) and **Elevated** (white, no border, md shadow, 4px radius). Optional top image slot and an optional **dark charcoal header strip** (white uppercase text) for property-type labels. 24px body padding.

**Animation.** Restrained and functional. ~120–150ms ease transitions on hover/focus/border. Tooltips: 150ms show, instant hide. No bounces, no infinite decorative loops, no parallax.

**States.** Hover darkens fills (charcoal → #0C0A09; subtle stone tints on quiet variants). Focus on inputs = 2px charcoal border + 3px #1C191718 ring; error = 2px red + 3px red ring. Disabled = 0.4 opacity + not-allowed cursor, all hover/focus suppressed. Press states stay subtle — color shift, no shrink/scale.

**Transparency & blur.** Used sparingly: 15% status tints over white for chip fills, low-opacity ring shadows on focus. No glassmorphism, no heavy blur.

---

## Iconography

UrbanLoft uses **[Lucide](https://lucide.dev)** — a clean, geometric, 1.5–2px stroke line-icon set whose precision matches Space Grotesk and the architectural aesthetic. Icons are monochrome, inheriting `currentColor` (charcoal in UI chrome, accent blue only when the icon is itself a link/affordance).

- **Delivery:** linked from CDN (`https://unpkg.com/lucide@latest`) in UI kits and cards. No bespoke icon font is shipped with the system.
- **Sizing:** 16px inline with body, 20px in controls, 24px for nav/section affordances. Keep stroke weight consistent across a screen.
- **No emoji, no Unicode glyph icons.** Where a measurement needs explanation, pair a small icon with a Tooltip.
- **Substitution flag:** Lucide is a substitution chosen for fit — no icon set was specified in the brand brief. If UrbanLoft has a house icon library, drop the SVGs into `assets/icons/` and update this section.

Brand mark and assets live in `assets/` (see `assets/logo.svg`).

---

## Index — what's in this project

**Foundations / tokens** (linked from `styles.css`)
- `tokens/colors.css` — base palette + semantic aliases + status tints
- `tokens/typography.css` — families, weights, type scale
- `tokens/spacing.css` — spacing, radius, elevation
- `tokens/fonts.css` — Space Grotesk / Inter / JetBrains Mono (Google Fonts)

**Specimen cards** (`guidelines/`, shown in the Design System tab)
- Colors: core palette, accent & status, status tints
- Type: headline scale, body & mono
- Spacing: spacing scale, radius & elevation

**Components** (`components/`, namespace `window.UrbanLoftDesignSystem_6db930`)
- `actions/` — **Button** (primary/secondary/ghost/destructive · sm/md/lg)
- `forms/` — **Input**, **Checkbox**, **Radio**
- `display/` — **Chip** (filter & status), **Card** (default/elevated, header strip, image slot)
- `feedback/` — **Tooltip**

**UI kit** (`ui_kits/`)
- `marketplace/` — UrbanLoft property marketplace: search/listings grid + property detail screens

**Assets** — `assets/logo.svg` and brand marks.

**Skill** — `SKILL.md` makes this downloadable as a Claude Agent Skill.

---

## Do's & Don'ts

1. **Do** use charcoal + white as the primary rhythm; accent blue is interactive-only.
2. **Do** lean on clean grid layouts that echo floor plans and structured data tables.
3. **Do** keep the subtle 4px radius consistent; sharper corners reinforce the urban identity.
4. **Don't** introduce warm or playful colors — UrbanLoft is strictly professional.
5. **Don't** use decorative or rounded display type; Space Grotesk's geometry is intentional.
6. **Do** use uppercase, tracked chip labels for a polished, institutional feel.
7. **Don't** clutter property detail pages; use progressive disclosure and tabs.
8. **Do** use high-quality architectural photography with minimal filters.
9. **Don't** use heavy drop shadows; the subtle elevation system is deliberate.
10. **Do** set all lease/financial data in JetBrains Mono for tabular numerals.
