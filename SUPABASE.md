# Salvataggio cloud con Supabase (gratuito)

Finché non configuri Supabase, i ricordi si salvano solo nel browser che stai usando.
Con Supabase invece il libro è **condiviso**: lo riempi dal PC e Gaia lo sfoglia dal telefono, sempre aggiornato.

Tempo richiesto: ~5 minuti.

## 1. Crea il progetto

1. Vai su [supabase.com](https://supabase.com) e registrati (gratis, basta l'account GitHub o Google).
2. Premi **New project**, scegli un nome (es. `regalo-gaia`), una password qualsiasi per il database e la region `eu-central-1` (Francoforte).
3. Attendi ~1 minuto che il progetto sia pronto.

## 2. Prepara database e spazio foto (un solo passaggio)

Nel menu a sinistra apri **SQL Editor**, incolla **tutto il contenuto del file
[supabase-setup.sql](supabase-setup.sql)** e premi **Run**.

Fatto: crea la tabella dei ricordi, il bucket pubblico `foto` e tutti i permessi.
Lo script si può rilanciare quante volte vuoi senza perdere nulla.

## 3. Collega il sito

1. Menu a sinistra → **Project Settings** → **API** (oppure "Data API").
2. Copia **Project URL** e la chiave **anon / public**.
3. In locale: copia `.env.example` in `.env.local` e incolla lì i due valori:

```bash
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi…
```

4. Riavvia `npm run dev` e ricarica il sito: in alto a destra non deve più
   comparire la scritta "salvataggio locale".

## 4. Su Vercel (sito online)

Gli stessi due valori vanno inseriti anche su Vercel:
**Project → Settings → Environment Variables** → aggiungi
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, poi rilancia il deploy.
(Se usi la CLI: `vercel env add VITE_SUPABASE_URL production` e così via.)

## Nota sulla privacy

Chiunque conosca l'indirizzo del sito può leggere e modificare il libro: per un regalo personale va benissimo, basta non pubblicare il link in giro. Se un domani vorrai proteggerlo, si può aggiungere una piccola password (chiedimelo e lo facciamo).
