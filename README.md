# bivvy-site

Marketing site and documentation hub for [Bivvy CLI](https://github.com/bivvy-dev/bivvy).

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

## Project Structure

```
bivvy-site/
├── public/                  # Static assets (served at site root)
│   ├── index.html           # Landing page
│   ├── bivvy.css            # Landing page styles
│   ├── bivvy.js             # Landing page scripts
│   └── assets/
│       └── fonts/           # Custom fonts (Quaker, icon fonts)
├── src/
│   ├── content/docs/        # Docs synced from main repo at build time
│   ├── assets/              # Site assets (logo)
│   └── styles/              # Starlight theme customizations
│       ├── custom.css
│       └── docs.css
├── scripts/
│   └── sync-docs.cjs        # Fetches docs from bivvy-dev/bivvy
├── astro.config.mjs
└── package.json
```

## How It Works

1. Docs live in `bivvy-dev/bivvy/docs/` (the main CLI repo)
2. When docs change, a workflow triggers a Cloudflare Pages rebuild
3. During build, the `sync-docs` script fetches docs from the main repo
4. Astro/Starlight renders them as the documentation site

## Local Development

```bash
# Install dependencies
npm install

# Set up environment (for syncing from private repo)
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN

# Sync docs and start dev server
npm run sync-docs
npm run dev
```

The dev server runs at `http://localhost:4321`.

## Deployment

### Cloudflare Pages

The site is deployed on Cloudflare Pages at [bivvy.dev](https://bivvy.dev).

**Build settings:**
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `20`

## Search

The landing page includes a search modal that uses [Pagefind](https://pagefind.app/) for static docs search.

To build the search index locally:
```bash
npm run build
npx pagefind --site dist
```

## License

FSL 1.1
