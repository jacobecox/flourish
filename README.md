# Flourish

A personal sourdough baking companion for tracking recipes, documenting bakes, and monitoring your starter.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (dark/light theme)
- **Database**: PostgreSQL + Prisma 6
- **Auth**: FusionAuth (email/password + Google OAuth)
- **Email**: Resend HTTP API (password reset)
- **Storage**: Cloudflare R2 (journal photos)
- **Hosting**: Control Plane

## Features

### Authentication
- Email/password login and registration
- Google OAuth via FusionAuth OIDC identity provider
- Forgot password / reset password flow (native UI, email via Resend)
- HMAC-SHA256 signed session cookies

### Recipe Manager
- Create, edit, and delete recipes
- Import recipes from a URL
- Scale ingredients by serving count
- Tag-based organization
- Search and filter

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

### Dashboard
- Personalized greeting
- Recipe and journal entry counts
- Quick action shortcuts
- Recent recipes and journal entries

### Other
- Landing page for unauthenticated visitors
- Dark/light theme toggle
- Custom 404 page
- SEO: Open Graph image, sitemap, robots.txt, structured metadata
- PWA support: installable on mobile (Web App Manifest, apple-touch-icon, home screen icon)

## Project Structure

```
flourish/
├── app/
│   ├── auth/               # OAuth callback, Google redirect, logout
│   ├── forgot-password/    # Forgot password page
│   ├── journal/            # Journal list, detail, new, edit
│   ├── login/              # Login page
│   ├── recipes/            # Recipe list, detail, new, edit, import
│   ├── register/           # Registration page
│   ├── reset-password/     # Reset password page
│   ├── starter/            # Starter tracker page
│   ├── layout.tsx          # Root layout with navigation + metadata
│   ├── page.tsx            # Home (dashboard or landing page)
│   ├── not-found.tsx       # 404 page
│   ├── opengraph-image.tsx # OG image (edge runtime)
│   ├── robots.ts           # robots.txt
│   └── sitemap.ts          # sitemap.xml
├── components/             # React components (forms, cards, nav, etc.)
├── lib/
│   ├── actions/            # Server actions (auth, recipes, journal, import)
│   ├── auth.ts             # Session reads + getCurrentUser
│   ├── session.ts          # Cookie-based session (HMAC-SHA256)
│   ├── prisma.ts           # Prisma client singleton
│   └── storage.ts          # S3 storage helpers
├── prisma/
│   └── schema.prisma       # User, Recipe, Tag, JournalEntry, JournalPhoto
└── middleware.ts            # Auth gate (redirects unauthenticated users)
```

## Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=<random 32+ char string>

# Database
DATABASE_URL=postgresql://...

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
```

## Getting Started

```bash
# Install dependencies
npm install

# Push schema to database
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roadmap

- [ ] RAG integration for AI-powered baking Q&A and recipe suggestions
