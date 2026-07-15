// Sfondo di particelle 2D: petali, cuoricini e scintille
// nei toni rosa/lilla che fluttuano lentamente verso l'alto.
import { useEffect, useRef } from 'react'

const COLORS = ['#f7a8c9', '#c9a8f7', '#e8b4d8', '#b995e8', '#f2c4dd']

function makeParticle(w, h, spawnAnywhere) {
  const kind = Math.random() < 0.16 ? 'heart' : Math.random() < 0.5 ? 'petal' : 'spark'
  return {
    kind,
    x: Math.random() * w,
    y: spawnAnywhere ? Math.random() * h : h + 30,
    size: kind === 'spark' ? 1 + Math.random() * 2.2 : 7 + Math.random() * 12,
    speed: 0.15 + Math.random() * 0.45,
    drift: (Math.random() - 0.5) * 0.35,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.012,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    alpha: 0.25 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
  }
}

function drawHeartPath(ctx, s) {
  ctx.beginPath()
  ctx.moveTo(0, s * 0.35)
  ctx.bezierCurveTo(-s * 0.1, s * 0.05, -s * 0.5, -s * 0.1, -s * 0.5, -s * 0.45)
  ctx.bezierCurveTo(-s * 0.5, -s * 0.75, -s * 0.25, -s * 0.85, 0, -s * 0.55)
  ctx.bezierCurveTo(s * 0.25, -s * 0.85, s * 0.5, -s * 0.75, s * 0.5, -s * 0.45)
  ctx.bezierCurveTo(s * 0.5, -s * 0.1, s * 0.1, s * 0.05, 0, s * 0.35)
}

export function Particles() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let particles = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.min(70, Math.round((window.innerWidth * window.innerHeight) / 26000))
      particles = Array.from({ length: target }, () =>
        makeParticle(window.innerWidth, window.innerHeight, true)
      )
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - last) / 16.7, 3)
      last = now
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.y -= p.speed * dt
        p.x += (p.drift + Math.sin(now * 0.0006 + p.phase) * 0.25) * dt
        p.rot += p.rotSpeed * dt
        if (p.y < -40 || p.x < -50 || p.x > w + 50) particles[i] = makeParticle(w, h, false)

        const twinkle =
          p.kind === 'spark' ? 0.55 + 0.45 * Math.sin(now * 0.003 + p.phase * 7) : 1
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.alpha * twinkle

        if (p.kind === 'spark') {
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 3.2)
          g.addColorStop(0, p.color)
          g.addColorStop(1, 'transparent')
          ctx.fillStyle = g
          ctx.fillRect(-p.size * 3.2, -p.size * 3.2, p.size * 6.4, p.size * 6.4)
        } else if (p.kind === 'heart') {
          ctx.fillStyle = p.color
          drawHeartPath(ctx, p.size)
          ctx.fill()
        } else {
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size * 0.55, p.size * 0.32, 0, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particles-canvas" />
}
