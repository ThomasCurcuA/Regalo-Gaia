# Riprendere il lavoro sul nuovo PC 💻

## 1. Installa gli strumenti (una volta sola)

1. **Node.js** (versione LTS): scaricalo da [nodejs.org](https://nodejs.org) e installalo
   con le impostazioni predefinite. Serve per far girare il sito in locale.
2. *(Consigliato)* **Claude Code**, se vuoi continuare a farti aiutare:
   [claude.com/claude-code](https://claude.com/claude-code)

## 2. Ripristina il progetto

1. Estrai questo zip in una cartella, ad es. `Desktop\Regalo Gaia`.
2. Apri un terminale in quella cartella ed esegui:

```bash
npm install   # scarica le dipendenze (~1 minuto, solo la prima volta)
npm run dev   # avvia il sito su http://localhost:5173
```

Tutto qui: il sito è identico a come l'hai lasciato.

## 3. Cose da sapere

- **I ricordi salvati nel browser NON viaggiano con lo zip**: il salvataggio
  locale (localStorage) vive dentro il browser del vecchio PC. Se hai già
  inserito ricordi veri e non hai ancora configurato Supabase, inseriscili
  di nuovo sul nuovo PC — oppure, meglio, configura prima Supabase
  (guida in `SUPABASE.md`): da quel momento i ricordi vivono nel cloud e
  ti seguono su qualsiasi dispositivo.
- **Testi e dedica** si personalizzano in `src/config.js`.
- **Istruzioni generali** del progetto in `README.md`.

## 4. La cartella `_claude-memoria`

Contiene gli appunti che Claude ha preso su questo progetto (obiettivo,
scadenza, decisioni, palette). Se sul nuovo PC usi Claude Code, al primo
avvio nella cartella del progetto puoi dirgli:

> «Leggi la cartella _claude-memoria e salvala nella tua memoria:
> è il contesto del progetto, stavamo lavorando insieme su questo sito»

e riprenderà il filo esattamente da dove avete lasciato.
