# Flourish

A personal sourdough baking companion for tracking recipes, documenting bakes, monitoring your starter, and getting AI-powered baking advice.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (dark/light theme)
- **Database**: PostgreSQL + Prisma 6
- **Vector Database**: PostgreSQL + pgvector (separate DB)
- **Auth**: FusionAuth (email/password + Google OAuth)
- **Email**: Resend HTTP API (password reset)
- **Storage**: Cloudflare R2 (recipe + journal photos)
- **Embeddings**: Voyage AI `voyage-3`
- **LLM**: Anthropic Claude Sonnet
- **Hosting**: Control Plane

## Features

### Authentication
- Email/password login and registration
- Google OAuth via FusionAuth OIDC identity provider
- Forgot password / reset password flow (native UI, email via Resend)
- HMAC-SHA256 signed session cookies

### Recipe Manager
- Create, edit, and delete recipes
- Import recipes from a URL (auto-extracts title, ingredients, instructions, image, and metadata via JSON-LD)
- Add photos manually or via URL import
- Scale ingredients by serving count
- Tag-based organization
- Search and filter
- Favorite/pin recipes to the top of the list
- Share recipes via a public link — viewers can save a copy to their own account

### Baker's Journal
- Log bakes with notes, rating, and bake metrics (hydration, flour type, bulk/proof time, bake temp)
- Attach photos with captions
- Link entries to a recipe
- Photo lightbox viewer
- Search and filter entries

### Starter Tracker
- Step-by-step readiness checklist (feed, bubbles, double, dome, float test, etc.)
- Record feed time with elapsed timer
- Progress persisted in localStorage

### AI Baking Assistant (RAG)
- Conversational chat powered by Claude Sonnet
- Answers questions using the user's own recipes and journal entries as context
- Supplemented by a curated sourdough knowledge base (scraped + embedded)
- Streaming responses with markdown rendering (tables, lists, bold, code)
- See [docs/rag-architecture.md](docs/rag-architecture.md) for full implementation details

### Dashboard
- Personalized greeting
- Recipe and journal entry counts
- Quick action shortcuts
- Recent recipes and journal entries

### Account
- Update display name
- Change password (verifies current password before updating via FusionAuth)

### Other
- Landing page for unauthenticated visitors
- Dark/light theme toggle
- Custom 404 page
- SEO: Open Graph image, sitemap, robots.txt, JSON-LD structured data, dynamic OG tags on shared recipes
- PWA support: installable on mobile (Web App Manifest, apple-touch-icon, home screen icon)

## Project Structure

```
flourish/
├── app/
│   ├── account/            # Account settings (display name, password)
│   ├── api/chat/           # SSE streaming chat endpoint (RAG + Claude)
│   ├── auth/               # OAuth callback, Google redirect, logout
│   ├── chat/               # AI assistant page
│   ├── forgot-password/    # Forgot password page
│   ├── journal/            # Journal list, detail, new, edit
│   ├── login/              # Login page
│   ├── recipes/            # Recipe list, detail (public), new, edit, import
│   ├── register/           # Registration page
│   ├── reset-password/     # Reset password page
│   ├── starter/            # Starter tracker page
│   ├── layout.tsx          # Root layout with navigation + metadata
│   ├── page.tsx            # Home (dashboard or landing page)
│   ├── not-found.tsx       # 404 page
│   ├── opengraph-image.tsx # OG image (edge runtime)
│   ├── robots.ts           # robots.txt
│   └── sitemap.ts          # sitemap.xml
├── components/             # React components (forms, cards, nav, chat UI, etc.)
├── docs/
│   └── rag-architecture.md # RAG + AI chat implementation details
├── lib/
│   ├── actions/            # Server actions (auth, recipes, journal, import)
│   ├── auth.ts             # Session reads + getCurrentUser
│   ├── embeddings.ts       # Voyage AI embedding + vector search utilities
│   ├── prisma.ts           # Prisma client singleton (app DB)
│   ├── prismaVector.ts     # Prisma client singleton (vector DB)
│   ├── session.ts          # Cookie-based session (HMAC-SHA256)
│   └── storage.ts          # S3 storage helpers
├── prisma/
│   ├── schema.prisma       # User, Recipe, Tag, JournalEntry, JournalPhoto
│   └── vector.prisma       # Embedding model (pgvector)
├── scripts/
│   ├── ingest.ts           # Backfill embeddings for existing user data
│   └── scrape-knowledge.ts # One-time knowledge base scraper
└── middleware.ts            # Auth gate (redirects unauthenticated users)
```

## Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=<random 32+ char string>

# Database
DATABASE_URL=postgresql://...
VECTOR_DATABASE_URL=postgresql://...

# FusionAuth
FUSIONAUTH_URL=http://...
FUSIONAUTH_CLIENT_ID=<application UUID>
FUSIONAUTH_CLIENT_SECRET=<OAuth2 client secret>
FUSIONAUTH_API_KEY=<API key with login + registration permissions>
FUSIONAUTH_GOOGLE_IDP_ID=<UUID of the Google OIDC identity provider>

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Storage (S3-compatible)
STORAGE_ENDPOINT=...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_BUCKET=...
STORAGE_PUBLIC_URL=...

# AI / Embeddings
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...
```

## Getting Started

```bash
# Install dependencies
npm install

# Push schema to database
npx prisma db push
npx prisma db push --schema=prisma/vector.prisma

# Generate Prisma clients
npx prisma generate
npx prisma generate --schema=prisma/vector.prisma

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI Knowledge Base (one-time setup)

```bash
# Backfill embeddings for existing recipes + journal entries
npm run ingest

# Scrape and embed the sourdough knowledge base
npm run scrape
```
