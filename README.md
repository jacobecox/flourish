# Flourish 🍞

A sourdough baking app for tracking recipes and your baking journey.

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (planned)
- **Auth**: Clerk or Supabase Auth (planned)
- **Hosting**: Vercel (planned)

## Project Structure

```
flourish/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout with navigation
│   ├── page.tsx         # Home page
│   ├── recipes/         # Recipe manager pages
│   ├── journal/         # Baker's journal pages
│   └── globals.css      # Global styles + Tailwind
├── components/          # Reusable React components
│   └── Navigation.tsx   # Main navigation
├── lib/                 # Utilities and helpers
├── public/              # Static assets
└── ...config files
```

## Phase 1 Features (Planned)

### 1. Recipe Manager
- Import recipe (paste URL, manual entry)
- Save to personal collection
- Basic categorization (tags: sourdough, whole wheat, etc.)
- Simple search

### 2. Baker's Journal
- Create bake log entry
- Upload photo
- Add notes (what worked, what didn't)
- Link to recipe used

### 3. Basic Authentication
- Sign up / login
- Personal account

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development Roadmap

- [ ] Set up database schema
- [ ] Implement authentication
- [ ] Build recipe manager
- [ ] Build baker's journal
- [ ] Add image upload functionality
- [ ] Phase 2: RAG integration for recipe recommendations
