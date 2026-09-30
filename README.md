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

## Known issue

`web/.env` is currently **committed to the repository** and its `.gitignore` does not cover `.env`. It contains an `AUTH_SECRET`. That secret must be rotated and the file removed from history before this repo is shared or made public. Tracked separately, not fixed silently, because rotating a credential is your call.

---

## Status

Dormant. No commits in over a year, and the dependency surface predates the current React Router major.
