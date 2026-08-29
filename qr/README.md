# Xing Fu Tang — Launch QR codes

Regenerate all four launch QR variants as **vector SVG** (sharp at any print
size — 30 cm, 60 cm, a whole wall) and **high-resolution PNG** (3000 px).

## Run it

```bash
cd prelaunch/qr
npm install
node generate.js
```

Output lands in `qr/out/`:

| File | Use |
|------|-----|
| `qr-classic.svg` / `.png` | Black on white — **most reliable**, best for print |
| `qr-brand.svg` / `.png`   | Brown-sugar on cream — matches the standee |
| `qr-logo.svg` / `.png`    | Brand logo in the centre |
| `qr-mascot.svg` / `.png`  | Bobaosaur in the centre |

## Change the link

Either edit the `URL` line at the top of `generate.js`, or pass it in once:

```bash
QR_URL="https://join.xingfutang.in" node generate.js
```

(Do this after you point a custom domain at the Vercel site.)

## Notes

- All codes use **error-correction level H** so the centre-logo/mascot versions
  stay scannable. The plain **Classic** code is still the safest for a busy mall.
- For any large print, **use the `.svg`** — it's true vector and never blurs.
  The `.png` files are a 3000 px fallback for tools that need a raster.
- Keep the pale border (quiet zone) around the code clear — don't crop tight.
- **Always test-scan the actual print** before mass-producing.

Assets used for the centre versions live in `assets/` (`logo.png`, `mascot.png`).
Swap those files to restyle without touching the code.
