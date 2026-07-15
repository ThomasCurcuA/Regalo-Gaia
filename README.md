# La Nostra Storia 💜 — regalo di laurea per Gaia

Un libro 3D dei ricordi: landing page romantica con particelle, un libro
tridimensionale che al click levita al centro dello schermo e si apre, e
pagine sfogliabili — ognuna un ricordo con foto e racconto, che si possono
aggiungere e modificare direttamente dal sito.

## Avviare il sito

```bash
npm install   # solo la prima volta
npm run dev   # apre su http://localhost:5173
```

## Personalizzare

Tutto il testo si cambia in **[src/config.js](src/config.js)**:
nomi, titolo del libro, sottotitolo della copertina, testo della landing
e dedica sulla prima pagina.

## Aggiungere i ricordi

1. Apri il libro e sfoglia fino alla pagina "Un nuovo ricordo".
2. Premi **✎** nella barra in basso, compila titolo, data, foto e racconto.
3. Salva: la pagina viene impaginata come una vera pagina di libro.

Ogni ricordo occupa una pagina; le pagine si possono modificare o
rimuovere in qualsiasi momento con lo stesso pulsante ✎.

## Salvataggio

- **Senza configurazione**: i ricordi restano nel browser in uso (localStorage).
- **Consigliato**: configura Supabase (gratis, ~5 minuti) seguendo
  **[SUPABASE.md](SUPABASE.md)** — così il libro è lo stesso da ogni
  dispositivo e le foto sono al sicuro nel cloud.

Le credenziali Supabase si mettono in `.env.local` (copia di `.env.example`);
il file non finisce su git.

## Pubblicare online (Vercel)

Il progetto è pronto per [Vercel](https://vercel.com) (piano gratuito):

```bash
vercel login        # una volta sola: autenticati con GitHub/Google/email
vercel --prod       # deploy in produzione
```

Prima del deploy imposta su Vercel le variabili `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` (Project → Settings → Environment Variables,
oppure `vercel env add …`), così i ricordi vivono nel cloud e non si
perdono mai. Vercel riconosce Vite da solo: build `vite build`, output `dist/`.

## Comandi utili

| Comando          | Cosa fa                          |
| ---------------- | -------------------------------- |
| `npm run dev`    | sito in locale con ricarica live |
| `npm run build`  | build di produzione in `dist/`   |
| `npm run preview`| anteprima della build            |
