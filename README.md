# LuxHolz — Website redesign concept

A bespoke, responsive Vue 3 + TypeScript website prepared for presenting a new digital direction to LuxHolz. The visual identity combines the company's original logo and imagery with ivory, burgundy, editorial typography and subtle motion.

## Run locally

```sh
npm install
npm run dev -- --host 127.0.0.1
```

`npm run build` runs the TypeScript check and creates the production site in `dist`. `npm run preview -- --host 127.0.0.1` serves that build locally.

## Included

- English and German content; language preference is stored locally.
- Responsive navigation, collection detail dialogs and an interactive material selector.
- Company story, professional/wholesale enquiries, FAQ and verified contact details.
- Accessible keyboard navigation, focus management and reduced-motion support.
- Optimized WebP imagery and self-hosted fonts. No analytics, tracking or third-party font requests.
- Consultation form with validation, review and a prepared email. **The form opens the visitor's email application; it does not submit to a server.** A backend or email service is required for direct online submission.

## Source information

Logo, images, categories and factual information come from the company's public website:

- https://www.luxholz.ch/en
- https://www.luxholz.ch/en/about
- https://www.luxholz.ch/en/contact
- https://www.luxholz.ch/en/products/parkett
- https://www.luxholz.ch/en/products/vinyl
- https://www.luxholz.ch/en/products/sockelleiste

Image URLs are documented in `public/images/sources.json`. Font sources and open-source licenses are in `public/fonts`.

Interior photographs illustrate the brand and materials; they are not represented as verified completed LuxHolz projects. Product specifications remain category-level and should be confirmed with LuxHolz for each selected product. No prices, awards, project counts or client reviews have been invented.

This is a local redesign concept. It has not replaced or been published to the company's website. Before launch, the company should approve content and asset use, connect its preferred enquiry delivery service, and configure the production domain and social sharing URLs. Legal links currently open the company's existing policies.

## Validation

Production build and Vue/TypeScript checks pass. Browser checks covered desktop, 390px and 360px phone viewports, landscape navigation, German/English switching and persistence, collection dialogs, material selection with mouse and keyboard, FAQ expansion, required fields, and prepared email content. The tested browser session reported no console warnings or errors.
