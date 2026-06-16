```
█▓▒░  I N F E C T A R  ░▒▓█
⡇⠠⡄⢀⡀⢠⡀⢀⡀⢄⡀⢀⡀⢠⡀⢀⡀⢄⡀⢀⡀⢠⡀⢀⡀⢄⡀⢀⡀⢠⡀⢀⡀
```

> **confía en tus amigas, no en el algoritmo.**

**INFECTAR** es una pequeña máquina de sabotaje del algoritmo de recomendación de
YouTube. Genera términos de búsqueda absolutamente aleatorios y heterogéneos y los
**inyecta** en tu YouTube ya logueado, abriendo en una pestaña nueva la búsqueda de
cada uno. Cada inyección ensucia y diversifica las señales que el algoritmo tiene
sobre ti: ruido deliberado en el feed, ofuscación como protesta y como juego.

Es una pieza del **LAB** de [Queimada Circuit Records](https://queimadacircuitrecords.com),
sello DIY de música electrónica experimental de Bilbao. Herramienta usable y gesto
político-cultural a la vez: estética de sello, anticopyright, software libre.

---

## Cómo se usa

1. Abre INFECTAR (ver más abajo, o la versión publicada en GitHub Pages).
2. **Asegúrate de estar logueada en YouTube** en el mismo navegador: la inyección
   solo cuenta para tu algoritmo si el resultado se abre en tu sesión.
3. Pulsa **`infectar`** (o la **barra espaciadora**). Se abre una pestaña con una
   búsqueda de YouTube de un término imprevisible.
4. Pulsa **`↻`** para recombinar otra muestra sin inyectar.
5. Repite. Cada término cae en **la madriguera** (el historial-túnel de abajo).
   Haz **scroll** para descender por ella.

Atajos: `espacio` inyecta · `↻` recombina · activa **auto-infectar** para una
infección sostenida con temporizador.

### Las fuentes (el pool)

Hay **12 reservorios heterogéneos** y por defecto están **todos activos**. En cada
inyección se elige uno al azar, así la textura cambia de golpe entre un hit y otro:
un binomio latino, luego un verso, luego unas coordenadas, luego un título en tailandés.

- **live** (se piden por red, con fallback si fallan): Wikipedia, Wikipedia global
  (30+ idiomas), Wikcionario, Wikimedia Commons, poesía (PoetryDB), especies (GBIF).
- **local** (se generan en tu navegador, nunca fallan): rarezas curadas, caos /
  glitch, coordenadas, efemérides, catálogos (Op., BWV, SCP-, NGC…), emojis.

### Los mutágenos

Recombinadores opcionales del término (combinables): **formato** (full album, VHS
rip, field recording…), **año/década**, **mash-up** (choca con otro reservorio),
**deriva ×N** (saltos semánticos vía Datamuse), **antónimo** (modo
anti-recomendador: busca lo contrario), e **idioma aleatorio** para Wikipedia.
También hay **plantillas de query** que envuelven el término en patrones
(`{x} explicado`, `cómo hacer {x}`, `{x} pero mal`…).

---

## El caveat honesto (léelo)

INFECTAR **no rompe el algoritmo**, y mentir sobre eso sería traicionar la idea.

- El ruido de búsqueda **se puede filtrar semánticamente**. Los sistemas de
  recomendación no son tan ingenuos como en 2006.
- YouTube pondera **mucho más el tiempo de visionado** que las búsquedas. Para
  "infectar" de verdad hay que **ver**, no solo buscar.

Lo que INFECTAR hace es **sembrar la duda y abrir madrigueras**: introduce señales
que no eres tú, te empuja fuera de tu surco, y convierte la ofuscación en un gesto
consciente. Esa tensión —entre la potencia simbólica y el límite real de la táctica—
es parte de la pieza, no un defecto a esconder.

## Linaje

INFECTAR se apoya en una tradición de **ofuscación como privacidad y protesta**:

- **TrackMeNot** — Daniel Howe & Helen Nissenbaum (2006): ruido de búsqueda
  para ofuscar el perfil de un usuario.
- **AdNauseam** — clic en todos los anuncios para ahogar el seguimiento publicitario.
- **Obfuscation: A User's Guide for Privacy and Protest** — Finn Brunton & Helen
  Nissenbaum (MIT Press, 2015): el manual teórico de esta familia de tácticas.

---

## Desplegar en GitHub Pages

INFECTAR es **HTML + CSS + JS vanilla**. Sin build, sin npm, sin dependencias. Se
sirve `index.html` tal cual. Para publicarlo:

1. Sube el repo a GitHub (rama por defecto, p. ej. `main`).
2. En GitHub: **Settings → Pages**.
3. En **Source**, elige **Deploy from a branch**.
4. Selecciona la rama (`main`) y carpeta **`/ (root)`**. Guarda.
5. En ~1 minuto estará en `https://TU-USUARIO.github.io/anti-algorithm/`.

Todas las rutas son **relativas**, así que funciona sin problema en esa subcarpeta.
Si en el futuro quieres un subdominio propio, añade un archivo `CNAME` en la raíz
con el dominio y configúralo en Settings → Pages.

### En local

No necesita servidor para lo básico, pero algunos navegadores limitan `fetch` desde
`file://`. Para probar las fuentes live, sirve la carpeta:

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

---

## Privacidad

Todo ocurre **en tu navegador**. No hay backend, no hay claves de API, no se
recoge nada. El historial (la madriguera) se guarda solo en tu `localStorage`
local. Las peticiones a las fuentes live van directas desde tu navegador a las APIs
públicas correspondientes.

---

## Anticopyright

Dominio público (**CC0** / **WTFPL**). Cópialo, rómpelo, mejóralo, repártelo. No nos
pidas permiso. Ver [`LICENSE`](LICENSE) y
[queimadacircuitrecords.com/anticopyright](https://queimadacircuitrecords.com/anticopyright).

---

```
⧉ Queimada Circuit Records
⧉ Bandcamp   → https://queimada-circuit-records.bandcamp.com
⧉ Instagram  → https://instagram.com/queimada.circuit.records
⧉ Web / LAB  → https://queimadacircuitrecords.com
```

*hecho con cariño DIY en Bilbao · ¿¿¿¿*
