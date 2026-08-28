# Xing Fu Tang — Pre-launch signup (Vite + React)

A small React + Vite microsite for the QR code. A customer scans (almost always
on a phone) → lands here → enters name + phone (email optional) → the row lands
in a Google Sheet → they get a "Buy 1 Get 1 free, any drink" launch code in a popup.

**This folder is intentionally separate from the POS/CRM app** and is meant to be
gitignored from the main repo. It shares no code with the product. When the shop
opens, export the Sheet and import the phone numbers into the CRM as customers
with their launch voucher (phone is the join key).

## Project layout
```
prelaunch/
├─ index.html          Vite entry
├─ package.json        deps + scripts
├─ vite.config.js
├─ .env.example        copy to .env, add your Sheet endpoint
├─ apps-script.gs      the Google Apps Script (paste into the Sheet)
├─ public/
│  └─ logo.png         real Xing Fu Tang logo
└─ src/
   ├─ main.jsx
   ├─ App.jsx          the signup page + logic
   └─ index.css        mobile-first styles
```

## 1. Run it locally
```
cd prelaunch
npm install
npm run dev            # http://localhost:5173
```
No need to `npm create vite` — the project is already set up. In dev the form
runs in "preview mode" (nothing saved) until you set the endpoint below.

## 2. Create the Google Sheet + Apps Script
1. New sheet at <https://sheets.new> — name it e.g. **XFT Pre-launch Signups**.
2. **Extensions → Apps Script**, delete the sample, paste all of `apps-script.gs`, **Save**.

## 3. Deploy the script as a Web App
1. **Deploy → New deployment** → gear → **Web app**.
2. Execute as **Me**; Who has access **Anyone**. **Deploy**, authorize.
3. Copy the Web app URL (ends in `/exec`). Open it in a browser to confirm you
   see `{"ok":true,"msg":"XFT pre-launch endpoint is live"}`.

## 4. Point the app at the Sheet
```
cp .env.example .env
```
Put the URL in `.env`:
```
VITE_SIGNUP_ENDPOINT=https://script.google.com/macros/s/……/exec
```
Restart `npm run dev`, submit a test → the row appears in the Sheet.

> The page posts in `no-cors` mode (the standard way a static page talks to Apps
> Script), so the browser can't read the response. That's why the launch code is
> generated in the page and sent along — the same code is stored in the Sheet.
> Duplicate phone numbers are ignored server-side.

## 5. Build + host (free)
```
npm run build         # outputs dist/
```
Deploy the **`dist/`** folder to any static host:
- **Netlify**: drag `dist/` onto <https://app.netlify.com/drop>, or connect the repo
  with build command `npm run build` and publish dir `dist`. Add `VITE_SIGNUP_ENDPOINT`
  in the site's environment variables if you build on Netlify.
- Vercel / Cloudflare Pages / GitHub Pages work the same way.

Add a custom domain later (e.g. `join.xingfutang.in`) if you like.

## 6. QR code
Point a QR generator at your live URL and print it on the standee/poster.
Test with a phone before printing at size.

## When the shop opens
1. **File → Download → CSV** from the Sheet.
2. Import phones into the CRM as customers, each issued the launch BOGO voucher.
3. Take the page down (or show a "We're open!" message) and retire the QR.

## Tweaking
- Colours: `src/index.css` `:root` variables.
- Copy / offer wording: `src/App.jsx`.
- Fields: name + phone required, email optional — see `validate()` in `App.jsx`.
