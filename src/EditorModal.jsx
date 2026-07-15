import { useRef, useState } from 'react'
import { fileToResizedBlob } from './storage.js'

export function EditorModal({ memory, isNew, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(memory?.title || '')
  const [date, setDate] = useState(memory?.date || '')
  const [body, setBody] = useState(memory?.body || '')
  const [preview, setPreview] = useState(memory?.imageUrl || '')
  const [imageBlob, setImageBlob] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef()

  const pickPhoto = async (file) => {
    if (!file) return
    try {
      const blob = await fileToResizedBlob(file)
      setImageBlob(blob)
      setPreview(URL.createObjectURL(blob))
    } catch (err) {
      console.error(err)
      alert('Non riesco a leggere questa immagine, prova con un altro file.')
    }
  }

  const handleSave = async () => {
    if (!title.trim() && !body.trim() && !preview) return
    setBusy(true)
    const ok = await onSave(
      { title: title.trim(), date: date.trim(), body: body.trim(), imageUrl: memory?.imageUrl || '' },
      imageBlob
    )
    setBusy(false)
    if (ok) onClose()
  }

  const handleDelete = async () => {
    if (!confirm('Vuoi davvero rimuovere questa pagina dal libro?')) return
    setBusy(true)
    const ok = await onDelete()
    setBusy(false)
    if (ok) onClose()
  }

  return (
    <div className="editor-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="editor-card">
        <div className="editor-title">{isNew ? 'Un nuovo ricordo' : 'Modifica il ricordo'}</div>
        <div className="editor-sub">Questa pagina verrà impaginata come una vera pagina del libro</div>

        <div className="editor-field">
          <label>Titolo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Il nostro primo viaggio"
            maxLength={40}
          />
        </div>

        <div className="editor-field">
          <label>Data o periodo</label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Estate 2023"
            maxLength={30}
          />
        </div>

        <div className="editor-field">
          <label>Fotografia</label>
          <div className="photo-drop" onClick={() => fileRef.current.click()}>
            {preview ? (
              <>
                <img src={preview} alt="anteprima" />
                <span className="photo-change">Cambia foto</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 30 }}>🖼</span>
                <span>Tocca per scegliere una foto</span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => pickPhoto(e.target.files[0])}
          />
        </div>

        <div className="editor-field">
          <label>Racconto</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Scrivi qui il vostro ricordo…"
            maxLength={700}
          />
        </div>

        <div className="editor-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={busy}>
            {busy ? 'Salvataggio…' : 'Salva nel libro ♥'}
          </button>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Annulla
          </button>
          {!isNew && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={busy}>
              Rimuovi pagina
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
