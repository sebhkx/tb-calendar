# tb-calendar

Time-blocking todo calendar — a TickTick-inspired app with calendar-first, highly customizable day/week/multi-week views.

Built with Next.js, Drizzle ORM, and **Supabase Postgres**. Originally scaffolded in [v0](https://v0.app); this repo is portable and independent of Vercel and Neon.

---

## Database

Postgres runs on **Supabase**. The app uses the standard `pg` driver and Drizzle ORM — no Supabase-specific server SDK required yet. Client keys in `.env.example` are reserved for future auth, realtime, and mobile SDK work.

### Test data portability

**Yes — the data model is fully portable.** Tables (`lists`, `tasks`) are plain Postgres with no Neon extensions or vendor-specific types.

There is **no Neon dump in this repo** and no local `.env` with a Neon connection, so live Neon data cannot be migrated automatically from here. If you still have data on Neon:

```bash
pg_dump "$NEON_DATABASE_URL" --no-owner --no-acl -f db/neon-export.sql
psql "$DATABASE_URL" -f db/neon-export.sql
```

Otherwise, use the included seed (3 lists, 4 sample tasks):

```bash
pnpm db:seed
# or
psql "$DATABASE_URL" -f db/seed.sql
```

---

## Prerequisites

- Node.js 20+
- pnpm or npm
- [Supabase](https://supabase.com) project (free tier is fine)

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values from **Supabase → Project Settings → Database**.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Direct Postgres URI (port **5432**, not the pooler) |
| `DB_SSL` | Yes (Supabase) | Set to `true` for hosted Supabase |

Optional (future auth / mobile):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key |

---

## Run locally

```bash
pnpm install
cp .env.example .env.local   # add Supabase DATABASE_URL + DB_SSL=true
pnpm db:push                 # create tables from lib/db/schema.ts
pnpm db:seed                 # inbox + sample tasks (skips if inbox exists)
pnpm dev                     # http://localhost:3000
```

**Production build:**

```bash
pnpm build
pnpm start
```

**Database scripts:**

| Script | Purpose |
|---|---|
| `pnpm db:push` | Push schema to Supabase (dev) |
| `pnpm db:generate` | Generate SQL migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Insert sample data |
| `pnpm db:studio` | Drizzle Studio UI |

---

## Migrate out of Vercel / v0

Remaining Vercel ties (optional cleanup):

| Item | Location | Action |
|---|---|---|
| `@vercel/analytics` | `app/layout.tsx`, `package.json` | Remove |
| `generator: 'v0.app'` | `app/layout.tsx` metadata | Remove |
| `ignoreBuildErrors: true` | `next.config.mjs` | Remove; fix TS errors |

Database access uses standard `pg` — no Vercel Postgres, Neon serverless driver, or other vendor DB libraries.

---

## Portability checklist

- [x] **Steps to run the app** — README + `.env.example` + db scripts
- [ ] **Migrate out of Vercel** — remove analytics, v0 metadata, fix `next.config`
- [x] **package.json and lock file** — renamed, db scripts added
- [x] **All source and public files** — present in repo
- [x] **Environment-variable inventory** — `.env.example` + table above
- [x] **Database connection** — Supabase direct connection string
- [x] **Database seed** — `db/seed.sql` + `pnpm db:seed`
- [ ] **Authentication** — Supabase Auth (planned)
- [ ] **Deployment outside Vercel** — Dockerfile or platform config

---

## Multi-platform roadmap

Server Actions work for the web app only. Browser, iOS, and Android will share **Supabase Auth + Postgres + Realtime**. Offline mobile sync will need an additional layer (e.g. PowerSync) later.

```
Browser (Next.js)  ──┐
iOS (Swift)        ──┼──► Supabase Auth + Postgres (+ Realtime)
Android (Kotlin)   ──┘
```

---

## Project structure

```
app/                  Next.js App Router (page, layout, server actions)
components/           UI — calendar grid, sidebars, shadcn components
db/                   seed.sql, migrations (generated)
lib/db/               Drizzle schema + Postgres pool
scripts/              seed.ts
```

---

## Deploy anywhere

1. Create a Supabase project and set `DATABASE_URL` + `DB_SSL=true` on the host
2. `pnpm db:push && pnpm db:seed`
3. `pnpm build && pnpm start`
