```
█▓▒░  I N F E C T A R  ░▒▓█
⡇⠠⡄⢀⡀⢠⡀⢀⡀⢄⡀⢀⡀⢠⡀⢀⡀⢄⡀⢀⡀⢠⡀⢀⡀⢄⡀⢀⡀⢠⡀⢀⡀
```

> **confía en tus amigas, no en el algoritmo.**

**INFECTAR** es una pequeña máquina de sabotaje del algoritmo de recomendación de
YouTube (y, si quieres, de Google). Genera términos de búsqueda aleatorios y
heterogéneos y los **inyecta** en tu sesión ya logueada, abriendo en una pestaña
nueva la búsqueda de cada uno. Cada inyección ensucia y diversifica las señales que
el algoritmo tiene sobre ti: ruido deliberado en el feed, ofuscación como protesta
y como juego.

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

Atajos: `espacio` inyecta · `↻` o `r` recombina · activa **auto-infectar** para una
infección sostenida (cuenta atrás en el botón; reutiliza una sola pestaña por diana
para no enterrarte en pestañas ni que lo frene el navegador).

### Diana: dónde se lanza

En el cajón eliges la **diana**: **YouTube**, **Google** o las **dos** a la vez. Cada
inyección abre la búsqueda en cada diana activa (en auto, reutilizando una pestaña por
cada una). El historial recuerda dónde lanzaste cada término.

### Semilla: siembra tu palabra

Escribe una palabra en la **semilla** y tienes dos botones:

- **derivar** → vecinos semánticos de tu palabra (vía Datamuse): sale lo *relacionado*.
- **contaminar** → tu palabra **+** un término de otro reservorio: choque de mundos.

Mientras haya semilla escrita, el motor también la mezcla en el azar (y en
auto-infectar), así que puedes sembrar un tema y dejar que machaque alrededor.

### Las fuentes (el pool)

Hay **14 reservorios heterogéneos** y por defecto están **todos activos**. En cada
inyección se elige uno (de forma **ponderada**: las madrigueras con chicha pesan más
que el ruido), así la textura cambia de golpe entre un hit y otro: un binomio latino,
luego un verso, luego un documental soviético, luego un título en tailandés.

- **live** (se piden por red, con fallback si fallan): Wikipedia, Wikipedia global
  (40+ idiomas), Wikcionario, Wikimedia Commons, poesía (PoetryDB), especies (GBIF),
  obras del Metropolitan Museum.
- **local** (se generan en tu navegador, nunca fallan): rarezas curadas (frases
  mirables que abren madrigueras de vídeo), caos / glitch, coordenadas, efemérides,
  catálogos (Op., BWV, SCP-, NGC, arXiv…), emojis, frecuencias / estaciones de números
  (UVB-76, onda corta, grupos de cifras).

El dial de **jugo** (en el cajón) regula la mezcla: de **madriguera** pura (casi nada
de ruido) a **ruido** a tope. Por defecto sale poco ruido, para que aparezcan cosas
guapas y mirables.

El motor **precocina la siguiente muestra** en segundo plano (inyectar es instantáneo),
no repite la misma fuente dos veces seguidas ni términos recientes, y reintenta las
conexiones caídas antes de tirar de fuente local.

### Los mutágenos

Recombinadores opcionales del término (combinables): **formato** (full album, VHS
rip, field recording…), **año/década**, **mash-up** (choca con otro reservorio),
**deriva ×N** (saltos semánticos vía Datamuse), **antónimo** (modo
anti-recomendador: busca lo contrario), e **idioma aleatorio** para Wikipedia.
También hay **plantillas de query** que envuelven el término en patrones
(`{x} explicado`, `cómo hacer {x}`, `{x} pero mal`, `{x} full documentary`,
`{x} drone footage`, `{x} live`…).

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
