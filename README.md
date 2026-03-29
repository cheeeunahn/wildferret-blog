# wildferret-blog

Hi there, and welcome to my personal blog!
Thanks for stopping by 👋🏻

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Routing | React Router 7 |

## Prerequisites

- **Node.js 20+** (matches [CI](.github/workflows/deploy.yml))

## Setup

```bash
npm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Project layout

```
src/
├── App.tsx              # Routes
├── main.tsx
├── components/          # Shared UI (e.g. layout, cards)
├── pages/               # Route pages
└── data/                # Content (e.g. articles)
```

## Deployment

Pushes to `main` run [Deploy to GitHub Pages](.github/workflows/deploy.yml): `npm ci`, `npm run build`, then publish `dist/` to GitHub Pages.

The app is built with [`base: '/wildferret-blog/'`](vite.config.ts) for GitHub Pages project hosting.

**Live site:** [cheeeunahn.github.io/wildferret-blog](https://cheeeunahn.github.io/wildferret-blog/)
