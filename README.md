# LuxHolz — 3D website concept

A dark, modern redesign concept for LuxHolz (parquet, vinyl and skirting in Gossau, Switzerland), built with Vue 3, TypeScript, Vite and Three.js.

## Run locally

```sh
npm install
npm run dev -- --host 127.0.0.1
```

`npm run build` type-checks and builds the production site into `dist`.

## What's inside

- **Hero with a 3D flooring sample** (`src/components/MaterialScene.vue`): oak parquet, vinyl with underlay, or a floor corner with white-lacquer and oak-veneer skirting. Visitors switch materials, drag to rotate, and the planks spread apart on hover and scroll. Three.js is lazy-loaded so the text renders first.
- Collections with 3D tilt cards and detail dialogs, a material comparison, the LuxHolz philosophy, a section for architects and trade, FAQ, and contact details with opening hours.
- German (default) and English. The choice is remembered in the browser.
- Enquiry form with validation. **It opens the visitor's email app addressed to info@luxholz.ch; it does not send to a server.**
- Smooth scrolling (Lenis), scroll reveals, parallax, magnetic buttons, cursor glow, glass panels and soft gradients (`src/composables/motion.ts`).
- Responsive down to 320px, keyboard accessible, and respects `prefers-reduced-motion`. The 3D scene pauses off-screen.

All text, contact details and product data are in `src/content.ts`.

## Source information

Logo, images, categories and contact details come from the company's public website (www.luxholz.ch). Image URLs are in `public/images/sources.json`; font sources and licences are in `public/fonts`. Product specifications are category-level and should be confirmed with LuxHolz. No prices, awards, project counts or reviews have been invented. The 3D samples are illustrations, not exact product models.

This is a local concept. It has not been published to the company's website. Before launch, LuxHolz should approve the content and asset use and connect an enquiry delivery service if direct form submission is wanted.
