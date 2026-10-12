# Celebria — Luxury Digital Wedding Invitations

Static site for GitHub Pages. Public landing page + password-protected admin.

## Deploy on GitHub Pages

1. Push this folder to a GitHub repo
2. Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`
3. Site URL: `https://YOUR_USERNAME.github.io/REPO_NAME/`

## Files

```
celebria/
├── index.html      # Public landing page (no admin links)
├── admin.html      # Password-protected admin dashboard
├── css/styles.css
├── js/app.js       # Public page logic
├── js/admin.js     # Admin + auth logic
└── README.md
```

## Admin access

- URL: `https://YOUR_USERNAME.github.io/REPO_NAME/admin.html`
- **Default password:** `celebria2026`
- Change it in `js/admin.js` → line with `ADMIN_PASSWORD`
- Session lasts 8 hours (sessionStorage); use **Logout** to clear

**Important:** This is client-side protection only. Anyone who views the source can find the password. For real security you need a backend (or a service like Cloudflare Access / Netlify Identity). Do not put sensitive customer data here without a proper backend.

## Icons

All icons use **Font Awesome 6** via CDN:

```
https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css
```

## Data storage

Templates, orders, and settings are stored in the visitor's browser `localStorage`.
Each browser has its own data — fine for demos; for production you need a real database/API.

## Quick local test

Open `index.html` or `admin.html` in a browser, or:

```bash
npx serve .
```
