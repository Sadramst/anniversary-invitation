# 10th Anniversary Invitation

A private, bilingual (فارسی / English) digital invitation. Every guest gets their
own link that greets them by name. No RSVP, no forms, no tracking — just a
beautiful page to open on a phone.

**Live at:** `https://www.appilico.com.au/inviteaniversery/<guest-slug>`

---

## The one thing you need to know

> **Add or remove a guest → edit [`data/guests.data.json`](data/guests.data.json), then `git commit && git push`.**
> Vercel rebuilds and regenerates every link plus a fresh `links-export.csv`.
> Want the CSV immediately without waiting for a deploy? Run `npm run generate-invites`.

**Links already sent never change.** Slugs are derived from a guest's *name*, not
their position in the list, so adding a cousin to a party does not break anyone
else's link. See [Guest links are permanent](#guest-links-are-permanent).

---

## Where to find the links

[`links-export.csv`](links-export.csv) — open it in Excel (it has a UTF-8 BOM so
Farsi names display correctly). One row per link:

| Column | Meaning |
| --- | --- |
| `type` | `party` (whole family, one link) or `individual` (one person) |
| `party_id` | Which family group |
| `greeting_en` / `greeting_fa` | Exactly how the page will greet them |
| `url` | The link to paste into WhatsApp |
| `note` | `NEEDS-NAME` if a guest's name is still missing |

Currently: **22 family links + 54 individual links = 76 pages.**

Send the *party* link to a family group chat, or the *individual* links to each
person directly — whichever you prefer, both work.

---

## Still to do before sending invitations

These are the only placeholders left. Everything else is finished.

1. **Couple names** — in `data/guests.data.json`, replace:
   - `couple.english_names`: `"REPLACE_ME_1 & REPLACE_ME_2"`
   - `couple.farsi_names`: `"نام_۱ و نام_۲"`
   - `couple.initials`: `"RR"` → your two initials (used in the monogram)
2. **Photos** — drop your 10 photos into `public/photos/` named `01.jpg` …
   `10.jpg`, overwriting the placeholders. Any resolution; landscape works best.
   Photo `01.jpg` is also the WhatsApp share thumbnail.
3. **5 missing guest names** — search `links-export.csv` for `NEEDS-NAME`
   (in `amir-party`, `saleh-party`, and `khosravi-party`). Fill in `english_name`
   in the JSON, or leave them — the page falls back to a warm generic greeting.

---

## Guest links are permanent

Each slug is a SHA-256 of the guest's identity plus a private salt, e.g.
`armita-party-g9qtmt`. This means:

- ✅ Rebuilding, redeploying, or reordering the JSON **never** changes a link.
- ✅ Adding or removing *other* guests never changes an existing guest's link.
- ⚠️ Changing a person's `english_name` **does** change their link. If you have
  already sent it, fix the spelling in `farsi_name` instead — that field is
  always safe to edit.
- ⚠️ Changing `party_id` changes the whole family's link. Don't, once sent.

The 6-character suffix comes from a 31-character alphabet (no `0`, `1`, `i`,
`l`, `o` to avoid misreads) — about 887 million combinations, so links cannot be
guessed or enumerated.

---

## Privacy

- No page anywhere lists the guest slugs. The landing page and 404 page show only
  a neutral "this is a private invitation" notice.
- `noindex, nofollow, noarchive` headers **and** meta tags on every page.
- `robots.txt` disallows everything. There is no sitemap.
- Unknown or guessed slugs return a real 404.
- No analytics, no cookies, no `localStorage`, no third-party requests.

> **Keep this repository private.** The slug salt is committed, so a public repo
> would let anyone compute all 76 guest links.

---

## Running it locally

```powershell
npm install
npm run dev          # http://localhost:3000/inviteaniversery/armita-party-g9qtmt
```

| Command | What it does |
| --- | --- |
| `npm run generate-invites` | Rebuild `links-export.csv` + `src/generated/invites.json` |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (runs `generate-invites` first) |
| `npm test` | Unit tests — 87 tests |
| `npm run test:e2e` | Browser tests — 252 tests across mobile, desktop, WhatsApp & Instagram in-app browsers |
| `npm run test:all` | Everything |

---

## Deployment

Deployed as its own Vercel project. `basePath` is `/inviteaniversery`, so the app
serves itself under that path and nothing else on the domain is affected.

**To put it on `www.appilico.com.au`,** add this rewrite to the main
`appilico-website` project's `next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: "/inviteaniversery/:path*",
      destination: "https://<this-project>.vercel.app/inviteaniversery/:path*",
    },
  ];
}
```

### Changing the URL path

`/inviteaniversery` is a misspelling of "anniversary". If you'd rather use
something cleaner — `/anniversary`, or shorter and nicer in a WhatsApp message,
`/invite` — it's a **one-line change** and costs nothing right now:

1. Set `NEXT_PUBLIC_BASE_PATH=/invite` in the Vercel project's environment variables.
2. Redeploy. Every link in `links-export.csv` regenerates with the new path.

Do this **before** sending any invitations — afterwards the old links would break.

> Recommendation: `/invite` reads best and is easiest to type; `/anniversary` is
> the most descriptive. Both look more polished than the current misspelling.

---

## How it's built

- **Next.js 16** (App Router) — all 80 pages are statically generated at build
  time, so they load instantly and work even if JavaScript is blocked.
- **Farsi is the default**, with a one-tap toggle to English. Language lives in
  the URL (`?lang=en`), never in storage — WhatsApp and Instagram in-app browsers
  can throw when a page touches `localStorage`.
- Full RTL/LTR mirroring: layout, icons, and keyboard navigation all flip.
- **Add to calendar** works offline — the `.ics` file is embedded directly in the
  server-rendered HTML rather than generated by JavaScript.
- Dates and times are formatted on the server with hand-written formatters, not
  `Intl`, because Node and mobile browsers ship different locale data and the
  mismatch would corrupt the page during hydration.

### Project layout

```
data/guests.data.json      ← the only file you normally edit
scripts/generate-invites   ← turns that into slugs, links and the CSV
src/lib/                   ← dates, calendar, translations, photo list
src/components/            ← hero, gallery, countdown, monogram, …
src/generated/invites.json ← committed on purpose, keeps links auditable
tests/unit + tests/e2e     ← 339 tests
```
