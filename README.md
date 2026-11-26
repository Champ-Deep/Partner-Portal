# Partner-Portal

A partner-facing portal for external collaborators. Auth-gated React Router frontend with a plugin system, built on the Create adapter pattern.

A Champions Group product.

---

## What it is

External partners get a scoped view into what they share with Champions Group, behind authentication. The interesting part is the **plugin layer**: everything under `web/plugins/` is a transformation that runs on the app's own request and render path, so cross-cutting concerns are added without editing route modules.

---

## Layout

```
web/
  __create/     adapter internals: auth actions, route builder, error pages, fetch
  plugins/      request/render transforms (aliases, layouts, fonts, render ids, HMR)
  src/          routes and components
  test/
```

The `__create/` and `plugins/` split is the Create framework's convention: the adapter owns the mechanics, plugins opt into them. Read `web/plugins/aliases.ts` and `web/plugins/layouts.ts` first; they explain how everything else is wired.

---

## Tech stack

JavaScript · React Router 7 · Tailwind CSS · PostCSS · Bun or npm · Stripe (`src/__create/stripe.ts`).

---

## Local development

**Requirements:** Node 20+ and either Bun or npm.

```bash
git clone git@github.com:Champ-Deep/Partner-Portal.git
cd Partner-Portal/web
npm install        # or: bun install
cp .env.example .env
npm run dev
```

---

## Environment

Copy `web/.env.example` to `web/.env` and fill in real values locally, or set the same names in hosting. The app reads `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, and `CORS_ORIGINS` from the process environment. `.env` is gitignored.

`web/.env` used to be committed. It is no longer in the tree, but the old values remain in git history. Rotate `AUTH_SECRET` and the database password inside `DATABASE_URL`, then set the new values in hosting. Do not commit real secrets.

---

## Status

Dormant. No commits in over a year, and the dependency surface predates the current React Router major.
