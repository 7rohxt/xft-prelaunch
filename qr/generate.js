/**
 * Xing Fu Tang — launch QR generator.
 * Produces 4 variants as TRUE VECTOR (.svg, sharp at any size — 30/60cm+)
 * and high-resolution .png, into ./out.
 *
 *   npm install
 *   node generate.js
 *
 * Change the URL once (below) or pass one:  QR_URL="https://join.xingfutang.in" node generate.js
 *
 * Error-correction level H is used everywhere so the centre logo/mascot
 * versions stay scannable. ALWAYS test-scan the final print.
 */
const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const URL = process.env.QR_URL || 'https://xft-prelaunch.vercel.app/';
const OUT = path.join(__dirname, 'out');
const PNG_SIZE = 3000;                       // px — plenty for large-format print
const EC = 'H';                              // highest error correction
const MARGIN = 4;                            // quiet zone, in modules
const BORDER_FRAC = 0.035;                   // solid border around the centre pill (fraction of box width)

fs.mkdirSync(OUT, { recursive: true });

// box = [widthFraction, heightFraction] of the QR's full width
const VARIANTS = [
  { name: 'qr-classic', dark: '#111111', light: '#FFFFFF' },
  { name: 'qr-logo',    dark: '#111111', light: '#FFFFFF', center: 'assets/logo.png',   box: [0.30, 0.175] },
  { name: 'qr-mascot',  dark: '#111111', light: '#FFFFFF', center: 'assets/mascot.png', box: [0.22, 0.22] },
];

const opts = (dark, light) => ({ errorCorrectionLevel: EC, margin: MARGIN, color: { dark, light } });

async function compositePng(pngBuf, v) {
  const meta = await sharp(pngBuf).metadata();
  const W = meta.width;
  const boxW = Math.round(W * v.box[0]);
  const boxH = Math.round(W * v.box[1]);
  const rx = Math.round(boxW * 0.16);
  const pad = Math.round(boxW * 0.10);
  const left = Math.round((W - boxW) / 2);
  const top = Math.round((W - boxH) / 2);

  const bw = Math.max(2, Math.round(boxW * BORDER_FRAC));  // solid border, inset so it stays inside the box
  const pill = Buffer.from(
    `<svg width="${boxW}" height="${boxH}"><rect x="${bw / 2}" y="${bw / 2}" width="${boxW - bw}" height="${boxH - bw}" rx="${rx}" ry="${rx}" fill="${v.light}" stroke="${v.dark}" stroke-width="${bw}"/></svg>`
  );
  const logo = await sharp(path.join(__dirname, v.center))
    .resize({ width: boxW - 2 * pad, height: boxH - 2 * pad, fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();

  return sharp(pngBuf)
    .composite([
      { input: pill, left, top },
      { input: logo, left: Math.round((W - logoMeta.width) / 2), top: Math.round((W - logoMeta.height) / 2) },
    ])
    .png()
    .toBuffer();
}

async function injectSvg(svg, v) {
  const m = svg.match(/viewBox="0 0 ([\d.]+) [\d.]+"/);
  const S = parseFloat(m[1]);
  const boxW = S * v.box[0], boxH = S * v.box[1];
  const rx = boxW * 0.16;
  const x = (S - boxW) / 2, y = (S - boxH) / 2;
  const pad = boxW * 0.10;
  const meta = await sharp(path.join(__dirname, v.center)).metadata();
  const ar = meta.width / meta.height;
  let iw = boxW - 2 * pad, ih = iw / ar;
  if (ih > boxH - 2 * pad) { ih = boxH - 2 * pad; iw = ih * ar; }
  const ix = (S - iw) / 2, iy = (S - ih) / 2;
  const b64 = fs.readFileSync(path.join(__dirname, v.center)).toString('base64');
  const bw = boxW * BORDER_FRAC;  // solid border, inset so it stays inside the box footprint
  const insert =
    `<rect x="${(x + bw / 2).toFixed(2)}" y="${(y + bw / 2).toFixed(2)}" width="${(boxW - bw).toFixed(2)}" height="${(boxH - bw).toFixed(2)}" rx="${rx.toFixed(2)}" fill="${v.light}" stroke="${v.dark}" stroke-width="${bw.toFixed(2)}"/>` +
    `<image x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${iw.toFixed(2)}" height="${ih.toFixed(2)}" href="data:image/png;base64,${b64}"/>`;
  return svg.replace('</svg>', insert + '</svg>');
}

async function make(v) {
  let svg = await QRCode.toString(URL, { type: 'svg', ...opts(v.dark, v.light) });
  let png = await QRCode.toBuffer(URL, { type: 'png', width: PNG_SIZE, ...opts(v.dark, v.light) });
  if (v.center) {
    png = await compositePng(png, v);
    svg = await injectSvg(svg, v);
  }
  fs.writeFileSync(path.join(OUT, v.name + '.svg'), svg);
  fs.writeFileSync(path.join(OUT, v.name + '.png'), png);
  console.log('  ✓', v.name + '.svg', '+', v.name + '.png');
}

(async () => {
  console.log('QR target:', URL, '\nWriting to', OUT, '\n');
  for (const v of VARIANTS) await make(v);
  console.log('\nDone. Vector .svg = best for large print. Always test-scan the final print.');
})();
