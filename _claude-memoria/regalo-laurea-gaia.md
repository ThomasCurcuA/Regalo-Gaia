---
name: regalo-laurea-gaia
description: "Progetto regalo — sito web \"libro 3D dei ricordi\" per la laurea di Gaia (metà luglio 2026)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5d6f8471-3012-4adb-8000-b70419719bce
---

Thomas sta costruendo un sito web come regalo di laurea per la sua ragazza Gaia, che si laurea a metà luglio 2026. Deadline reale: il sito deve essere pronto e rifinito prima di quella data.

Decisioni prese (2026-07-03):
- Landing romantica a due colonne: dedica a sinistra, libro 3D cliccabile a destra; particelle animate di sfondo.
- Libro 3D vero con Three.js (react-three-fiber): click → il libro levita al centro, si apre, pagine sfogliabili con curvatura realistica.
- Ogni pagina = un ricordo (foto + testo) modificabile direttamente dal sito con pulsanti ✎ e un editor modale.
- Salvataggio: Supabase (account gratuito, da configurare in src/config.js) con fallback automatico su localStorage finché non configurato.
- Palette: i colori preferiti di Gaia sono rosa, lilla e viola → tema notturno viola profondo con particelle rosa/lilla e dettagli oro rosa.
- Il sito deve funzionare bene sia su desktop sia su mobile (probabile che glielo mostri dal telefono).

Stack: Vite + React + Three.js + @react-three/fiber/drei + @supabase/supabase-js. Progetto in C:\Users\Thomas\Desktop\Regalo Gaia (non è un repo git).
