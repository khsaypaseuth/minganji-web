# MingAnji.ai — marketing website

Multilingual marketing site for **MingAnji.ai** (Powered by Tian'An).
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · next-intl · GSAP ScrollTrigger · inline SVG.

## Run

```bash
npm install
cp .env.example .env.local   # optional: AI key and contact-form webhook
npm run dev                  # http://localhost:3000  (redirects to /en)
```

Production: `npm run build && npm start`.

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run check:i18n                       # all locales have the same keys
npx playwright install chromium          # once
BASE=http://localhost:3000 OUT=/tmp/shots node scripts/verify.mjs   # 57 end-to-end checks
```

## Where things live

| Path | What |
| --- | --- |
| `messages/{en,zh,lo,th,vi}.json` | All interface text (English is the source) |
| `src/i18n/` | Locales, routing, language metadata (names + flags) |
| `src/components/story/` | Homepage truck → dashboard story (`states.ts` drives animation and static frames) |
| `src/content/knowledge/` | Public knowledge base for the AI assistant (+ `README.md` listing sources) |
| `src/app/api/chat/route.ts` | AI assistant backend (key stays on server; limits, validation, timeouts) |
| `src/app/api/contact/route.ts` | Enquiry backend (webhook delivery) |
| `src/lib/site.ts` | Verified facts: email, sign-in URL, location |
| `HANDOFF.md` | Decisions, assumptions, what is real vs illustrative, open items |
