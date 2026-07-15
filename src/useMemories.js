import { useCallback, useEffect, useRef, useState } from 'react'
import { storage } from './storage.js'

export function useMemories() {
  const [memories, setMemories] = useState([])
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('')
  const statusTimer = useRef()

  const flash = useCallback((msg, ms = 2600) => {
    setStatus(msg)
    clearTimeout(statusTimer.current)
    if (ms) statusTimer.current = setTimeout(() => setStatus(''), ms)
  }, [])

  useEffect(() => {
    storage
      .load()
      .then((list) => setMemories(list.sort((a, b) => a.position - b.position)))
      .catch((err) => {
        console.error('Caricamento ricordi fallito:', err)
        flash('⚠ Non riesco a caricare i ricordi — controlla la connessione', 6000)
      })
      .finally(() => setReady(true))
  }, [flash])

  const saveMemory = useCallback(
    async (position, data, imageBlob) => {
      flash('Salvataggio…', 0)
      try {
        let imageUrl = data.imageUrl || ''
        if (imageBlob) imageUrl = await storage.uploadImage(imageBlob)
        const record = { position, title: data.title, date: data.date, body: data.body, imageUrl }
        const next = memories.filter((m) => m.position !== position).concat(record)
        next.sort((a, b) => a.position - b.position)
        next.forEach((m, i) => (m.position = i))
        await storage.saveAll(next)
        setMemories(next)
        flash('Ricordo salvato ♥')
        return true
      } catch (err) {
        console.error('Salvataggio fallito:', err)
        flash('⚠ Salvataggio non riuscito — riprova', 5000)
        return false
      }
    },
    [memories, flash]
  )

  const deleteMemory = useCallback(
    async (position) => {
      flash('Eliminazione…', 0)
      try {
        const next = memories.filter((m) => m.position !== position)
        next.forEach((m, i) => (m.position = i))
        await storage.saveAll(next)
        setMemories(next)
        flash('Pagina rimossa')
        return true
      } catch (err) {
        console.error('Eliminazione fallita:', err)
        flash('⚠ Eliminazione non riuscita — riprova', 5000)
        return false
      }
    },
    [memories, flash]
  )

  return { memories, ready, status, saveMemory, deleteMemory, backend: storage.name }
}
