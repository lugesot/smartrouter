# SmartRouter

Next.js App Router + React + Tailwind CSS frontend preview.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:4000. Build validation: `npm run build`.

## Routes and access

- `/`: public homepage.
- `/workspace`: model library, directly accessible without login.
- `/login`, `/register`: legacy entry points redirecting to `/workspace`.

Catalog data is illustrative. No live API, billing or authentication backend is connected.

## Languages

English is the default. In the browser, a Chinese language preference (`zh`, `zh-CN`, `zh-TW`, etc.) automatically selects Simplified Chinese. The header language switch is available on the homepage and workspace; explicit language choices are stored locally and take precedence over browser preferences. Model IDs, brand names and code snippets remain unchanged.

## Design and assets

Brand tokens: primary `#5546C7`, secondary `#8174DD`, background `#F7F7FC`, dark panels `#19172B`. Brand SVG/PNG/ICO assets are in `public/brand`; Next.js icon entries live in `app/`.

The full-width river background contains 14 local model logos from Lobe Icons, with license and provenance in `public/models/`. Motion has a pause control and a reduced-motion static fallback. Inter is bundled locally in `public/fonts/`, with its license; Chinese text uses native system font fallbacks.
