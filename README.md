# npm-spark (NPMX)

A fast, frontend-only NPM package explorer built with React + Vite. Search the NPM registry, open a package detail page (README, versions, dependencies, maintainers), visualize download trends, and compare two packages side-by-side.

## Features

- **Search**: Query the NPM registry (supports NPM search operators like `downloads:>1000000`).
- **Package detail page**:
  - README rendering (GFM + syntax highlighting)
  - Versions table
  - Dependencies / peer dependencies browsing
  - Maintainers list, license, publish date, install size
  - GitHub/homepage quick links when available
- **Downloads analytics**: Mini download trend chart (default range: last month) + weekly downloads.
- **Compare**: Head-to-head comparison of two packages with metrics + a 30‑day downloads chart.
- **Keyboard**: `/` focuses the header search, `Esc` blurs it.

## Tech stack

- **App**: React 18, TypeScript, Vite (SWC)
- **Routing**: React Router
- **Data**: TanStack Query (React Query)
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library
- **Markdown**: `react-markdown` + `remark-gfm` + Prism syntax highlighting

## Getting started

### Prerequisites

- Node.js (Vite 5 requires a modern Node version; Node 18+ is recommended)
- npm

### Install & run

```bash
npm install
npm run dev
```

Then open the dev server (configured to run on port **8080**).

## Routes

- **`/`**: Landing page + trending section + search
- **`/search?q=<query>`**: Search results with infinite scrolling
- **`/package/:name`**: Package detail page
- **`/compare?pkg1=<name>&pkg2=<name>`**: Compare two packages

## Data sources

This project uses the public npm APIs directly from the browser:

- **Registry search & package metadata**: `https://registry.npmjs.org`
- **Download stats**: `https://api.npmjs.org/downloads`

No API keys are required.

## Project structure

```text
src/
  components/          Reusable UI (Header, SearchBox, charts, cards, etc.)
  components/ui/       shadcn/ui components
  hooks/               React Query hooks (search/details/downloads)
  lib/
    npm-api.ts         npm registry + downloads API client + formatters
  pages/               Route-level pages (Index, SearchResults, PackageDetail, ComparePage)
  types/               TypeScript types for npm responses
  test/                Vitest setup + example tests
```

## Scripts

```bash
npm run dev         # start Vite dev server
npm run build       # production build
npm run build:dev   # build using development mode
npm run preview     # preview production build locally
npm run lint        # run ESLint
npm run test        # run tests once (Vitest)
npm run test:watch  # watch mode (Vitest)
```

## Deployment

This is a static SPA (Vite build output). You can deploy the `dist/` folder to any static host (Netlify, Vercel static, Cloudflare Pages, GitHub Pages, etc.).

If you deploy under a sub-path or use GitHub Pages, make sure your host is configured to rewrite unknown routes to `index.html` (client-side routing).
