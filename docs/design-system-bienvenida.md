---
name: Digital Security Interface
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#444653'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#532a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#743d00'
  on-tertiary-container: '#ffa85d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  caption:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The brand personality of this design system is built upon the concept of "Safety by Design." It aims to transform the intimidating, often cryptic nature of cybersecurity into a calm, guided, and empowering experience for non-technical users. The emotional response should be one of profound relief and confidence—moving away from "Am I hacked?" toward "I am protected."

The chosen UI style is **Corporate / Modern** with a focus on high-clarity information architecture. It utilizes ample white space to reduce cognitive load and employs a "helpful mentor" tone. Visual elements are clean and intentional, avoiding unnecessary decoration in favor of functional clarity. The interface relies on structural order and soft, approachable aesthetics to bridge the gap between technical complexity and user accessibility.

## Colors

The color palette is functionally driven, using color as a primary communication tool for system health. 

- **Trust Blue (Primary):** A deep, stable sapphire used for primary actions, navigation, and branding. It reinforces authority and reliability.
- **Safety Green (Success):** A vibrant but professional emerald used for "All Clear" states, completed scans, and active protection.
- **Caution Yellow (Warning):** A high-contrast amber for non-critical alerts, pending updates, or configuration suggestions.
- **Alert Red (Danger):** A bold, urgent crimson reserved strictly for critical threats and the "Panic Button."
- **Neutrals:** A range of cool grays on a white base ensures the interface feels airy and uncluttered, providing a neutral stage for high-priority color alerts.

## Typography

**Public Sans** is the exclusive typeface for this design system. Chosen for its institutional clarity and neutral, accessible tone, it provides excellent legibility across all age groups and vision types. 

The typographic hierarchy is strictly enforced to guide users through tasks. Large, bold headlines clearly state the "current status" of the system, while body copy remains at a highly readable 16px-18px range to ensure instructions are never missed. Letter spacing is slightly tightened for headlines to maintain a modern, professional feel, while body text uses standard spacing for maximum readability.

## Layout & Spacing

This design system utilizes a **Fixed Grid** approach for its primary dashboard to provide a sense of stability and containment. The layout is centered around a 12-column grid with a maximum width of 1280px to prevent information from becoming sparse on ultra-wide monitors.

The spacing rhythm is based on an 8px linear scale. This consistency ensures that components feel related but distinct. Deep vertical "stacks" (32px+) are used to separate major security sections, while tighter spacing (8px-16px) links labels to their respective inputs or descriptions. Generous page margins ensure the content never feels cramped against the edges of the screen, reinforcing the "clean and uncluttered" brand pillar.

## Elevation & Depth

Visual hierarchy is established using **Tonal Layers** combined with **Ambient Shadows**. Instead of harsh borders, depth is created by placing white "Surface" cards onto a light grey "Background" layer.

- **Level 0 (Background):** Light Grey (#F9FAFB), the canvas for all content.
- **Level 1 (Cards/Surfaces):** White (#FFFFFF) with a very soft, diffused shadow (12% opacity, 16px blur) to lift content slightly off the background.
- **Level 2 (Modals/Popovers):** Higher elevation with a more pronounced shadow and a subtle 1px border in a light neutral tone to ensure clear separation during critical interactions.

The shadows are slightly tinted with the "Trust Blue" hex to maintain color harmony and prevent the UI from looking muddy.

## Shapes

The shape language is consistently **Rounded (Level 2)**. This 8px base radius (0.5rem) removes the "sharpness" associated with technical software, making the platform feel more like a friendly consumer service.

- **Standard Components:** 8px (0.5rem) radius for buttons and input fields.
- **Large Components:** 16px (1rem) radius for cards and containers.
- **Featured Elements:** 24px (1.5rem) radius for "Quick Action" banners.

This hierarchy of roundedness subtly signals the importance of the container; the larger the radius, the more significant the piece of information it holds.

## Components

- **Buttons:** Primary buttons use the Trust Blue with white text. Secondary buttons use a light blue ghost style. The "Panic Button" is a unique, high-elevation Alert Red button with a bold icon, placed in a consistent, easily accessible location.
- **Cards:** The primary container for information. Cards must always have a clear title and a single primary action (e.g., "Review," "Fix Now," "Dismiss").
- **Progress Indicators:** Circular gauges for "Security Scores" and linear bars for task completion. Use the status colors (Green/Yellow/Red) to reflect the data they represent.
- **Checkboxes & Radios:** Large, easily clickable targets with a minimum hit area of 44px. Active states use Trust Blue for the fill.
- **Input Fields:** Clean, white backgrounds with a subtle gray border that thickens and turns Trust Blue on focus. Labels are always visible above the field (never just placeholder text).
- **Security Chips:** Small, rounded labels used to categorize threats (e.g., "Network," "Identity," "Privacy") using the neutral color palette to avoid competing with main status colors.
- **Friendly Icons:** Use a consistent line-art icon set with rounded terminals. Icons should be paired with text labels wherever possible to ensure accessibility.