// ─────────────────────────────────────────────────────────────
//  Personalizza qui il tuo regalo 💜
// ─────────────────────────────────────────────────────────────

export const CONFIG = {
  // I vostri nomi (compaiono sulla copertina e nella landing)
  names: {
    him: 'Thomas',
    her: 'Gaia',
  },

  // Titolo del libro e del sito
  title: 'La Nostra Storia',

  // Sottotitolo sulla copertina
  coverSubtitle: 'Per la tua Laurea · Luglio 2026',

  // Testo della landing page (colonna di sinistra)
  landing: {
    eyebrow: 'Per la Dottoressa',
    heading: 'Gaia',
    paragraph:
      'Ogni grande storia merita di essere scritta. La nostra è fatta di risate, viaggi, abbracci e traguardi — e oggi ne festeggiamo uno tutto tuo. Ti ho preparato un libro: dentro ci siamo noi.',
    hint: 'Tocca il libro per aprirlo',
  },

  // Dedica sulla prima pagina del libro
  dedication: {
    title: 'Per Gaia',
    body:
      'Alla ragazza che trasforma ogni giorno in una pagina bellissima.\n\nQuesto libro raccoglierà i nostri ricordi più belli: sfoglialo piano, come abbiamo vissuto ogni momento.\n\nSono orgoglioso di te, oggi più che mai.',
    signature: 'Con tutto il mio amore, Thomas',
  },

  // ── Supabase (salvataggio cloud) ─────────────────────────────
  // I valori arrivano dalle variabili d'ambiente:
  //   in locale  → file .env.local (vedi .env.example)
  //   su Vercel  → Project Settings → Environment Variables
  // Finché mancano, i ricordi vengono salvati nel browser (localStorage).
  // Guida completa in SUPABASE.md.
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
}
