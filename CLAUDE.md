# CLAUDE.md — INFECTAR

Contexto persistente del repo. Si eres una sesión futura de Claude Code, lee esto
primero: entiendes el proyecto en 1 minuto.

## Qué es

**INFECTAR** es una herramienta web del **LAB** de **Queimada Circuit Records (QCR)**,
sello DIY de electrónica experimental de Bilbao. Es a la vez herramienta usable y
gesto político-cultural: una pequeña máquina de **sabotaje del algoritmo de
recomendación** de YouTube, anticopyright y software libre.

Mantra: **"confía en tus amigas, no en el algoritmo"**. Ofuscación como protesta y juego.

## Concepto

YouTube te encierra en una burbuja. INFECTAR la contamina a propósito: genera
términos de búsqueda **aleatorios y heterogéneos** y los inyecta en tu YouTube ya
logueado abriendo, en pestaña nueva, `https://www.youtube.com/results?search_query=TÉRMINO`.
Cada inyección ensucia las señales que el algoritmo tiene de ti.

Linaje (citar en README): **TrackMeNot** (Howe & Nissenbaum, 2006), **AdNauseam**, y
el libro *Obfuscation: A User's Guide for Privacy and Protest* (Brunton & Nissenbaum, 2015).

**Caveat honesto (no esconder nunca):** el ruido de búsqueda se filtra
semánticamente y YouTube pondera mucho más el TIEMPO DE VISIONADO que las búsquedas.
Para infectar de verdad hay que VER, no solo buscar. INFECTAR siembra duda y abre
madrigueras; no promete romper el algoritmo. Esa tensión es parte de la pieza.

## Stack y restricciones (DURAS)

- **Vanilla puro: HTML + CSS + JS. SIN build, SIN npm, SIN frameworks, SIN deps.**
  Razón: el repo se gestiona desde Working Copy en iOS y se publica por GitHub Pages
  sin paso de build. No introducir Vite/React/bundlers.
- **Rutas relativas siempre** (se sirve en `…github.io/anti-algorithm/`, subcarpeta).
- Recursos externos solo por CDN (Google Fonts) o API nativa `fetch`.
- `localStorage` con try/catch (puede estar bloqueado en sandboxes).
- Todos los `fetch` con fallback; nada debe dejar el término vacío.
- Código legible, comentarios en español donde ayuden. Robustez > elegancia.

## Identidad visual QCR (hex EXACTOS — no improvisar)

- Fondo `#0a0a0c` · Texto `#e9e7ea` · Gris apagado `#817d8b` · Tenue `#46434f`
- **Verde lima** `#bdeb4d` (hover `#a6d63f`): logo, flechas →, chevron >, acento, botón principal
- **Violeta** `#a884f5` (títulos/enlaces), brillante `#b89cf7` (término gigante), profundo `#8d68e6`
- Resalte enlace: `rgba(168,132,245,0.16)` r~5-6px; suave `rgba(168,132,245,0.09)`
- Línea/borde: `#23212b`
- Fonts (Google Fonts): titulares/logo/término/mono = **Space Mono** (400/700);
  cuerpo/UI = **Space Grotesk** (400/500/700)
- Ornamentos: `◈` separador (lima), `⧉` viñeta, `¿¿¿¿` glyph, bandas ASCII braille
  `⡇⠠⡄⢀⡀⢠⡀` y bloques `█▓▒░`, breadcrumb `QUEIMADA ◈ LAB ◈ Infectar`, meta `20.03.26 · 2min`

## Arquitectura UX

La pieza respira: vacío abierto, un solo foco, caída infinita debajo.

- **EL POZO** (~90vh): término gigante centrado flotando (violeta brillante, enlace a
  su búsqueda), breadcrumb arriba, chips de componentes del query, botón `infectar`
  (lima), botón `↻ recombinar` (outline), contador de profundidad arriba dcha,
  cajón plegable `◈ fuentes & mutágenos ◈` con los controles.
- **EL DESCENSO**: al scrollear, los términos inyectados forman un túnel que cae
  (más pequeños y tenues con la profundidad), espina vertical verde→violeta. Cada nodo:
  término (enlace) + meta `-NN ◈ fuente ◈ hora`. Acciones: exportar rastro (markdown al
  portapapeles) y colapsar el pozo (borra historial, con confirmación). Persistencia
  localStorage.

## Motor de azar — pool multi-fuente (14 reservorios, TODOS activos por defecto)

Cada inyección elige un reservorio al azar entre los activos → la textura cambia de golpe.

LIVE (fetch, con try/catch + fallback):
1. wikipedia — REST `…/page/random/summary` → `.title` (es/en)
2. wiki global — igual, idioma al azar entre 40+
3. wikcionario — API `list=random rnnamespace=0`
4. commons — `list=random rnnamespace=6`, limpiar `File:` y extensión
5. poesía — poetrydb.org/random → línea no vacía al azar
6. especie — api.gbif.org species/search → canonicalName (binomios latinos)
7. museo — Met Museum `collection/v1/objects/{id}` → `.title` (id al azar, 3 intentos)

LOCAL (generados en cliente, nunca fallan):
8. rarezas — lista curada ampliada (dungeon synth, backrooms, cryptids, ciencia rara…)
9. caos — símbolos/glitch/errores (⌘, ░▒▓, segfault, 404, 0x{hex}, error NNN…)
10. coordenadas — lat lon aleatorios (a veces formato cardinal N/S/E/W)
11. efeméride — año 1500..2020 (a veces «año N»)
12. catálogo — prefijo (Op., BWV, SCP-, NGC, KV, HD, arXiv:…) + número
13. emoji — cadena de 2-4 emojis raros
14. frecuencia — numbers stations (UVB-76…), kHz de onda corta, grupos de 5 cifras

UI pool: chips toggle (activo = resalte púrpura + ◈ verde; inactivo = ◇ tenue).
Atajos: `todas`, `ninguna`, `solo locales`. Si todos los activos fallan → cae a local.

### Conexiones / azar (mejoras del motor)

- **Prefetch**: tras cada preview se cocina la SIGUIENTE muestra en segundo plano →
  inyectar/recombinar es instantáneo. Cualquier cambio de pool/mutágeno/plantilla/idioma
  invalida el prefetch y regenera.
- **Reintento**: `getJSON` reintenta 1 vez con backoff ante caída de red (no ante 4xx).
- **Anti-repetición**: no repite la misma fuente dos tiradas seguidas; memoria `seen`
  de los últimos ~60 términos para no repetir (re-tira hasta 3 veces).

## Mutágenos (combinables, off por defecto, chip por color)

- **formato** — concatena palabra-formato (full album, VHS rip, field recording, lost media…)
- **año/década** — añade año (1955..2016) o década (años 80, 90s, Y2K…)
- **mash-up** — concatena término de OTRO reservorio
- **deriva ×N** — Datamuse `words?ml={palabra}` encadenando 1-3 saltos semánticos
- **antónimo** — Datamuse `words?rel_ant={palabra}` (modo anti-recomendador)
- **idioma aleatorio** — para wikipedia

## Interacción

- Espacio = inyectar. ↻ = recombinar (preview sin abrir pestaña).
- Tras inyectar: abrir YouTube, añadir al descenso, subir contador, autogenerar siguiente.
- Respetar `prefers-reduced-motion`. Responsive y táctil (se abre mucho desde móvil).
- Accesible: foco visible, `aria-pressed` en toggles, contraste, navegable por teclado.

## Extras implementados (§10)

- **Modo ver** — para que pese más que buscar (YouTube prioriza visionado). Resuelve la
  búsqueda a un `videoId` con frontends libres (Piped/Invidious, listas con fallback) y
  abre `youtube.com/watch?v=ID` (reproduce de verdad). Elige resultado 1º/2º/3º/azar.
  Resuelve en segundo plano tras cada preview (`resolverParaActual`) → el enlace está
  listo antes de inyectar (no rompe el pop-up por gesto). Si todo falla → cae a búsqueda.
  No se puede leer el resultado de YT (CORS) ni pinchar su pestaña (cross-origin): por eso
  los resolutores libres. Chip lima `▶ vídeo` cuando está resuelto.
- Modo **auto-infectar** con cuenta atrás visible en el botón (`auto ■ N`, relleno lima
  vía `--p`); **reutiliza una sola pestaña** (`target=infectar_yt`) → no spamea pestañas
  ni lo bloquea el navegador. Brilla con modo ver: deja una secuencia reproduciéndose.
- **Plantillas de query** (envolver término en patrones)
- Exportar rastro a portapapeles (markdown)
- Glitch sutil al cambiar término (respeta reduced-motion)
- **Diálogo propio** estilo QCR (`dialogo()` → Promise) en vez del `confirm()` del
  navegador, para colapsar el pozo. Esc cancela, Enter confirma.
- Prefetch + anti-repetición (ver sección del motor).

## Voz / copy

Tono de sello, NO de manual: minúsculas, directo, callejero, sin hedging ni jerga IA.
Ej.: «espacio inyecta», «déjalo solo y que machaque», «pozo colapsado. a empezar de
cero.», «rastro al portapapeles ✓». Nada de «por favor», «ten en cuenta que», emojis ⚠.

## Estructura

```
index.html      # la herramienta
css/style.css   # estilos QCR
js/app.js       # motor + UI
README.md  CLAUDE.md  LICENSE  .gitignore  (CNAME documentado)
```

## Despliegue

GitHub Pages desde la rama, sirviendo `index.html` directo. Rutas relativas obligatorias.

## Licencia / tono

Anticopyright — CC0 / dominio público. Tono DIY, directo, sin corporativismo.
Firma: Queimada Circuit Records · queimadacircuitrecords.com
