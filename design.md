# Arora Smart Homes Design System & Implementation Guidelines

## Context and Goals
- **Design Intent**: Create a highly consistent, accessibility-compliant, and high-performance user interface for the Arora Smart Homes project detail and marketing pages, ensuring seamless cross-device layouts for developer and technical audiences.
- **Brand**: Arora Smart Homes in Paschim Vihar, New Delhi
- **Target Audience**: Developers, Technical Teams, and Prospective Buyers
- **Product Surface**: Marketing Site / Project Details Surface
- **Reference URL**: [Housing.com Project Page](https://housing.com/in/buy/projects/page/349786-arora-smart-homes-by-arora-properties-builders-in-paschim-vihar)

---

## Design Tokens and Foundations

### 1. Typography (Primary Font: Rubik)
All text elements must use the primary Rubik font family stack. Standardized typography tokens are defined as:

| Token Name | Value | CSS Rules | Usage |
| :--- | :--- | :--- | :--- |
| `font.family.primary` | `Rubik` | `font-family: 'Rubik', sans-serif;` | Primary font stack |
| `font.family.stack` | `Rubik, Helvetica, sans-serif` | `font-family: 'Rubik', 'Helvetica', sans-serif;` | Complete font fallback stack |
| `font.size.base` | `12.5px` | `font-size: 12.5px;` | Base text sizing |
| `font.weight.base` | `400` | `font-weight: 400;` | Normal weight |
| `font.lineHeight.base`| `28px` | `line-height: 28px;` | Standard line height |

#### Typography Scale
- `font.size.xs` = `10px`
- `font.size.sm` = `11px`
- `font.size.md` = `12px`
- `font.size.lg` = `12.5px` (Base)
- `font.size.xl` = `13px`
- `font.size.2xl` = `14px`
- `font.size.3xl` = `14.5px`
- `font.size.4xl` = `16px`

---

### 2. Color Palette (Dark Mode Base Style)
Visual style is functional and clean, utilizing a structured color system to ensure contrast validation:

| Token Name | Semantic Value | Color Hex | Usage |
| :--- | :--- | :--- | :--- |
| `color.surface.base` | Dark Base Background | `#000000` | Canvas base page background |
| `color.text.primary` | Muted Paragraph Gray | `#7F7F7F` | Description texts and metadata |
| `color.text.tertiary`| Dark Accent Slate | `#222222` | Borders, secondary metadata headers |
| `color.text.inverse` | Purple Action Accent | `#5E23DC` | Highlights, active links, primary CTA |
| `color.surface.muted` | Muted Card Canvas | `#FFFFFF` | Contrasting content blocks & cards |

---

### 3. Spacing Scale
A strict spacing scale must be used across all components. Do not implement custom values.

| Space Token | Value | Tailwind equivalent |
| :--- | :--- | :--- |
| `space.1` | `2px` | `gap-0.5` / `p-0.5` |
| `space.2` | `4px` | `gap-1` / `p-1` |
| `space.3` | `5px` | `gap-1.25` / `p-1.25` |
| `space.4` | `6px` | `gap-1.5` / `p-1.5` |
| `space.5` | `7px` | `gap-[7px]` / `p-[7px]` |
| `space.6` | `8px` | `gap-2` / `p-2` |
| `space.7` | `10px` | `gap-2.5` / `p-2.5` |
| `space.8` | `12px` | `gap-3` / `p-3` |

---

### 4. Borders, Shadows, and Motion
- **Radius Tokens**:
  - `radius.xs` = `2px` (used for micro badges)
  - `radius.sm` = `4px` (used for inline buttons and input controls)
  - `radius.md` = `16px` (used for primary page cards and banners)
- **Shadow Tokens**:
  - `shadow.1` = `rgba(0, 0, 0, 0.1) 0px 2px 16px 0px` (standard card hover state)
  - `shadow.2` = `rgba(0, 0, 0, 0.2) 0px 2px 4px 0px` (interactive active controls)

---

## Component-Level Rules

### 1. Interactive Button (CTAs)
- **Anatomy**: Left Icon slot (optional) + Label Text (centered) + Right Arrow slot (optional).
- **Required States**:
  - *Default*: Background `color.text.inverse` (`#5E23DC`), text `color.surface.muted` (`#FFFFFF`).
  - *Hover*: Slight background shift to `#4c1bbb` with cursor pointer. Transition duration must be `150ms` ease-in-out.
  - *Focus-visible*: Focus outline Ring `2px` solid `#FFFFFF` with offset.
  - *Active*: Scale transformation `scale-[0.98]` to provide tactile feedback.
  - *Disabled*: Background `#222222`, text `#7F7F7F`, opacity `0.4`, cursor `not-allowed`.
- **Keyboard Behavior**: Focusable via `Tab`. Executable using `Space` or `Enter`.
- **Touch Targets**: Minimum interactive layout size must be `44px` height and width.

### 2. Specification Badges & Info List
- **Anatomy**: Label title (e.g. "BHK Flat Layouts") + Price Value.
- **Responsive Behavior**: Stack vertical on mobile viewports (`flex-col`), wrap horizontally on desktop layouts (`flex-row` with `gap-6` or `space.8`).
- **Overflow Handling**: Long descriptions must wrap cleanly using `break-words`. Title strings must truncate using `line-clamp-1` when boundaries are breached.

---

## Accessibility Requirements (WCAG 2.2 AA compliance)
- **Focus Indicators**: Every interactive control must have a visible focus indicator using `focus-visible:outline-2 focus-visible:outline-offset-2`. Visible outlines must not be removed.
- **Contrast**: The contrast ratio between text and its background must meet a minimum of **4.5:1** for standard scale text and **3:1** for large text components.
- **Keyboard Navigation**: Users must be able to navigate the entire page and interact with elements using standard keyboard shortcuts (`Tab`, `Shift+Tab`, `Enter`, `Escape`).

---

## Content and Tone Standards
Tone should be concise, confident, and implementation-oriented.

- **Acceptable Example**: *"Arora Smart Homes in Paschim Vihar, New Delhi features high-end 2 & 3 BHK builder floors starting from ₹1.45 Cr onwards. Immediate possession available."*
- **Prohibited Example**: *"Explore our magical homes, you will absolutely fall in love with these gorgeous floors. Click here to see!"* (Too vague, low information density).

---

## Anti-Patterns and Prohibited Implementations
- **NO Raw Hex Colors**: Do not declare colors using raw code (e.g., `text-[#5e23dc]`). Always use design system semantic tokens or variables.
- **NO Keyboard Traps**: Overlay lightboxes or modal slide-outs must implement a focus trap and close cleanly on `Escape` keypress.
- **NO Fixed Heights**: Content containers must use `min-h` styling instead of `h-[fixed]` to prevent content clipping on text-zoom scales.

---

## QA Checklist for Implementation
- [ ] Confirm all fonts default to `Rubik`.
- [ ] Check color contrast compliance using automated WCAG scanner.
- [ ] Verify keyboard trap accessibility on interactive layout views.
- [ ] Ensure focus outline indicators are visible on all clickable components.
- [ ] Verify that no custom sizing parameters deviate from the 8-token spacing scale.
