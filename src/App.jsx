import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CONFIG } from './config.js'
import { useMemories } from './useMemories.js'
import { Experience } from './Experience.jsx'
import { EditorModal } from './EditorModal.jsx'
import { Particles } from './Particles.jsx'
import {
  toTexture,
  makeCoverCanvas,
  makeBackCoverCanvas,
  makeEndpaperCanvas,
  makeDedicationCanvas,
  makeMemoryCanvas,
  makePlaceholderCanvas,
  makeBlankCanvas,
} from './pageCanvas.js'

// Le "facce" del libro, in ordine di lettura:
// [copertina, risguardo, dedica, ricordo 0..M-1, pagina vuota da scrivere,
//  eventuale pagina bianca di pareggio, risguardo, retro copertina]
const FIRST_MEMORY_FACE = 3

function useFaceTextures(memories, ready) {
  const [textures, setTextures] = useState(null)

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    ;(async () => {
      await Promise.all([
        document.fonts.load('400 148px "Great Vibes"'),
        document.fonts.load('700 82px "Dancing Script"'),
        document.fonts.load('italic 400 44px "Cormorant Garamond"'),
        document.fonts.load('500 66px "Cormorant Garamond"'),
      ]).catch(() => {})

      const canvases = [
        makeCoverCanvas(CONFIG),
        makeEndpaperCanvas(),
        makeDedicationCanvas(CONFIG.dedication),
      ]
      for (let m = 0; m < memories.length; m++) {
        canvases.push(await makeMemoryCanvas(memories[m], m + 1))
      }
      canvases.push(makePlaceholderCanvas(memories.length + 1))
      if (canvases.length % 2 === 1) canvases.push(makeBlankCanvas())
      canvases.push(makeEndpaperCanvas())
      canvases.push(makeBackCoverCanvas(CONFIG))

      if (!cancelled) {
        setTextures((old) => {
          old?.forEach((t) => t.dispose())
          return canvases.map(toTexture)
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [memories, ready])

  return textures
}

function Landing({ visible }) {
  return (
    <div className={`landing ${visible ? '' : 'hidden'}`}>
      <div className="landing-left">
        <div className="landing-eyebrow">{CONFIG.landing.eyebrow}</div>
        <h1 className="landing-heading">{CONFIG.landing.heading}</h1>
        <p className="landing-paragraph">{CONFIG.landing.paragraph}</p>
        <div className="landing-divider" />
        <div className="landing-hint">
          {CONFIG.landing.hint} <span className="arrow">➺</span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { memories, ready, status, saveMemory, deleteMemory, backend } = useMemories()
  const faceTextures = useFaceTextures(memories, ready)
  const [mode, setMode] = useState('landing') // 'landing' | 'book'
  const [spread, setSpread] = useState(0)
  const [editingFace, setEditingFace] = useState(null)
  const timerRef = useRef()

  const leavesCount = faceTextures ? faceTextures.length / 2 : 0
  const maxSpread = Math.max(leavesCount - 1, 0)

  const openBook = useCallback(() => {
    setMode('book')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSpread(1), 1000)
  }, [])

  const closeBook = useCallback(() => {
    setSpread(0)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMode('landing'), 850)
  }, [])

  const turn = useCallback(
    (dir) => {
      setSpread((s) => {
        const next = s + dir
        if (next < 1) return s
        return Math.min(next, maxSpread)
      })
    },
    [maxSpread]
  )

  // il numero di pagine può ridursi dopo un'eliminazione
  useEffect(() => {
    if (maxSpread > 0) setSpread((s) => Math.min(s, maxSpread))
  }, [maxSpread])

  // frecce della tastiera + sfogliamento trascinando (dita o mouse)
  useEffect(() => {
    if (mode !== 'book') return
    const onKey = (e) => {
      if (editingFace !== null) return
      if (e.key === 'ArrowRight') turn(1)
      if (e.key === 'ArrowLeft') turn(-1)
      if (e.key === 'Escape') closeBook()
    }
    let touchX = null
    const onTouchStart = (e) => (touchX = e.touches[0].clientX)
    const onTouchEnd = (e) => {
      if (touchX === null || editingFace !== null) return
      const dx = e.changedTouches[0].clientX - touchX
      if (Math.abs(dx) > 55) turn(dx < 0 ? 1 : -1)
      touchX = null
    }
    let mouseX = null
    const onMouseDown = (e) => {
      if (e.target.tagName === 'CANVAS') mouseX = e.clientX
    }
    const onMouseUp = (e) => {
      if (mouseX === null || editingFace !== null) {
        mouseX = null
        return
      }
      const dx = e.clientX - mouseX
      if (Math.abs(dx) > 55) turn(dx < 0 ? 1 : -1)
      mouseX = null
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [mode, turn, closeBook, editingFace])

  // quale faccia è modificabile: i ricordi esistenti + la pagina "nuovo ricordo"
  const editableFace = useCallback(
    (face) => face >= FIRST_MEMORY_FACE && face <= FIRST_MEMORY_FACE + memories.length,
    [memories.length]
  )
  const leftFace = spread * 2 - 1
  const rightFace = spread * 2
  const editFaces = useMemo(
    () => ({
      left: editableFace(leftFace) ? leftFace : null,
      right: editableFace(rightFace) ? rightFace : null,
    }),
    [editableFace, leftFace, rightFace]
  )

  const editingIndex = editingFace !== null ? editingFace - FIRST_MEMORY_FACE : null
  const editingMemory = editingIndex !== null ? memories[editingIndex] : null

  const bookLoaded = ready && faceTextures

  return (
    <div className="app">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />
      <Particles />

      {bookLoaded && (
        <Canvas
          className="webgl-canvas"
          style={{ cursor: mode === 'book' ? 'grab' : 'auto' }}
          camera={{ position: [0, 0, 4.4], fov: 42 }}
          dpr={[1, 2]}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <Experience
            mode={mode}
            spread={spread}
            faceTextures={faceTextures}
            onCoverClick={openBook}
            editFaces={editFaces}
            onEdit={setEditingFace}
          />
        </Canvas>
      )}

      <Landing visible={mode === 'landing'} />

      <div className={`book-ui ${mode === 'book' && spread >= 1 ? 'visible' : ''}`}>
        <button
          className="nav-arrow left"
          onClick={() => turn(-1)}
          disabled={spread <= 1}
          aria-label="Pagina precedente"
        >
          ‹
        </button>
        <button
          className="nav-arrow right"
          onClick={() => turn(1)}
          disabled={spread >= maxSpread}
          aria-label="Pagina successiva"
        >
          ›
        </button>

        <div className="book-toolbar">
          <span className="page-indicator">
            {spread} / {maxSpread}
          </span>
          <div className="toolbar-sep" />
          <button className="toolbar-btn close" onClick={closeBook}>
            ✕ Chiudi il libro
          </button>
        </div>
      </div>

      {editingFace !== null && (
        <EditorModal
          memory={editingMemory}
          isNew={!editingMemory}
          onSave={(data, blob) => saveMemory(Math.min(editingIndex, memories.length), data, blob)}
          onDelete={() => deleteMemory(editingIndex)}
          onClose={() => setEditingFace(null)}
        />
      )}

      {status && <div className="save-status">{status}</div>}
      {backend === 'local' && (
        <div className="backend-badge">salvataggio locale · configura Supabase per il cloud</div>
      )}

      <div className={`loader ${bookLoaded ? 'done' : ''}`}>
        <div className="loader-heart">💜</div>
        <div className="loader-text">La nostra storia sta per aprirsi…</div>
      </div>
    </div>
  )
}
