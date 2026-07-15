// Salvataggio dei ricordi: Supabase se configurato in config.js,
// altrimenti localStorage del browser.
import { createClient } from '@supabase/supabase-js'
import { CONFIG } from './config.js'

const LOCAL_KEY = 'gaia-book-memories-v1'

// Un ricordo: { position, title, date, body, imageUrl }

// ── ridimensionamento foto lato client ───────────────────────
export function fileToResizedBlob(file, maxSide = 1100, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('conversione immagine fallita'))),
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('immagine non leggibile'))
    }
    img.src = url
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.readAsDataURL(blob)
  })
}

// ── adapter localStorage ──────────────────────────────────────

const localAdapter = {
  name: 'local',
  async load() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    } catch {
      return []
    }
  },
  async saveAll(memories) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(memories))
  },
  async uploadImage(blob) {
    return blobToDataUrl(blob)
  },
}

// ── adapter Supabase ──────────────────────────────────────────

function makeSupabaseAdapter() {
  const client = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey)
  return {
    name: 'cloud',
    async load() {
      const { data, error } = await client
        .from('memories')
        .select('position, title, date, body, image_url')
        .order('position', { ascending: true })
      if (error) throw error
      return data.map((r) => ({
        position: r.position,
        title: r.title || '',
        date: r.date || '',
        body: r.body || '',
        imageUrl: r.image_url || '',
      }))
    },
    async saveAll(memories) {
      // upsert sulla posizione: se qualcosa va storto a metà, il libro
      // non resta mai vuoto (niente finestra "cancella tutto e reinserisci")
      const rows = memories.map((m) => ({
        position: m.position,
        title: m.title,
        date: m.date,
        body: m.body,
        image_url: m.imageUrl,
      }))
      if (rows.length > 0) {
        const { error } = await client.from('memories').upsert(rows, { onConflict: 'position' })
        if (error) throw error
      }
      // rimuove le pagine rimaste oltre la fine del libro (dopo un'eliminazione)
      const { error: delError } = await client
        .from('memories')
        .delete()
        .gte('position', rows.length)
      if (delError) throw delError
    },
    async uploadImage(blob) {
      const path = `ricordi/${crypto.randomUUID()}.jpg`
      const { error } = await client.storage
        .from('foto')
        .upload(path, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      const { data } = client.storage.from('foto').getPublicUrl(path)
      return data.publicUrl
    },
  }
}

export const storage =
  CONFIG.supabaseUrl && CONFIG.supabaseAnonKey ? makeSupabaseAdapter() : localAdapter
