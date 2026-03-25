# Design System Strategy: The Modern Grooming Atelier

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Atelier."** 

We are moving away from the "generic SaaS dashboard" look. Instead, we are building a digital experience that feels like stepping into a high-end, wood-paneled barber shop in London or New York. The system prioritizes **intentional asymmetry**, **editorial spacing**, and **tonal depth** over traditional borders and grids. By using high-contrast typography and a "layered" approach to surfaces, we create a masculine, sophisticated environment that feels bespoke, not templated.

---

## 2. Colors & Surface Philosophy

### The Pallete
- **Primary (`#e9c177`):** Use for high-impact actions and brand moments. 
- **Surface-Dark (`#15130f`):** The foundation of the experience.
- **On-Surface (`#e8e1db`):** The primary ivory-toned text for maximum readability against dark backgrounds.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. To separate content, you must use **Background Color Shifts**. For example:
- A Sidebar uses `surface-container-low`.
- The Main Content Area uses `surface`.
- Interior Cards use `surface-container-high`.
The boundary is defined by the change in value, creating a seamless, architectural feel.

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Use the Material tokens to "stack" importance:
1. **Base:** `surface-dim` (#15130f)
2. **Sectioning:** `surface-container-low` (#1d1b17)
3. **Primary Content Cards:** `surface-container-highest` (#373430)

### The "Glass & Gradient" Rule
To add "soul" to the interface:
- **Glassmorphism:** Use `surface-bright` at 60% opacity with a `20px` backdrop-blur for floating navigation bars or modals.
- **Signature Gradient:** For primary CTAs, use a subtle linear gradient from `primary` (#e9c177) to `primary-container` (#c59f59) at a 135-degree angle. This adds a metallic, premium sheen that flat hex codes lack.

---

## 3. Typography: Editorial Authority
We utilize **Inter** with an editorial mindset—extreme contrast between massive headlines and functional body text.

| Role | Token | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 3.5rem | 900 | High-impact marketing/stats |
| **Headline** | `headline-lg` | 2.0rem | 700 | Page titles & Section headers |
| **Title** | `title-md` | 1.125rem | 600 | Card titles & Modals |
| **Body** | `body-md` | 0.875rem | 400 | General interface text |
| **Label** | `label-sm` | 0.6875rem | 600 | All-caps, tracked out (+5%) for metadata |

**Rule of Thumb:** Never center-align long-form text. Stick to a strict left-aligned "ragged right" look to maintain the sophisticated, modern aesthetic.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering**. Place a `surface-container-lowest` card inside a `surface-container-high` section to create "recessed" depth, or vice-versa to create "lift."

### Ambient Shadows
Shadows should be felt, not seen. 
- **Token:** `0 20px 40px rgba(0, 0, 0, 0.4)`
- Use only on floating elements (Modals, Toasts). The shadow color must be a deep tint of the background, never pure black, to ensure it feels like natural ambient light.

### The "Ghost Border" Fallback
If contrast is insufficient for accessibility, use a **Ghost Border**: `outline-variant` (#4e4639) at **15% opacity**. It should be a mere suggestion of a boundary.

---

## 5. Component Signature Styles

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), black text (`on-primary`), `rounded-sm` (0.125rem). 
- **Ghost:** No background, `outline` text. On hover, a subtle `surface-bright` background transition (200ms).
- **Interactions:** On hover, primary buttons should scale slightly (1.02x) to provide a tactile, premium feel.

### Cards & Tables
- **Forbid Dividers:** Do not use lines between table rows. Use a 4px vertical gap and alternate row colors using `surface-container-low` and `surface-container-lowest`.
- **Card Header:** Use a `primary` left-border (4px) to denote an active or "Featured" card rather than a full border.

### Status Badges
Status is conveyed via **Tonal Chips**, not neon colors.
- **Confirmed:** `surface-container-highest` background with `primary` text.
- **Canceled:** `error_container` background with `on_error_container` text.
- **Form:** All badges use `rounded-full` and `label-sm` typography.

### Input Fields
- **State:** Static inputs should have no border, only a `surface-container-highest` fill. 
- **Focus:** Transition to a `ghost-border` and a subtle `primary` glow (glow opacity: 10%).

---

## 6. Component Additions for the Barber Context
- **The Appointment Timeline:** A vertical, asymmetrical line using `outline-variant` that connects time slots, using `primary` dots for current appointments.
- **The Stylist Blade:** A horizontal scroll component for selecting barbers, featuring high-contrast monochrome photography and `title-sm` overlays.

---

## 7. Do's and Don'ts

### Do
- **DO** use generous whitespace (Spacing Scale `16` and `20`) to let the "premium" feel breathe.
- **DO** use `display-lg` for single, impactful numbers (e.g., Daily Revenue).
- **DO** ensure all interactive elements have a `primary` focus ring for AA accessibility.

### Don't
- **DON'T** use `rounded-lg` or `rounded-xl`. Keep corners sharp (`sm` or `none`) to maintain a masculine, architectural precision.
- **DON'T** use pure white `#FFFFFF`. Use `on-surface` (#e8e1db) to avoid "monitor glare" and keep the palette warm.
- **DON'T** use icons for everything. Use sophisticated `label-md` text to guide the user; let the typography do the work.