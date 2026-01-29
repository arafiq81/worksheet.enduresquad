# How to Reconnect and Continue with Codex

## Resume this project
1) Open Codex and describe what you want to change.
2) Share the repo path:
   `/Users/asif.rafiq/Library/CloudStorage/OneDrive-VodafoneGroup/Documents/endure-worksheet`
3) Codex will edit files and deploy using the helper script.

## Useful commands
- Deploy changes:
```
/Users/asif.rafiq/Documents/endure-worksheet/git-push.sh "Update message"
```
- Open live site:
```
/Users/asif.rafiq/Documents/endure-worksheet/open-site.sh
```

## Common edits
- Episode content: `public/episodes/E0X.json`
- Colors/layout: `public/styles.css`
- Logic: `public/script.js`
- Stats: `public/stats.js`

## Supabase keys
- Stored in `public/config.js`
- Use **anon public key** only (JWT with two dots)
