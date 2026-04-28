---
name: Financial Enterprise AI
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  nepali-supplement:
    fontFamily: Inter
    fontSize: 110%
    lineHeight: '1.8'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is engineered for the high-stakes environment of financial enterprise AI. The brand personality is rooted in **Authority** and **Precision**, establishing immediate trust through a grounded, professional aesthetic. It moves away from "hyped" AI visuals toward a "High-Tech Tooling" approach—where the AI is a reliable, invisible partner in document analysis and financial auditing.

The visual style is **Corporate Modern Minimalist**. It prioritizes information density and document clarity over decorative elements. By utilizing subtle borders, structured grid alignments, and ample whitespace, the UI conveys a sense of security and order. The interface feels like a sophisticated digital workspace where every pixel serves a functional purpose.

## Colors

This design system utilizes a palette designed for institutional confidence. 

- **Primary (Deep Navy):** Used for headers, primary navigation, and core brand elements to establish authority.
- **Secondary (Trust Blue):** Reserved for primary actions, links, and focused states, signaling reliability and the "active" AI state.
- **Success (Clean Green):** Specifically for verified data points, successful document processing, and positive financial trends.
- **Neutrals (Slate Grays):** A sophisticated range of slates is used for secondary text, metadata, and subtle borders to reduce visual fatigue during long sessions.

The default mode is **Light**, mimicking the professional feel of physical white paper and traditional financial reports, though a dark mode variant should maintain the same high-contrast ratios for data legibility.

## Typography

The typography system is built for extreme legibility in bilingual contexts (English and Nepali). 

**Public Sans** is used for headlines to provide a stable, institutional foundation. **Inter** is the workhorse for body text, chat logs, and financial data due to its neutral character and excellent legibility at small sizes.

### Bilingual Handling
For Nepali text rendering, line heights are increased by 20% relative to English standards to accommodate the taller character heights and vowel markers. The font size for Nepali scripts should be scaled slightly up (approx 110%) when appearing alongside English to maintain optical balance.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for core content areas to mimic the structure of professional documents, while the sidebar and chat panels use fluid widths.

- **Grid:** A 12-column grid with a 24px gutter.
- **Rhythm:** A 4px baseline grid ensures vertical alignment across complex data tables and multi-line chat messages.
- **Margins:** Page margins are generous (48px+) to prevent the interface from feeling cluttered, emphasizing a "premium" enterprise tool.
- **Chat Layout:** Messages are left-aligned in a single column to maintain a chronological, readable log, with a maximum width for readability.

## Elevation & Depth

To maintain a secure and grounded feel, the design system avoids heavy shadows. Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** The base slate-50 layer.
- **Level 1 (Cards/Panels):** Pure white surfaces with a 1px border (#E2E8F0). No shadow.
- **Level 2 (Active/Floating):** Used for dropdowns or modals. A very subtle, diffused ambient shadow (0px 4px 12px rgba(15, 23, 42, 0.05)) is applied to separate the element from the document layer.
- **Depth through Color:** Interaction is signaled by shifting background tints rather than physical "lifting" effects.

## Shapes

The shape language is conservative and precise. A **Soft (0.25rem)** corner radius is the standard for almost all UI elements.

- **Standard Elements:** 4px (0.25rem) radius for buttons, input fields, and tags.
- **Large Containers:** 8px (0.5rem) radius for primary cards and document previews.
- **Sharpness:** Interactive elements remain relatively sharp to maintain a "technical" and "efficient" appearance, avoiding the "bubbly" look of consumer apps.

## Components

### Buttons
- **Primary:** Deep navy background with white text. Square-ish (4px radius).
- **Secondary:** Transparent background with a 1px slate-300 border.
- **Ghost:** No border or background, used for low-priority actions in document toolbars.

### Cards (Document Previews)
Cards are the primary container for file metadata and AI summaries. They feature a 1px slate-200 border, a white background, and a subtle "Success Green" or "Trust Blue" accent bar on the left edge to indicate status (e.g., "Verified" or "Processing").

### Input Fields
Fields use a 1px border and a light gray background (#F1F5F9) when inactive, switching to a white background with a 2px Trust Blue border when focused. Label text is always pinned above the field in `label-caps` style.

### Chat & Document Interaction
- **AI Response Bubbles:** Light gray background with a distinct icon prefix.
- **Human Input:** White background with a clear border.
- **Data Tables:** High-density, no vertical borders, only horizontal dividers in light slate. Header rows are Deep Navy or heavy Slate to anchor the data.

### Specialized Components
- **Bilingual Switcher:** A clean toggle in the header for switching between English and Nepali localization.
- **Confidence Score Badge:** A small chip using a semantic color scale (Green to Yellow) to show AI certainty in financial extractions.