# Enduresquad Worksheet MVP

## What this is
A mobile-first worksheet that loads per-episode content via `?ep=E0X`, saves anonymous events to Supabase, and shows a public stats summary.

## Live URLs
- Worksheet: `https://worksheet.enduresquad.com/?ep=E02`
- Stats (all): `https://worksheet.enduresquad.com/stats.html`
- Stats (per episode): `https://worksheet.enduresquad.com/stats.html?ep=E02`

## Where to edit
- Episode content: `public/episodes/E01.json` ... `public/episodes/E08.json`
- UI + logic: `public/script.js`
- Styles: `public/styles.css`
- Stats copy/logic: `public/stats.js`
- Base config (Supabase keys): `public/config.js`

## Deployment
Use the helper script:
```
/Users/asif.rafiq/Documents/endure-worksheet/git-push.sh "Your message"
```

## Notes
- Episode routing uses `?ep=E0X` and loads JSON from `public/episodes/`.
- Supabase events include `episode_id` in payload.
- Public stats read from Supabase views (see HLD.md for view definitions).
