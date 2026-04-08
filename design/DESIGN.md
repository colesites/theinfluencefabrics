# Design System Document: Modern Heritage Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Atelier."** We are moving away from the "template-heavy" look of standard e-commerce to create a high-end digital publication feel. The Ankara fabric is vibrant, storied, and tactile; the UI must act as a stark, gallery-like canvas that allows the product’s geometry to lead. 

We achieve a signature look through **intentional asymmetry and brutalist precision.** By utilizing a 0px radius across all components and a high-contrast palette, we evoke a sense of architectural permanence and "Modern Heritage." This system rejects the "softness" of the modern web in favor of sharp lines and bold, editorial layouts.

---

## 2. Colors & Tonal Logic
This system is built on a high-contrast triad: Burnt Orange (`#c65011`), Light Gray (`#e7e7e7`), and Pure Black (`#000000`). We strictly prohibit the use of browns or creams to ensure the "Modern" half of "Modern Heritage" remains dominant.

### Color Tokens
- **Primary / Action:** `#c65011` (Burnt Orange). Used for primary CTAs, active states, and high-impact highlights.
- **Surface / Background:** `#f9f9f9` to `#e7e7e7`. The foundation of the "Atelier" look.
- **Typography:** Pure Black (`#000000`). All text—from display to body—must be high-contrast black for an uncompromising editorial feel.

### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. To define boundaries, designers must use **Background Color Shifts**. For example, a product description section using `surface-container-low` (`#f4f3f3`) should sit flush against a main `surface` (`#f9f9f9`) hero area. The transition is the boundary.

### Signature Textures
While the system is minimalist, we avoid "flatness." For primary CTAs, use a subtle linear gradient from `primary` (`#a13c00`) to `primary_container` (`#c65011`) at a 135-degree angle. This provides a "silken" depth reminiscent of high-end fabric without breaking the minimalist aesthetic.

---

## 3. Typography
The typography is the voice of the brand. We pair a high-authority serif with a functional, architectural sans-serif.

- **Display & Headlines (Noto Serif):** Use `display-lg` through `headline-sm` for all editorial headings. These should be set with tight letter-spacing (-0.02em) to feel like a high-fashion magazine masthead.
- **Body & Labels (Inter):** Use `body-lg` through `label-sm`. Inter provides a clean, neutral counter-balance to the expressive Noto Serif.
- **The Editorial Scale:** Do not fear "Oversized" type. Use `display-lg` (3.5rem) for product names and collection titles to command the page.

---

## 4. Elevation & Depth
In a system with **0px roundedness**, traditional shadows can look dated. We use **Tonal Layering** to create hierarchy.

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` (`#ffffff`) card sitting on a `surface_dim` (`#dadada`) background creates a natural, sharp lift.
- **Glassmorphism & Depth:** For floating navigation or "Quick Add" overlays, use a `surface` color with 80% opacity and a `20px` backdrop-blur. This creates a "frosted glass" effect that feels premium and integrated.
- **The "Ghost Border" Fallback:** If a border is required for input clarity, use `outline_variant` (`#dfc0b4`) at **15% opacity**. This creates a whisper of a line that guides the eye without cluttering the UI.

---

## 5. Components

### Buttons
- **Primary:** Burnt Orange background (`#c65011`), White text, 0px radius. Massive horizontal padding (32px) to emphasize the horizontal "cut."
- **Secondary:** Pure Black background, White text. Used for "Add to Cart" to contrast against the "Buy Now" primary.
- **Tertiary:** Pure Black text with a 2px underline, no background. Used for "View Details" or "Learn More."

### Input Fields
- **Styling:** Underline-only style. Use a 2px Pure Black bottom border. Labels should use `label-md` in Pure Black, positioned above the input.
- **Error State:** Use `error` (`#ba1a1a`) for the underline and helper text.

### Cards & Product Grids
- **Construction:** No borders. No shadows. Use `surface-container-highest` (`#e2e2e2`) for the image background to create a subtle "frame" for the product photography.
- **Spacing:** Use aggressive vertical white space (64px+) between product rows to maintain the editorial feel.

### Navigation (The "Floating Header")
- **Style:** A strict, horizontal bar using the Glassmorphism rule (80% opacity Light Gray + Blur). 
- **Interaction:** On scroll, the background shifts to 100% opacity Light Gray to ensure legibility over vibrant fabric photography.

---

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetry:** Place a `headline-lg` off-center to create visual tension and interest.
- **Embrace White Space:** Allow products to "breathe" with large margins.
- **High-Contrast Imagery:** Use photography with high saturation to pop against the `#e7e7e7` backgrounds.

### Don’t:
- **No Rounded Corners:** Never use a border-radius. Every corner must be a sharp 90-degree angle.
- **No Divider Lines:** Do not use `<hr>` tags or 1px lines to separate content. Use a change in background tone instead.
- **No "Soft" Colors:** Avoid any color that leans toward beige, cream, or brown. If it isn't crisp Gray, Burnt Orange, or Black, it doesn't belong in the UI.
- **No Drop Shadows:** Avoid traditional offsets like `box-shadow: 0 4px 10px`. If you must lift an object, use a centered, diffused glow at 4% opacity.