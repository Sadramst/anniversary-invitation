# 10th Anniversary Invitation

A private, bilingual (فارسی / English) digital invitation. Every guest gets their
own link that greets them by name. No RSVP, no forms, no tracking — just a
beautiful page to open on a phone.

**Live at:** `https://www.appilico.com.au/anniversary/<guest-slug>`

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
| `Name (EN)` / `Name (FA)` | Exactly how the page will greet them |
| `Party` | Which family group |
| `Link type` | `Family link` (whole group, one link) or `Individual link` |
| `People` | How many guests that link covers |
| `Status` | `ready`, or `NEEDS-NAME` if a guest's name is still missing |
| `URL` | The link to paste into WhatsApp |

Currently: **24 family links + 55 individual links = 79 links**, all `ready`.

Send the *family* link to a group chat, or the *individual* links to each person
directly — whichever you prefer, both work.

---

## Changing the invitation later

Everything is finished — names, photo, wording and guest list are all real.
There are only **two files** you ever need to open:

### 1. `data/content.data.json` — every word on the page

All the wording lives here, in two blocks: `fa` (Farsi, shown by default) and
`en` (English, shown when the guest taps the language button). Change the text
inside the double quotes, save, run `npm run build` — nothing else to touch.

```jsonc
"fa": {
  "anniversaryLabel": "سالگرد ازدواج ما",     ← change this
  "invitation": [                              ← each line is one paragraph
    "با عشق و سپاس …",
    "ده سال پیش …"
  ],
  "dressValue": "رسمی"
}
```

Rules: keep every key that exists in `fa` also in `en`; `invitation` and
`pillars` are lists you can add to or shorten freely. A unit test fails the
build if the two languages fall out of sync or if Farsi text is left in English.

### 2. `data/guests.data.json` — the people, place and time

- **Guest list** — the `parties` array. Read "Guest links are permanent" below
  first.
- **Couple names** — the `couple` object. `farsi_names` is what the hero shows;
  `name_parts.fa` is the pair split either side of the gold `&`.
- **Venue / date / time** — the `venue` and `event` objects.

### Photo

There is one photograph, `public/photos/01.jpg`. It is used as the faint page
background and as the WhatsApp share thumbnail. Replace the file to change it —
no code change needed.

### Farsi display font

The decorative Persian face used for the names and headings is set in one place,
`--font-fa-display` in `src/app/globals.css`. To try a different one, import it
in `src/app/layout.tsx` and change that single line.

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
> would let anyone compute all 79 guest links.

---

## Running it locally

```powershell
npm install
npm run dev          # http://localhost:3000/anniversary/armita-party-g9qtmt
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

Deployed as its own Vercel project. `basePath` is `/anniversary`, so the app
serves itself under that path and nothing else on the domain is affected.

**To put it on `www.appilico.com.au`,** add this rewrite to the main
`appilico-website` project's `next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: "/anniversary/:path*",
      destination: "https://anniversary-two-vert.vercel.app/anniversary/:path*",
    },
  ];
}
```

A *rewrite* (not a redirect) keeps the guest's address bar on
`www.appilico.com.au`, and makes the `og:image` resolve so WhatsApp shows the
share thumbnail.

### Changing the URL path

Set `NEXT_PUBLIC_BASE_PATH` in the Vercel project's environment variables and
redeploy — every link in `links-export.csv` regenerates with the new path. The
per-guest slugs themselves are unaffected, only the prefix moves.

Do this **before** sending any invitations — afterwards the old links would break.

---

## How it's built

- **Next.js 16** (App Router) — all 80 pages are statically generated at build
  time, so they load instantly and work even if JavaScript is blocked.
- **Ivory, burgundy and gold** classical invitation styling: a thin gold arch
  and hand-drawn SVG floral corners — all vector, so nothing extra is
  downloaded and everything stays sharp on any screen.
- The couple's photograph sits behind the whole page at low opacity as a soft
  paper texture rather than a picture.
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
data/content.data.json     ← every word on the invitation
data/guests.data.json      ← people, venue, date
scripts/generate-invites   ← turns that into slugs, links and the CSV
src/lib/                   ← dates, calendar, translations, photo
src/components/            ← hero, florals, countdown, …
src/generated/invites.json ← committed on purpose, keeps links auditable
tests/unit + tests/e2e     ← 299 tests
```
