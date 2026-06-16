/* ╔══════════════════════════════════════════════════════════════╗
   ║  INFECTAR — motor de azar + UI · Queimada Circuit Records      ║
   ║  vanilla puro, sin build, sin dependencias.                   ║
   ║  confía en tus amigas, no en el algoritmo.                    ║
   ╚══════════════════════════════════════════════════════════════╝ */
(() => {
  'use strict';

  // ───────────────────────── utilidades base ─────────────────────────
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rnd   = n => Math.floor(Math.random() * n);          // 0..n-1
  const pick  = arr => arr[rnd(arr.length)];                 // elemento al azar
  const rfloat = (a, b) => Math.random() * (b - a) + a;
  const hex   = n => Math.floor(Math.random() * Math.pow(16, n)).toString(16).padStart(n, '0');
  const clean = s => (s || '').replace(/\s+/g, ' ').replace(/[_]/g, ' ').trim();

  // fetch con timeout para que ningún reservorio cuelgue la experiencia
  async function getJSON(url, ms = 7000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }

  // localStorage robusto (sandboxes pueden bloquearlo)
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* silencio */ } },
  };

  // ───────────────────────── datos locales ─────────────────────────
  // 30+ idiomas para "wiki global"
  const WIKI_LANGS = ['es','en','fr','de','it','pt','nl','sv','pl','ja','ko','zh',
    'ru','ar','fa','he','hi','th','vi','el','la','eo','tr','fi','cs','uk','id','ro',
    'hu','da','no','ca','eu','gl','is','ka','bn','ta'];

  // 7. rarezas — canon curado (ampliable)
  const RAREZAS = ['dungeon synth','numbers stations','backrooms','liminal spaces',
    'sperm whale codas','plunderphonics','microtonal','quorum sensing',
    'dead mall walkthrough','Bronze Age collapse','xenharmonic 31-TET',
    'kosmische musik','analog horror','dark DNA','umwelt von uexküll','conet project',
    'shortwave numbers','musique concrète','hauntology','breakcore','onkyo',
    'EVP recordings','hollow earth','tulpa','ego death','mycelium network',
    'brutalist architecture','vaporwave plaza','deep time','radio static art'];

  // 8. caos — símbolos/glitch
  const CAOS = ['⌘','░▒▓','¿¿¿','glitch','404','feedback loop','spores','contagion',
    '🜂','🝛','wow signal','dial-up','static','signal jamming','null','void','▚▞▚',
    'corrupted','phantom','interference'];

  // 12. emojis raros/neutros
  const EMOJIS = ['🜂','🝛','☣','⚗','🧫','🛰','📼','🗿','🕳','🪐','📡','🦴','🧿','🛸',
    '🜔','♅','⛓','🪬','🧬','🩻','📟','🪤','🜍','⌖'];

  // formatos (mutágeno "formato")
  const FORMATOS = ['full album','en vivo','VHS rip','DJ set','field recording',
    'lost media','found footage','cassette rip','slowed reverb','8 hours',
    'no copyright','subtitulado','documental','raw footage','1 hour','explicado',
    'completo','remastered','bootleg','rare','unboxing','tutorial','mixtape'];

  // décadas (mutágeno año/década)
  const DECADAS = ['años 50','años 60','años 70','años 80','años 90','90s','80s',
    'Y2K','2000s','años 2010','siglo XIX','medieval','prehistórico'];

  // catálogos (reservorio 11)
  const CAT_PREFIX = ['Op.','BWV','K.','SCP-','M','NGC','KV','HD','cat.','fragment',
    'RV','Hob.','D.','WoO','IC','PSR','HIP'];

  // plantillas de query (envuelven el término)
  const PLANTILLAS = [
    { id: 'tpl-exp',  label: '{x} explicado',     wrap: x => `${x} explicado` },
    { id: 'tpl-how',  label: 'cómo hacer {x}',     wrap: x => `cómo hacer ${x}` },
    { id: 'tpl-beg',  label: '{x} for beginners',  wrap: x => `${x} for beginners` },
    { id: 'tpl-bad',  label: '{x} pero mal',       wrap: x => `${x} pero mal` },
    { id: 'tpl-asmr', label: '{x} asmr',           wrap: x => `${x} asmr` },
  ];

  // ───────────────────────── reservorios ─────────────────────────
  // Cada uno devuelve un string (o null si falla). Los LIVE pueden lanzar; el
  // motor los envuelve en try/catch y cae a un local si hace falta.
  const RESERVORIOS = [
    // ── live ──
    { id: 'wikipedia', label: 'wikipedia', kind: 'live', async run() {
        const lang = wikiLangChoice();
        const d = await getJSON(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`);
        return clean(d && d.title);
      } },
    { id: 'wikiglobal', label: 'wiki global', kind: 'live', async run() {
        const lang = pick(WIKI_LANGS);
        const d = await getJSON(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`);
        return clean(d && d.title);
      } },
    { id: 'wikcionario', label: 'wikcionario', kind: 'live', async run() {
        const lang = wikiLangChoice();
        const d = await getJSON(`https://${lang}.wiktionary.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`);
        return clean(d && d.query && d.query.random && d.query.random[0] && d.query.random[0].title);
      } },
    { id: 'commons', label: 'commons', kind: 'live', async run() {
        const d = await getJSON('https://commons.wikimedia.org/w/api.php?action=query&list=random&rnnamespace=6&rnlimit=1&format=json&origin=*');
        let t = d && d.query && d.query.random && d.query.random[0] && d.query.random[0].title;
        if (!t) return null;
        t = t.replace(/^File:/i, '').replace(/\.[a-z0-9]{2,4}$/i, ''); // quita File: y extensión
        return clean(t);
      } },
    { id: 'poesia', label: 'poesía', kind: 'live', async run() {
        const d = await getJSON('https://poetrydb.org/random');
        const poem = d && d[0] && Array.isArray(d[0].lines) ? d[0].lines.filter(l => l && l.trim()) : [];
        return poem.length ? clean(pick(poem)) : null;
      } },
    { id: 'especie', label: 'especie', kind: 'live', async run() {
        const offset = rnd(9000);
        const d = await getJSON(`https://api.gbif.org/v1/species/search?rank=SPECIES&status=ACCEPTED&limit=1&offset=${offset}`);
        const r = d && d.results && d.results[0];
        return clean(r && (r.canonicalName || r.scientificName));
      } },

    // ── local (nunca fallan) ──
    { id: 'rarezas', label: 'rarezas', kind: 'local', run() { return pick(RAREZAS); } },
    { id: 'caos', label: 'caos', kind: 'local', run() {
        const c = pick(CAOS);
        return Math.random() < 0.25 ? '0x' + hex(rnd(3) + 2) : c;
      } },
    { id: 'coordenadas', label: 'coordenadas', kind: 'local', run() {
        return rfloat(-90, 90).toFixed(2) + ' ' + rfloat(-180, 180).toFixed(2);
      } },
    { id: 'efemeride', label: 'efeméride', kind: 'local', run() { return String(1500 + rnd(521)); } },
    { id: 'catalogo', label: 'catálogo', kind: 'local', run() {
        const p = pick(CAT_PREFIX);
        const n = rnd(2) ? rnd(900) + 1 : rnd(9000) + 100;
        return `${p}${/[.\-]$/.test(p) ? '' : ' '}${n}`;
      } },
    { id: 'emoji', label: 'emoji', kind: 'local', run() {
        const n = 2 + rnd(3);
        let s = '';
        for (let i = 0; i < n; i++) s += pick(EMOJIS);
        return s;
      } },
  ];

  function wikiLangChoice() {
    const v = ($('#wikiLang') || {}).value || 'es';
    if (v === 'mix') return pick(['es', 'en']);
    if (state.mut['idioma-random']) return pick(WIKI_LANGS);
    return v;
  }

  // ───────────────────────── mutágenos ─────────────────────────
  const MUTAGENOS = [
    { id: 'formato', label: 'formato' },
    { id: 'anodecada', label: 'año/década' },
    { id: 'mashup', label: 'mash-up' },
    { id: 'deriva', label: 'deriva ×N' },
    { id: 'antonimo', label: 'antónimo' },
    { id: 'idioma-random', label: 'idioma aleatorio' },
  ];

  // Datamuse helpers (deriva / antónimo)
  async function datamuse(rel, word) {
    const w = (word || '').split(/\s+/).slice(0, 2).join(' '); // 1-2 palabras
    if (!w) return null;
    const url = `https://api.datamuse.com/words?${rel}=${encodeURIComponent(w)}&max=16`;
    const d = await getJSON(url, 6000);
    if (!Array.isArray(d) || !d.length) return null;
    return d;
  }

  // ───────────────────────── estado ─────────────────────────
  const LS_HISTORY = 'infectar.history.v1';
  const LS_POOL    = 'infectar.pool.v1';
  const LS_MUT     = 'infectar.mut.v1';
  const LS_TPL     = 'infectar.tpl.v1';

  const state = {
    pool: store.get(LS_POOL, null),   // {id:bool} — null = todas activas
    mut:  store.get(LS_MUT, {}),      // {id:bool}
    tpl:  store.get(LS_TPL, {}),      // {id:bool}
    current: null,                    // {term, parts:[{txt,type}], source}
    history: store.get(LS_HISTORY, []),
    auto: false,
    autoTimer: null,
    generating: false,
  };
  // por defecto: TODAS las fuentes activas
  if (!state.pool) { state.pool = {}; RESERVORIOS.forEach(r => state.pool[r.id] = true); }

  const activePool = () => RESERVORIOS.filter(r => state.pool[r.id]);

  // ───────────────────────── generación de muestra ─────────────────────────
  // Devuelve {term, parts, source}. parts = chips para preview.
  async function sample() {
    const actives = activePool();
    const fuente = actives.length ? pick(actives) : pick(RESERVORIOS.filter(r => r.kind === 'local'));

    let base = null, source = fuente.label;
    try {
      base = await fuente.run();
    } catch (e) {
      base = null;
    }
    // fallback: si falló (live caído / vacío), cae a un reservorio local
    if (!base) {
      const fb = pick(RESERVORIOS.filter(r => r.kind === 'local'));
      base = fb.run();
      source = fb.label + '↩';
    }
    base = clean(base) || pick(RAREZAS); // garantía absoluta: nunca vacío

    const parts = [{ txt: base, type: 'base' }];
    let term = base;

    // ── mutágenos (orden: deriva/antónimo transforman; formato/año/mashup añaden) ──
    // deriva ×N — saltos semánticos encadenados
    if (state.mut['deriva']) {
      const n = parseInt(($('#derivaN') || {}).value || '1', 10);
      let w = term;
      try {
        for (let i = 0; i < n; i++) {
          const d = await datamuse('ml', w);
          if (!d) break;
          // coge uno de los primeros (los más relacionados) con algo de azar
          w = clean(pick(d.slice(0, Math.min(8, d.length))).word);
          if (!w) break;
        }
        if (w && w.toLowerCase() !== term.toLowerCase()) {
          term = w; parts.length = 0; parts.push({ txt: term, type: 'base' });
          parts.push({ txt: `deriva ×${n}`, type: 'mut' });
        }
      } catch { /* deriva es opcional */ }
    }

    // antónimo — modo anti-recomendador
    if (state.mut['antonimo']) {
      try {
        const d = await datamuse('rel_ant', term);
        if (d) {
          const ant = clean(pick(d.slice(0, Math.min(8, d.length))).word);
          if (ant) { term = ant; parts.length = 0; parts.push({ txt: term, type: 'base' }); parts.push({ txt: 'antónimo', type: 'mut' }); }
        }
      } catch { /* opcional */ }
    }

    // formato — concatena palabra-formato
    if (state.mut['formato']) {
      const f = pick(FORMATOS);
      term += ' ' + f;
      parts.push({ txt: f, type: 'mut' });
    }

    // año/década
    if (state.mut['anodecada']) {
      const v = Math.random() < 0.5 ? String(1955 + rnd(62)) : pick(DECADAS);
      term += ' ' + v;
      parts.push({ txt: v, type: 'mut' });
    }

    // mash-up — término de OTRO reservorio (choque de mundos)
    if (state.mut['mashup']) {
      const others = RESERVORIOS.filter(r => r.id !== fuente.id);
      let extra = null;
      // intenta primero locales para no depender de red en el mash-up
      const localsFirst = others.filter(r => r.kind === 'local').concat(others.filter(r => r.kind === 'live'));
      for (const r of localsFirst) {
        try { extra = clean(await r.run()); } catch { extra = null; }
        if (extra) break;
      }
      if (extra) { term += ' ' + extra; parts.push({ txt: extra, type: 'mut' }); }
    }

    // ── plantillas de query (envuelven el resultado final) ──
    const tplsOn = PLANTILLAS.filter(t => state.tpl[t.id]);
    if (tplsOn.length) {
      const tpl = pick(tplsOn);
      term = tpl.wrap(term);
      parts.push({ txt: tpl.label, type: 'tpl' });
    }

    parts.push({ txt: source, type: 'fuente' });
    return { term: clean(term), parts, source };
  }

  // ───────────────────────── render ─────────────────────────
  const ytURL = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  const termEl   = $('#term');
  const chipsEl  = $('#chips');
  const depthEl  = $('#depth');
  const tunnelEl = $('#tunnel');

  function renderPreview(s) {
    state.current = s;
    termEl.classList.remove('idle');
    termEl.textContent = s.term;
    termEl.href = ytURL(s.term);
    // glitch sutil (si no está bloqueado)
    if (!document.body.classList.contains('no-glitch')) {
      termEl.classList.remove('glitch'); void termEl.offsetWidth; termEl.classList.add('glitch');
    }
    // chips de componentes
    chipsEl.innerHTML = '';
    s.parts.forEach(p => {
      const c = document.createElement('span');
      c.className = 'chip ' + p.type;
      c.textContent = p.txt;
      chipsEl.appendChild(c);
    });
  }

  function setBusy(busy) {
    state.generating = busy;
    if (busy && !state.current) { termEl.classList.add('idle'); termEl.textContent = 'recombinando…'; termEl.removeAttribute('href'); }
  }

  async function recombinar() {
    if (state.generating) return;
    setBusy(true);
    try {
      const s = await sample();
      renderPreview(s);
    } catch (e) {
      // fallback duro
      const b = pick(RAREZAS);
      renderPreview({ term: b, parts: [{ txt: b, type: 'base' }, { txt: 'rarezas↩', type: 'fuente' }], source: 'rarezas↩' });
    } finally {
      setBusy(false);
    }
  }

  // ───────────────────────── inyectar ─────────────────────────
  function infectar() {
    if (!state.current || !state.current.term) { recombinar(); return; }
    const s = state.current;
    // abre la búsqueda de YouTube en pestaña nueva (tu sesión logueada)
    window.open(ytURL(s.term), '_blank', 'noopener');
    pushHistory(s);
    recombinar(); // autogenera la siguiente muestra
  }

  // ───────────────────────── descenso / historial ─────────────────────────
  function pushHistory(s) {
    const entry = {
      term: s.term,
      source: s.source,
      t: Date.now(),
    };
    state.history.unshift(entry); // el más reciente arriba del túnel
    if (state.history.length > 300) state.history.length = 300;
    store.set(LS_HISTORY, state.history);
    renderHistory(true);
    updateDepth();
  }

  function hhmm(ts) {
    const d = new Date(ts);
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function renderHistory(fresh) {
    const n = state.history.length;
    $('#descensoActions').hidden = n === 0;
    const sub = $('#descensoCount');
    sub.textContent = n === 0
      ? 'vacía — aún no has inyectado nada'
      : `${n} ${n === 1 ? 'inyección' : 'inyecciones'} · cae más con la profundidad`;

    tunnelEl.innerHTML = '';
    state.history.forEach((e, i) => {
      const li = document.createElement('li');
      li.className = 'node' + (fresh && i === 0 ? ' fresh' : '');
      // se hunde: más pequeño y más tenue con la profundidad
      const depth = i;
      const scale = Math.max(0.5, 1 - depth * 0.045);
      const opacity = Math.max(0.18, 1 - depth * 0.07);
      const fontSize = 34 * scale; // base 34px, se encoge con la profundidad
      li.style.opacity = opacity.toFixed(2);

      const a = document.createElement('a');
      a.className = 'node-term';
      a.href = ytURL(e.term);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = e.term;
      a.style.fontSize = fontSize.toFixed(1) + 'px';

      const meta = document.createElement('div');
      meta.className = 'node-meta';
      const idx = String(n - i).padStart(2, '0');
      meta.innerHTML = `-${idx} <span class="sep">◈</span> ${escapeHTML(e.source)} <span class="sep">◈</span> ${hhmm(e.t)}`;

      li.appendChild(a);
      li.appendChild(meta);
      tunnelEl.appendChild(li);
    });
  }

  const escapeHTML = s => (s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  function updateDepth() {
    const n = state.history.length;
    depthEl.textContent = '-' + String(n).padStart(2, '0');
  }

  // exportar rastro → markdown al portapapeles
  async function exportar() {
    if (!state.history.length) { toast('la madriguera está vacía'); return; }
    const lines = [
      '# INFECTAR — rastro de la madriguera',
      '',
      `> ${state.history.length} inyecciones · confía en tus amigas, no en el algoritmo`,
      '',
    ];
    state.history.forEach((e, i) => {
      const idx = String(state.history.length - i).padStart(2, '0');
      lines.push(`- \`-${idx}\` **${e.term}** — _${e.source}_ · ${new Date(e.t).toISOString()}`);
      lines.push(`  - ${ytURL(e.term)}`);
    });
    lines.push('', '— Queimada Circuit Records · LAB · INFECTAR');
    const md = lines.join('\n');
    try {
      await navigator.clipboard.writeText(md);
      toast('rastro copiado al portapapeles (markdown)');
    } catch {
      // fallback: textarea + execCommand
      const ta = document.createElement('textarea');
      ta.value = md; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('rastro copiado'); }
      catch { toast('no se pudo copiar — revisa permisos'); }
      ta.remove();
    }
  }

  // colapsar el pozo (borra historial, con confirmación)
  function colapsar() {
    if (!state.history.length) return;
    if (!confirm('¿Colapsar el pozo? Esto borra toda la madriguera (no se puede deshacer).')) return;
    state.history = [];
    store.set(LS_HISTORY, state.history);
    renderHistory(false);
    updateDepth();
    toast('pozo colapsado');
  }

  // ───────────────────────── auto-infectar ─────────────────────────
  function toggleAuto() {
    state.auto = !state.auto;
    const btn = $('#btnAuto');
    btn.setAttribute('aria-pressed', String(state.auto));
    btn.textContent = state.auto ? 'auto ■' : 'auto ▷';
    if (state.auto) {
      toast('auto-infectar ON — el navegador puede bloquear pop-ups encadenados');
      scheduleAuto();
    } else {
      clearTimeout(state.autoTimer);
    }
  }
  function scheduleAuto() {
    clearTimeout(state.autoTimer);
    const secs = parseInt(($('#autoSecs') || {}).value || '8', 10);
    state.autoTimer = setTimeout(() => {
      if (!state.auto) return;
      infectar();
      scheduleAuto();
    }, secs * 1000);
  }

  // ───────────────────────── toast ─────────────────────────
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 250);
    }, 2600);
  }

  // ───────────────────────── construir toggles UI ─────────────────────────
  function buildToggle(opts) {
    // opts: {id, label, pressed, kind?, cls?}
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toggle' + (opts.cls ? ' ' + opts.cls : '') + (opts.kind ? ' ' + opts.kind : '');
    b.setAttribute('aria-pressed', String(!!opts.pressed));
    b.dataset.id = opts.id;
    const mark = document.createElement('span');
    mark.className = 'mark';
    mark.textContent = opts.pressed ? '◈' : '◇';
    const txt = document.createElement('span');
    txt.textContent = opts.label;
    b.appendChild(mark);
    b.appendChild(txt);
    if (opts.kind) { const badge = document.createElement('span'); badge.className = 'badge'; b.appendChild(badge); }
    return b;
  }
  function syncToggle(b, pressed) {
    b.setAttribute('aria-pressed', String(pressed));
    b.querySelector('.mark').textContent = pressed ? '◈' : '◇';
  }

  function buildPoolUI() {
    const wrap = $('#poolToggles');
    wrap.innerHTML = '';
    RESERVORIOS.forEach(r => {
      const b = buildToggle({ id: r.id, label: r.label, pressed: !!state.pool[r.id], kind: r.kind });
      b.addEventListener('click', () => {
        state.pool[r.id] = !state.pool[r.id];
        syncToggle(b, state.pool[r.id]);
        store.set(LS_POOL, state.pool);
      });
      wrap.appendChild(b);
    });
  }
  function refreshPoolUI() {
    $$('#poolToggles .toggle').forEach(b => syncToggle(b, !!state.pool[b.dataset.id]));
  }

  function buildMutUI() {
    const wrap = $('#mutToggles');
    wrap.innerHTML = '';
    MUTAGENOS.forEach(m => {
      const b = buildToggle({ id: m.id, label: m.label, pressed: !!state.mut[m.id], cls: 'mut' });
      b.addEventListener('click', () => {
        state.mut[m.id] = !state.mut[m.id];
        syncToggle(b, state.mut[m.id]);
        store.set(LS_MUT, state.mut);
        recombinar(); // refleja el cambio en la preview
      });
      wrap.appendChild(b);
    });
  }

  function buildTplUI() {
    const wrap = $('#tplToggles');
    wrap.innerHTML = '';
    PLANTILLAS.forEach(t => {
      const b = buildToggle({ id: t.id, label: t.label, pressed: !!state.tpl[t.id], cls: 'mut' });
      b.addEventListener('click', () => {
        state.tpl[t.id] = !state.tpl[t.id];
        syncToggle(b, state.tpl[t.id]);
        store.set(LS_TPL, state.tpl);
        recombinar();
      });
      wrap.appendChild(b);
    });
  }

  // ───────────────────────── atajos del pool ─────────────────────────
  function poolAll()   { RESERVORIOS.forEach(r => state.pool[r.id] = true);  refreshPoolUI(); store.set(LS_POOL, state.pool); }
  function poolNone()  { RESERVORIOS.forEach(r => state.pool[r.id] = false); refreshPoolUI(); store.set(LS_POOL, state.pool); }
  function poolLocal() { RESERVORIOS.forEach(r => state.pool[r.id] = (r.kind === 'local')); refreshPoolUI(); store.set(LS_POOL, state.pool); }

  // ───────────────────────── eventos ─────────────────────────
  function wire() {
    $('#btnInfectar').addEventListener('click', infectar);
    $('#btnRecombinar').addEventListener('click', recombinar);
    $('#btnAuto').addEventListener('click', toggleAuto);
    $('#btnExport').addEventListener('click', exportar);
    $('#btnCollapse').addEventListener('click', colapsar);

    $('[data-pool-all]').addEventListener('click', poolAll);
    $('[data-pool-none]').addEventListener('click', poolNone);
    $('[data-pool-local]').addEventListener('click', poolLocal);

    // sliders con output
    const derivaN = $('#derivaN'), derivaOut = $('#derivaOut');
    derivaN.addEventListener('input', () => derivaOut.textContent = '×' + derivaN.value);
    const autoSecs = $('#autoSecs'), autoOut = $('#autoOut');
    autoSecs.addEventListener('input', () => { autoOut.textContent = autoSecs.value + 's'; if (state.auto) scheduleAuto(); });

    // idioma wikipedia → refresca preview si el reservorio actual depende
    $('#wikiLang').addEventListener('change', recombinar);

    // toggle "sin glitch"
    const rg = $('#reduceGlitch');
    rg.checked = store.get('infectar.noglitch', false);
    document.body.classList.toggle('no-glitch', rg.checked);
    rg.addEventListener('change', () => {
      document.body.classList.toggle('no-glitch', rg.checked);
      store.set('infectar.noglitch', rg.checked);
    });

    // teclado: espacio = inyectar (salvo dentro de inputs/controles)
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      const editable = ['input','select','textarea','button','summary'].includes(tag) || e.target.isContentEditable;
      if (e.code === 'Space' && !editable) {
        e.preventDefault();
        infectar();
      }
      if (e.key.toLowerCase() === 'r' && !editable) { recombinar(); }
    });

    // término gigante: si lo clicas, también cuenta como inyección en el historial
    termEl.addEventListener('click', (e) => {
      if (!state.current) { e.preventDefault(); return; }
      pushHistory(state.current);
      // dejamos que el navegador abra el href; generamos la siguiente tras un tick
      setTimeout(recombinar, 30);
    });
  }

  // respeta prefers-reduced-motion para el glitch
  function honorReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) document.body.classList.add('no-glitch');
  }

  // ───────────────────────── init ─────────────────────────
  function init() {
    honorReducedMotion();
    buildPoolUI();
    buildMutUI();
    buildTplUI();
    wire();
    renderHistory(false);
    updateDepth();
    recombinar(); // primera muestra al cargar
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
