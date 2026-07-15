// Genera le texture del libro disegnandole su canvas:
// copertina, retro, risguardi, pagina della dedica e pagine dei ricordi.
import * as THREE from 'three'

const PAGE_W = 1024
const PAGE_H = 1424

const PALETTE = {
  paper: '#fdf6ee',
  paperShade: '#f3e4dc',
  ink: '#4a2b5e',
  inkSoft: '#7a5a8e',
  accent: '#8b5fbf',
  rosa: '#d9779e',
  gold: '#c9a15a',
  coverDark: '#3b1a5e',
  coverMid: '#5c2d84',
  coverRosa: '#a04f86',
}

function makeCanvas() {
  const c = document.createElement('canvas')
  c.width = PAGE_W
  c.height = PAGE_H
  return c
}

export function toTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// ── helper di disegno ─────────────────────────────────────────

function wrapText(ctx, text, maxWidth) {
  const lines = []
  for (const rawLine of text.split('\n')) {
    if (rawLine.trim() === '') {
      lines.push('')
      continue
    }
    let line = ''
    for (const word of rawLine.split(' ')) {
      const test = line ? line + ' ' + word : word
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

function paperBackground(ctx) {
  const g = ctx.createLinearGradient(0, 0, PAGE_W, PAGE_H)
  g.addColorStop(0, '#fefaf4')
  g.addColorStop(0.5, PALETTE.paper)
  g.addColorStop(1, '#f7ebe6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)

  // grana della carta (rumore deterministico, leggero)
  ctx.save()
  ctx.globalAlpha = 0.05
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  ctx.fillStyle = '#a08466'
  for (let i = 0; i < 900; i++) {
    ctx.fillRect(rand() * PAGE_W, rand() * PAGE_H, 1.6, 1.6)
  }
  ctx.restore()

  // ombra verso la rilegatura
  const shade = ctx.createLinearGradient(0, 0, 90, 0)
  shade.addColorStop(0, 'rgba(120,80,60,0.16)')
  shade.addColorStop(1, 'rgba(120,80,60,0)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, 90, PAGE_H)
}

function cornerFlourish(ctx, x, y, sx, sy, color = PALETTE.rosa) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(sx, sy)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.moveTo(0, 62)
  ctx.quadraticCurveTo(0, 0, 62, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(10, 84)
  ctx.quadraticCurveTo(10, 10, 84, 10)
  ctx.stroke()
  drawHeart(ctx, 30, 30, 9, color, 0.8)
  ctx.restore()
}

export function drawHeart(ctx, x, y, size, color, alpha = 1) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 10, size / 10)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 3.5)
  ctx.bezierCurveTo(-1, 0.5, -5, -1, -5, -4.5)
  ctx.bezierCurveTo(-5, -7.5, -2.5, -8.5, 0, -5.5)
  ctx.bezierCurveTo(2.5, -8.5, 5, -7.5, 5, -4.5)
  ctx.bezierCurveTo(5, -1, 1, 0.5, 0, 3.5)
  ctx.fill()
  ctx.restore()
}

function heartDivider(ctx, cx, y, color = PALETTE.rosa) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 130, y)
  ctx.lineTo(cx - 26, y)
  ctx.moveTo(cx + 26, y)
  ctx.lineTo(cx + 130, y)
  ctx.stroke()
  drawHeart(ctx, cx, y, 12, color, 0.75)
  ctx.restore()
}

// ── copertina ─────────────────────────────────────────────────

function coverBackground(ctx) {
  const g = ctx.createLinearGradient(0, 0, PAGE_W * 0.7, PAGE_H)
  g.addColorStop(0, PALETTE.coverMid)
  g.addColorStop(0.45, PALETTE.coverDark)
  g.addColorStop(1, '#2a1145')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)

  // riflesso morbido rosato in alto a destra
  const glow = ctx.createRadialGradient(PAGE_W * 0.78, PAGE_H * 0.16, 40, PAGE_W * 0.78, PAGE_H * 0.16, 620)
  glow.addColorStop(0, 'rgba(217,119,158,0.30)')
  glow.addColorStop(1, 'rgba(217,119,158,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)

  // vignettatura
  const vig = ctx.createRadialGradient(PAGE_W / 2, PAGE_H / 2, PAGE_H * 0.35, PAGE_W / 2, PAGE_H / 2, PAGE_H * 0.78)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(10,4,20,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)
}

function goldFrame(ctx, inset, lineWidth = 4) {
  ctx.save()
  ctx.strokeStyle = PALETTE.gold
  ctx.lineWidth = lineWidth
  ctx.shadowColor = 'rgba(201,161,90,0.45)'
  ctx.shadowBlur = 12
  ctx.strokeRect(inset, inset, PAGE_W - inset * 2, PAGE_H - inset * 2)
  ctx.restore()
}

export function makeCoverCanvas(config) {
  const c = makeCanvas()
  const ctx = c.getContext('2d')
  coverBackground(ctx)
  goldFrame(ctx, 46, 5)
  goldFrame(ctx, 62, 2)

  // ornamenti agli angoli della cornice
  const corners = [
    [86, 86, 1, 1],
    [PAGE_W - 86, 86, -1, 1],
    [86, PAGE_H - 86, 1, -1],
    [PAGE_W - 86, PAGE_H - 86, -1, -1],
  ]
  for (const [x, y, sx, sy] of corners) cornerFlourish(ctx, x, y, sx, sy, PALETTE.gold)

  const cx = PAGE_W / 2

  // cuore in alto
  ctx.save()
  ctx.shadowColor = 'rgba(217,119,158,0.8)'
  ctx.shadowBlur = 30
  drawHeart(ctx, cx, 300, 42, '#e8a0c0')
  ctx.restore()

  // titolo
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f3d9a8'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 16
  ctx.font = '400 148px "Great Vibes"'
  const words = config.title.split(' ')
  if (words.length >= 3) {
    ctx.fillText(words.slice(0, 2).join(' '), cx, 560)
    ctx.fillText(words.slice(2).join(' '), cx, 730)
  } else {
    ctx.fillText(config.title, cx, 640)
  }
  ctx.shadowBlur = 0

  heartDivider(ctx, cx, 830, PALETTE.gold)

  // nomi
  ctx.fillStyle = '#f0e0f5'
  ctx.font = '500 66px "Cormorant Garamond"'
  ctx.fillText(`${config.names.him}  ♥  ${config.names.her}`, cx, 950)

  // sottotitolo
  ctx.fillStyle = 'rgba(240,224,245,0.75)'
  ctx.font = 'italic 400 40px "Cormorant Garamond"'
  ctx.fillText(config.coverSubtitle, cx, PAGE_H - 150)

  return c
}

export function makeBackCoverCanvas(config) {
  const c = makeCanvas()
  const ctx = c.getContext('2d')
  coverBackground(ctx)
  goldFrame(ctx, 46, 4)
  const cx = PAGE_W / 2
  drawHeart(ctx, cx, PAGE_H / 2 - 40, 34, 'rgba(232,160,192,0.85)')
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(243,217,168,0.9)'
  ctx.font = '400 64px "Great Vibes"'
  ctx.fillText(`${config.names.him} & ${config.names.her}`, cx, PAGE_H / 2 + 90)
  ctx.fillStyle = 'rgba(240,224,245,0.55)'
  ctx.font = 'italic 400 34px "Cormorant Garamond"'
  ctx.fillText('… e la storia continua', cx, PAGE_H / 2 + 160)
  return c
}

// risguardo interno delle copertine
export function makeEndpaperCanvas() {
  const c = makeCanvas()
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, PAGE_W, PAGE_H)
  g.addColorStop(0, '#efe0f2')
  g.addColorStop(1, '#e4d0ea')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)
  // pattern di cuoricini
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 11; col++) {
      const x = col * 100 + (row % 2 ? 50 : 0) + 12
      const y = row * 100 + 20
      drawHeart(ctx, x, y, 10, '#b995c9', 0.28)
    }
  }
  return c
}

// ── pagina della dedica ───────────────────────────────────────

export function makeDedicationCanvas(dedication) {
  const c = makeCanvas()
  const ctx = c.getContext('2d')
  paperBackground(ctx)
  cornerFlourish(ctx, 80, 80, 1, 1)
  cornerFlourish(ctx, PAGE_W - 80, PAGE_H - 80, -1, -1)

  const cx = PAGE_W / 2
  ctx.textAlign = 'center'

  ctx.fillStyle = PALETTE.accent
  ctx.font = '400 116px "Great Vibes"'
  ctx.fillText(dedication.title, cx, 330)

  heartDivider(ctx, cx, 420)

  ctx.fillStyle = PALETTE.ink
  ctx.font = 'italic 400 44px "Cormorant Garamond"'
  const lines = wrapText(ctx, dedication.body, PAGE_W - 300)
  let y = 550
  for (const line of lines) {
    if (line) ctx.fillText(line, cx, y)
    y += line ? 62 : 34
  }

  ctx.fillStyle = PALETTE.rosa
  ctx.font = '500 54px "Dancing Script"'
  ctx.fillText(dedication.signature, cx, Math.min(y + 90, PAGE_H - 130))

  return c
}

// ── pagina di un ricordo ──────────────────────────────────────

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function makeMemoryCanvas(memory, pageNumber) {
  const c = makeCanvas()
  const ctx = c.getContext('2d')
  paperBackground(ctx)
  cornerFlourish(ctx, 74, 74, 1, 1)
  cornerFlourish(ctx, PAGE_W - 74, 74, -1, 1)

  const cx = PAGE_W / 2
  ctx.textAlign = 'center'
  let y = 190

  if (memory.date) {
    ctx.fillStyle = PALETTE.inkSoft
    ctx.font = '400 34px "Cormorant Garamond"'
    ctx.save()
    ctx.letterSpacing = '8px'
    ctx.fillText(memory.date.toUpperCase(), cx, y)
    ctx.restore()
    y += 66
  }

  if (memory.title) {
    ctx.fillStyle = PALETTE.accent
    ctx.font = '700 82px "Dancing Script"'
    ctx.fillText(memory.title, cx, y + 26)
    y += 96
  }

  heartDivider(ctx, cx, y + 6)
  y += 64

  // foto in stile polaroid
  if (memory.imageUrl) {
    const img = await loadImage(memory.imageUrl)
    if (img) {
      const frameW = PAGE_W - 320
      const photoW = frameW - 44
      const photoH = Math.min(photoW * 0.75, 520)
      const frameH = photoH + 44 + 26
      ctx.save()
      ctx.translate(cx, y + frameH / 2)
      ctx.rotate(-0.016)
      ctx.shadowColor = 'rgba(60,30,70,0.30)'
      ctx.shadowBlur = 26
      ctx.shadowOffsetY = 10
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(-frameW / 2, -frameH / 2, frameW, frameH)
      ctx.shadowColor = 'transparent'
      // ritaglio "cover" dell'immagine dentro la cornice
      const scale = Math.max(photoW / img.width, photoH / img.height)
      const sw = photoW / scale
      const sh = photoH / scale
      ctx.drawImage(
        img,
        (img.width - sw) / 2,
        (img.height - sh) / 2,
        sw,
        sh,
        -photoW / 2,
        -frameH / 2 + 22,
        photoW,
        photoH
      )
      ctx.restore()
      y += frameH + 60
    }
  }

  // racconto
  if (memory.body) {
    ctx.fillStyle = PALETTE.ink
    ctx.font = '400 40px "Cormorant Garamond"'
    const maxLines = Math.floor((PAGE_H - 150 - y) / 56)
    const lines = wrapText(ctx, memory.body, PAGE_W - 280).slice(0, Math.max(maxLines, 0))
    for (const line of lines) {
      if (line) ctx.fillText(line, cx, y)
      y += line ? 56 : 30
    }
  }

  // numero di pagina
  ctx.fillStyle = PALETTE.inkSoft
  ctx.font = 'italic 400 32px "Cormorant Garamond"'
  ctx.fillText(`· ${pageNumber} ·`, cx, PAGE_H - 84)

  return c
}

// pagina vuota che invita ad aggiungere un ricordo
export function makePlaceholderCanvas(pageNumber) {
  const c = makeCanvas()
  const ctx = c.getContext('2d')
  paperBackground(ctx)

  const cx = PAGE_W / 2
  ctx.save()
  ctx.strokeStyle = '#cfaed4'
  ctx.setLineDash([16, 14])
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.8
  const bw = PAGE_W - 360
  const bh = 560
  const bx = cx - bw / 2
  const by = PAGE_H / 2 - bh / 2 - 40
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, 26)
  ctx.stroke()
  ctx.restore()

  ctx.textAlign = 'center'
  drawHeart(ctx, cx, PAGE_H / 2 - 190, 30, '#d9a8ce', 0.85)
  ctx.fillStyle = '#9a7ab0'
  ctx.font = '700 66px "Dancing Script"'
  ctx.fillText('Un nuovo ricordo', cx, PAGE_H / 2 - 60)
  ctx.font = 'italic 400 38px "Cormorant Garamond"'
  ctx.fillStyle = '#a98fbb'
  ctx.fillText('Premi ✎ in fondo alla pagina', cx, PAGE_H / 2 + 20)
  ctx.fillText('per scrivere questo capitolo', cx, PAGE_H / 2 + 72)

  ctx.fillStyle = PALETTE.inkSoft
  ctx.font = 'italic 400 32px "Cormorant Garamond"'
  ctx.fillText(`· ${pageNumber} ·`, cx, PAGE_H - 84)
  return c
}

// pagina completamente bianca (retro non ancora usato)
export function makeBlankCanvas() {
  const c = makeCanvas()
  paperBackground(c.getContext('2d'))
  return c
}
