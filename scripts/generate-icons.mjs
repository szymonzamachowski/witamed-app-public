/**
 * Generuje ikony PWA z logo: node scripts/generate-icons.mjs
 * Logo ma szerokie białe marginesy, więc przycinamy je do koła z rysunkiem.
 */
import { Jimp } from 'jimp'
import { mkdirSync } from 'fs'

const SRC = 'public/photos/logo.png'
const OUT = 'public/icons'
mkdirSync(OUT, { recursive: true })

const logo = await Jimp.read(SRC)
const size = logo.width
// rysunek zajmuje środek ~70% pliku
const crop = Math.round(size * 0.72)
const offset = Math.round((size - crop) / 2)
const art = logo.clone().crop({ x: offset, y: offset, w: crop, h: crop })

async function make(name, px, padding, bg) {
  const canvas = new Jimp({ width: px, height: px, color: bg })
  const inner = Math.round(px * (1 - padding * 2))
  const img = art.clone().resize({ w: inner, h: inner })
  canvas.composite(img, Math.round((px - inner) / 2), Math.round((px - inner) / 2))
  await canvas.write(`${OUT}/${name}`)
  console.log('✓', name)
}

await make('icon-192.png', 192, 0.04, 0xffffffff)
await make('icon-512.png', 512, 0.04, 0xffffffff)
await make('maskable-512.png', 512, 0.14, 0xffffffff) // strefa bezpieczna dla Androida
await make('apple-touch-icon.png', 180, 0.06, 0xffffffff)
