---
name: Kinetic Logic
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d4c4ae'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#9d8f7a'
  outline-variant: '#504534'
  surface-tint: '#fcbb3b'
  primary: '#fcbb3b'
  on-primary: '#422c00'
  primary-container: '#c98f00'
  on-primary-container: '#432e00'
  inverse-primary: '#7d5800'
  secondary: '#ffb3b0'
  on-secondary: '#68000f'
  secondary-container: '#901822'
  on-secondary-container: '#ff9e9b'
  tertiary: '#cec7a1'
  on-tertiary: '#343116'
  tertiary-container: '#b2ac87'
  on-tertiary-container: '#434023'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea9'
  primary-fixed-dim: '#fcbb3b'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5f4100'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#8c1520'
  tertiary-fixed: '#eae3bc'
  tertiary-fixed-dim: '#cec7a1'
  on-tertiary-fixed: '#1f1c04'
  on-tertiary-fixed-variant: '#4b482a'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
  surface-base: '#F5F6EF'
  ink-black: '#000000'
  growth-orange: '#C98F00'
  alert-coral: '#FF6B6B'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 96px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
spacing:
  grid-margin: 2rem
  grid-gutter: 1.5rem
  section-padding: 8rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 4rem
---

## Brand & Style

The design system is built upon a **Polished Neo-Brutalist** aesthetic. It prioritizes extreme clarity and technical authority while maintaining the high-energy "growth" vibe required for a modern digital agency. The visual language utilizes high-contrast interfaces, deliberate structural lines, and massive typography to command attention.

The personality is "Aggressively Professional." It strips away unnecessary fluff in favor of a clean, grid-based layout that suggests precision and speed. While it draws from Brutalism—using heavy strokes and raw layouts—it is refined with subtle depth and purposeful white space to ensure it remains premium and trustworthy for high-ticket enterprise clients.

**Key Stylistic Pillars:**
- **Raw Precision:** Every element feels engineered and intentional.
- **Dynamic Growth:** High-saturation accents against stark neutrals to drive conversions.
- **Architectural Depth:** Using shadows not for realism, but to create "stacks" of information.

## Colors

This design system utilizes a high-contrast palette designed for a default **Dark Mode** experience to emphasize the "Technical Agency" feel, though it is fully reversible.

- **Primary (Growth Orange):** Used for primary CTAs and critical path interactions. It represents energy and ROI.
- **Secondary (Alert Coral):** Used for highlighting specific statistics, "hot" features, or secondary call-outs.
- **Neutral/Surface:** The system uses a near-black (`#000000`) for backgrounds and a distinctive off-white (`#F5F6EF`) for high-contrast text and "paper" surfaces in light mode.
- **Tertiary (Mellow Yellow):** Used for subtle background containers and separating content blocks without losing the brand's warmth.

**Implementation Note:** In dark mode, borders should typically be `primary` or `surface-base` at 20% opacity to maintain the Neo-Brutalist structure without overwhelming the user.

## Typography

The typography strategy is built on a "Technical-Humanist" axis. 

1.  **Headlines (Space Grotesk):** Chosen for its geometric, futuristic qualities. Headlines should be set with tight letter-spacing to create a "blocky" Neo-Brutalist impact.
2.  **Body (Inter):** Used for maximum legibility and high-conversion copy. It provides a neutral balance to the aggressive headlines.
3.  **Labels (JetBrains Mono):** This monospaced font is used for small tags, technical data, and "eyebrow" text. It reinforces the "Technical" and "Speed" keywords of the brand.

**Rules:** 
- Headlines should always be `Sentence case` or `UPPERCASE`—never Title Case.
- Display text can break onto multiple lines to create a "staircase" effect in the layout.

## Layout & Spacing

The layout utilizes a **Strict 12-Column Fixed Grid** for desktop and a **Fluid Single-Column** for mobile. Neo-Brutalist layouts often look chaotic; to counter this and build trust, we adhere to a rigid mathematical spacing system based on an 8px base unit.

- **The Grid:** Use visible or "implied" borders to separate layout sections. Gutters are kept tight to maintain the "solid" feel of the components.
- **Sectioning:** Content sections are separated by heavy horizontal strokes (2px - 4px) to emphasize the structural nature of the agency's work.
- **Responsive Reflow:** On mobile, padding is reduced but the "boldness" is maintained by keeping typography sizes relatively large compared to standard sites.

## Elevation & Depth

While traditional Neo-Brutalist design is flat, this design system introduces **Refined Depth** to suggest professional polish.

- **Subtle Shadows:** Use "Hard Shadows" instead of diffused ones. A shadow should have a 0px blur and a 4px-8px offset, usually in the `primary` color, to create a "sticker" or "pop-out" effect.
- **Tonal Layering:** Depth is conveyed through the layering of containers. A primary surface (Black) hosts containers (Off-white or Mustard), which then host components (Coral). 
- **The "Elevated State":** Hovering over a card or button doesn't just lighten it; it physically "shifts" its position by 2-4 pixels to simulate a mechanical press or lift.

## Shapes

The shape language is **Sharp (`0`)**. 

Every element—buttons, inputs, cards, and containers—must have hard 90-degree corners. This communicates a "no-nonsense," technical, and precise brand identity. Circular elements are strictly reserved for icons or avatars to provide a single point of organic contrast in an otherwise geometric world.

**Key Shape Rules:**
- Heavy 2px borders on all interactive containers.
- Rectangular blocks only.
- Buttons should never have rounded corners; they are strictly rectangular "blocks."

## Components

### Buttons
- **Primary:** Rectangular, Growth Orange background, Black text, 2px Black border. On hover, apply a Hard Shadow (Primary color offset 4px).
- **Secondary:** Transparent background, 2px White/Off-white border, White text.
- **Ghost:** Monospaced label with an arrow icon (→).

### Cards
- Use a 1px or 2px border in a contrasting color. 
- Headlines inside cards should be `headline-md`.
- No padding-top/bottom between cards in a list; let them share borders to create a "grid of services" look.

### Input Fields
- Underlined style or full-box with 2px borders.
- Labels must use `label-mono` in uppercase.
- Focus state: The border changes to Growth Orange with a subtle Hard Shadow.

### Chips & Tags
- Small rectangular boxes using `label-mono`.
- Use `tertiary` (Mellow Yellow) background with black text for a "highlighted text" effect.

### Special Component: "The Growth Metric"
- A large-format card displaying a single statistic. Use `display-xl` for the number and `label-mono` for the description. This is the cornerstone for showing "Growth-oriented" results.