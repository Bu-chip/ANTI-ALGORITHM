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
  const rnd    = n => Math.floor(Math.random() * n);          // 0..n-1
  const pick   = arr => arr[rnd(arr.length)];                 // elemento al azar
  const rfloat = (a, b) => Math.random() * (b - a) + a;
  const hex    = n => Math.floor(Math.random() * Math.pow(16, n)).toString(16).padStart(n, '0');
  const norm   = s => (s || '').toLowerCase().trim();
  const clean  = s => (s || '').replace(/\s+/g, ' ').replace(/[_]/g, ' ').trim();

  // fetch con timeout + un reintento con backoff (solo ante caída de red, no ante 4xx)
  async function getJSON(url, ms = 7000, retries = 1) {
    for (let intento = 0; ; intento++) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      try {
        const r = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
        if (!r.ok) {
          const e = new Error('HTTP ' + r.status); e.http = r.status; throw e;
        }
        return await r.json();
      } catch (e) {
        // 4xx/5xx no se reintentan; abortos/red sí, con un respiro
        if (intento >= retries || e.http) throw e;
        await new Promise(res => setTimeout(res, 350 * (intento + 1)));
      } finally { clearTimeout(t); }
    }
  }

  // localStorage robusto (sandboxes pueden bloquearlo)
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* silencio */ } },
  };

  // ───────────────────────── datos locales ─────────────────────────
  // idiomas para "wiki global" (40+)
  const WIKI_LANGS = ['es','en','fr','de','it','pt','nl','sv','pl','ja','ko','zh',
    'ru','ar','fa','he','hi','th','vi','el','la','eo','tr','fi','cs','uk','id','ro',
    'hu','da','no','ca','eu','gl','is','ka','bn','ta','mn','my','am','si','km'];

  // rarezas — canon curado: música rara + saber raro + folklore de internet
  const RAREZAS = [
    // textura sonora
    'dungeon synth','plunderphonics','musique concrète','hauntology','breakcore','onkyo',
    'kosmische musik','xenharmonic 31-TET','microtonal','just intonation','no-input mixing',
    'circuit bending','data bending','granular synthesis','harsh noise wall','power electronics',
    'death industrial','witch house','footwork','gqom','drone metal','sea shanty','murder ballad',
    'sacred harp','overtone singing','khoomei','gamelan','mbira','duduk','shakuhachi','tape loops',
    'shepard tone','vaporwave plaza','conet project','EVP recordings','shortwave numbers',
    // saber raro / ciencia
    'sperm whale codas','quorum sensing','mycelium network','slime mold maze','tardigrade',
    'immortal jellyfish','octopus dreaming','crow funerals','whale fall','bioluminescence',
    'umwelt von uexküll','dark DNA','deep time','Bronze Age collapse','Kardashev scale',
    'Dyson sphere','Oort cloud','Boltzmann brain','Fermi paradox','grey goo','infrasound',
    // folklore / lugares / internet
    'backrooms','liminal spaces','analog horror','dead mall walkthrough','brutalist architecture',
    'Voynich manuscript','Antikythera mechanism','Codex Seraphinianus','Dyatlov Pass','Tunguska event',
    'Hessdalen lights','Marfa lights','will-o-the-wisp','ball lightning','sprites lightning',
    'Door to Hell','Centralia fire','Movile cave','blue holes','sailing stones','fairy ring',
    'hollow earth','tulpa','ego death','radio static art'];

  // caos — símbolos / glitch / errores
  const CAOS = ['⌘','░▒▓','▚▞▚','◤◥◤◥','¿¿¿','⸮','§§§','¤¤¤','glitch','404','[REDACTED]',
    'NaN','undefined','null','void','segfault','kernel panic','blue screen','heisenbug',
    'race condition','buffer overflow','feedback loop','signal jamming','no carrier','dial-up',
    'white noise','pink noise','brown noise','PRBS','spores','contagion','phantom','corrupted',
    '̸b̸r̸o̸k̸e̸n̸','ʇxǝʇ','wow signal','🜂','🝛'];

  // emojis raros / neutros
  const EMOJIS = ['🜂','🝛','☣','⚗','🧫','🛰','📼','🗿','🕳','🪐','📡','🦴','🧿','🛸',
    '🜔','♅','⛓','🪬','🧬','🩻','📟','🪤','🜍','⌖','☉','♆','⚕','🜏'];

  // estaciones de números / radio (reservorio "frecuencia")
  const ESTACIONES = ['UVB-76','The Buzzer','Lincolnshire Poacher','Swedish Rhapsody',
    'Yosemite Sam','Cherry Ripe','Magnetic Fields','Gong Station','XPA','E11','HM01','S28',
    'The Pip','The Squeaky Wheel','M12','V07','Backwards Music Station'];

  // formatos (mutágeno "formato")
  const FORMATOS = ['full album','en vivo','VHS rip','DJ set','field recording','lost media',
    'found footage','cassette rip','slowed reverb','8 hours','no copyright','subtitulado',
    'documental','raw footage','1 hour','explicado','completo','remastered','bootleg','rare',
    'unboxing','mixtape','side a','radio edit','dub version','sin cortes'];

  // décadas (mutágeno año/década)
  const DECADAS = ['años 50','años 60','años 70','años 80','años 90','90s','80s','Y2K','2000s',
    'años 2010','siglo XIX','medieval','prehistórico','futuro'];

  // catálogos (reservorio "catálogo")
  const CAT_PREFIX = ['Op.','BWV','K.','SCP-','M','NGC','KV','HD','cat.','fragment','RV','Hob.',
    'D.','WoO','IC','PSR','HIP','TYC','2MASS','Gliese','Messier','arXiv:'];

  // plantillas de query (envuelven el término)
  const PLANTILLAS = [
    { id: 'tpl-exp',  label: '{x} explicado',    wrap: x => `${x} explicado` },
    { id: 'tpl-how',  label: 'cómo hacer {x}',   wrap: x => `cómo hacer ${x}` },
    { id: 'tpl-beg',  label: '{x} for beginners', wrap: x => `${x} for beginners` },
    { id: 'tpl-bad',  label: '{x} pero mal',     wrap: x => `${x} pero mal` },
    { id: 'tpl-asmr', label: '{x} asmr',         wrap: x => `${x} asmr` },
    { id: 'tpl-real', label: '{x} a las 3am',    wrap: x => `${x} a las 3am` },
  ];

  // ───────────────────────── reservorios ─────────────────────────
  // Cada uno devuelve un string (o null si falla). Los LIVE pueden lanzar; el
  // motor los envuelve en try/catch y cae a un local si hace falta.
  const RESERVORIOS = [
    // ── live ──
    { id: 'wikipedia', label: 'wikipedia', kind: 'live', async run() {
        const d = await getJSON(`https://${wikiLangChoice()}.wikipedia.org/api/rest_v1/page/random/summary`);
        return clean(d && d.title);
      } },
    { id: 'wikiglobal', label: 'wiki global', kind: 'live', async run() {
        const d = await getJSON(`https://${pick(WIKI_LANGS)}.wikipedia.org/api/rest_v1/page/random/summary`);
        return clean(d && d.title);
      } },
    { id: 'wikcionario', label: 'wikcionario', kind: 'live', async run() {
        const d = await getJSON(`https://${wikiLangChoice()}.wiktionary.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`);
        return clean(d?.query?.random?.[0]?.title);
      } },
    { id: 'commons', label: 'commons', kind: 'live', async run() {
        const d = await getJSON('https://commons.wikimedia.org/w/api.php?action=query&list=random&rnnamespace=6&rnlimit=1&format=json&origin=*');
        let t = d?.query?.random?.[0]?.title;
        if (!t) return null;
        return clean(t.replace(/^File:/i, '').replace(/\.[a-z0-9]{2,4}$/i, '')); // quita File: y extensión
      } },
    { id: 'poesia', label: 'poesía', kind: 'live', async run() {
        const d = await getJSON('https://poetrydb.org/random');
        const lineas = Array.isArray(d?.[0]?.lines) ? d[0].lines.filter(l => l && l.trim()) : [];
        return lineas.length ? clean(pick(lineas)) : null;
      } },
    { id: 'especie', label: 'especie', kind: 'live', async run() {
        const d = await getJSON(`https://api.gbif.org/v1/species/search?rank=SPECIES&status=ACCEPTED&limit=1&offset=${rnd(9000)}`);
        const r = d?.results?.[0];
        return clean(r && (r.canonicalName || r.scientificName));
      } },
    { id: 'museo', label: 'museo', kind: 'live', async run() {
        // Met Museum: ids dispersos con huecos → probamos varios y dejamos que el fallback cubra el resto
        for (let i = 0; i < 3; i++) {
          try {
            const d = await getJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${1 + rnd(850000)}`, 5000, 0);
            const t = clean(d && (d.title || d.objectName));
            if (t) return t;
          } catch { /* id vacío, probamos otro */ }
        }
        return null;
      } },

    // ── local (nunca fallan) ──
    { id: 'rarezas', label: 'rarezas', kind: 'local', run() { return pick(RAREZAS); } },
    { id: 'caos', label: 'caos', kind: 'local', run() {
        const r = Math.random();
        if (r < 0.18) return '0x' + hex(rnd(3) + 2);
        if (r < 0.30) return 'error ' + (rnd(900) + 100);
        return pick(CAOS);
      } },
    { id: 'coordenadas', label: 'coordenadas', kind: 'local', run() {
        const lat = rfloat(-90, 90), lon = rfloat(-180, 180);
        if (Math.random() < 0.4) {  // formato cardinal de vez en cuando
          const ns = lat >= 0 ? 'N' : 'S', ew = lon >= 0 ? 'E' : 'W';
          return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
        }
        return `${lat.toFixed(2)} ${lon.toFixed(2)}`;
      } },
    { id: 'efemeride', label: 'efeméride', kind: 'local', run() {
        const y = 1500 + rnd(521);
        return Math.random() < 0.5 ? String(y) : `año ${y}`;
      } },
    { id: 'catalogo', label: 'catálogo', kind: 'local', run() {
        const p = pick(CAT_PREFIX);
        const n = rnd(2) ? rnd(900) + 1 : rnd(9000) + 100;
        return `${p}${/[.\-:]$/.test(p) ? '' : ' '}${n}`;
      } },
    { id: 'emoji', label: 'emoji', kind: 'local', run() {
        let s = ''; const n = 2 + rnd(3);
        for (let i = 0; i < n; i++) s += pick(EMOJIS);
        return s;
      } },
    { id: 'frecuencia', label: 'frecuencia', kind: 'local', run() {
        const r = Math.random();
        if (r < 0.4) return pick(ESTACIONES);
        if (r < 0.7) return `${1500 + rnd(28000)} kHz`;
        // grupo de cifras estilo estación de números
        let g = []; for (let i = 0; i < 5; i++) g.push(rnd(10));
        return g.join(' ');
      } },
  ];

  function wikiLangChoice() {
    const v = ($('#wikiLang') || {}).value || 'es';
    if (state.mut['idioma-random']) return pick(WIKI_LANGS);
    if (v === 'mix') return pick(['es', 'en']);
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

  // Datamuse (deriva / antónimo) — devuelve lista de palabras o null
  async function datamuse(rel, word) {
    const w = clean(word).split(/\s+/).slice(0, 2).join(' ');
    if (!w) return null;
    const d = await getJSON(`https://api.datamuse.com/words?${rel}=${encodeURIComponent(w)}&max=16`, 6000);
    return Array.isArray(d) && d.length ? d : null;
  }
  const elegirPalabra = d => clean(pick(d.slice(0, 8)).word);

  // ───────────────────────── estado ─────────────────────────
  const LS = { history: 'infectar.history.v1', pool: 'infectar.pool.v1',
               mut: 'infectar.mut.v1', tpl: 'infectar.tpl.v1', noglitch: 'infectar.noglitch' };

  const state = {
    pool: store.get(LS.pool, null),   // {id:bool} — null = todas activas
    mut:  store.get(LS.mut, {}),      // {id:bool}
    tpl:  store.get(LS.tpl, {}),      // {id:bool}
    current: null,                    // muestra mostrada {term, parts, source}
    next: null,                       // Promise de la siguiente muestra (prefetch)
    history: store.get(LS.history, []),
    seen: [],                         // memoria de términos recientes (anti-repe)
    lastSourceId: null,               // anti-racha de fuente
    auto: false, autoEndTs: 0, autoSecs: 8, autoTimer: null,
    generating: false,
  };
  if (!state.pool) { state.pool = {}; RESERVORIOS.forEach(r => state.pool[r.id] = true); }

  const activePool = () => RESERVORIOS.filter(r => state.pool[r.id]);
  const locales    = () => RESERVORIOS.filter(r => r.kind === 'local');

  // elige reservorio evitando repetir el de la tirada anterior
  function elegirFuente() {
    let pool = activePool();
    if (!pool.length) pool = locales();
    if (pool.length > 1 && state.lastSourceId) {
      const sinRepe = pool.filter(r => r.id !== state.lastSourceId);
      if (sinRepe.length) pool = sinRepe;
    }
    return pick(pool);
  }

  // ───────────────────────── generación de muestra ─────────────────────────
  // Devuelve {term, parts, source}. parts = chips para preview.
  async function sample(intento = 0) {
    const fuente = elegirFuente();
    state.lastSourceId = fuente.id;

    let base = null, source = fuente.label;
    try { base = await fuente.run(); } catch { base = null; }
    if (!base) {                       // live caído/vacío → cae a un local
      const fb = pick(locales());
      base = fb.run();
      source = fb.label + '↩';
    }
    base = clean(base) || pick(RAREZAS); // garantía absoluta: nunca vacío

    let parts = [{ txt: base, type: 'base' }];
    let term = base;

    // deriva ×N — saltos semánticos encadenados
    if (state.mut['deriva']) {
      const n = parseInt(($('#derivaN') || {}).value || '1', 10);
      let w = term;
      try {
        for (let i = 0; i < n; i++) {
          const d = await datamuse('ml', w);
          if (!d) break;
          const sig = elegirPalabra(d);
          if (!sig) break;
          w = sig;
        }
        if (w && norm(w) !== norm(term)) {
          term = w; parts = [{ txt: term, type: 'base' }, { txt: `deriva ×${n}`, type: 'mut' }];
        }
      } catch { /* deriva es opcional */ }
    }

    // antónimo — modo anti-recomendador
    if (state.mut['antonimo']) {
      try {
        const d = await datamuse('rel_ant', term);
        const ant = d && elegirPalabra(d);
        if (ant) { term = ant; parts = [{ txt: term, type: 'base' }, { txt: 'antónimo', type: 'mut' }]; }
      } catch { /* opcional */ }
    }

    // formato
    if (state.mut['formato']) {
      const f = pick(FORMATOS); term += ' ' + f; parts.push({ txt: f, type: 'mut' });
    }
    // año/década
    if (state.mut['anodecada']) {
      const v = Math.random() < 0.5 ? String(1955 + rnd(62)) : pick(DECADAS);
      term += ' ' + v; parts.push({ txt: v, type: 'mut' });
    }
    // mash-up — término de OTRO reservorio (choque de mundos; prioriza locales)
    if (state.mut['mashup']) {
      const otros = [...locales(), ...activePool().filter(r => r.kind === 'live')]
        .filter(r => r.id !== fuente.id);
      let extra = null;
      for (const r of otros) {
        try { extra = clean(await r.run()); } catch { extra = null; }
        if (extra) break;
      }
      if (extra) { term += ' ' + extra; parts.push({ txt: extra, type: 'mut' }); }
    }

    // plantillas (envuelven el resultado final)
    const tplsOn = PLANTILLAS.filter(t => state.tpl[t.id]);
    if (tplsOn.length) {
      const tpl = pick(tplsOn); term = tpl.wrap(term); parts.push({ txt: tpl.label, type: 'tpl' });
    }

    term = clean(term);

    // anti-repetición: si ya salió hace poco, re-tira (con tope de intentos)
    if (intento < 3 && state.seen.includes(norm(term))) return sample(intento + 1);

    parts.push({ txt: source, type: 'fuente' });
    return { term, parts, source };
  }

  // ── prefetch: la siguiente muestra se cocina en segundo plano ──
  function prefetchNext() { state.next = sample().catch(() => null); }
  function invalidarPrefetch() { state.next = null; }

  // ───────────────────────── render ─────────────────────────
  const ytURL = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  const termEl   = $('#term');
  const chipsEl  = $('#chips');
  const depthEl  = $('#depth');
  const tunnelEl = $('#tunnel');

  function recordarSeen(term) {
    state.seen.push(norm(term));
    if (state.seen.length > 60) state.seen.shift();
  }

  function renderPreview(s) {
    state.current = s;
    recordarSeen(s.term);
    termEl.classList.remove('idle');
    termEl.textContent = s.term;
    termEl.href = ytURL(s.term);
    if (!document.body.classList.contains('no-glitch')) {
      termEl.classList.remove('glitch'); void termEl.offsetWidth; termEl.classList.add('glitch');
    }
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
    document.body.classList.toggle('busy', busy);
    if (busy && !state.current) { termEl.classList.add('idle'); termEl.textContent = '·· tirando del azar'; termEl.removeAttribute('href'); }
  }

  // genera y muestra. Usa el prefetch si está listo (→ instantáneo), si no, tira en vivo.
  async function recombinar() {
    if (state.generating) return;
    setBusy(true);
    try {
      let s = state.next ? await state.next : null;
      state.next = null;
      if (!s) s = await sample();
      renderPreview(s);
    } catch {
      const b = pick(RAREZAS);
      renderPreview({ term: b, parts: [{ txt: b, type: 'base' }, { txt: 'rarezas↩', type: 'fuente' }], source: 'rarezas↩' });
    } finally {
      setBusy(false);
      prefetchNext(); // deja lista la siguiente
    }
  }

  // ───────────────────────── inyectar ─────────────────────────
  // reuse=true reutiliza una sola pestaña (auto-infectar); false abre una nueva (manual)
  function infectar(reuse = false) {
    if (!state.current || !state.current.term) { recombinar(); return; }
    const s = state.current;
    window.open(ytURL(s.term), reuse ? 'infectar_yt' : '_blank', 'noopener');
    pushHistory(s);
    recombinar();
  }

  // ───────────────────────── descenso / historial ─────────────────────────
  function pushHistory(s) {
    state.history.unshift({ term: s.term, source: s.source, t: Date.now() });
    if (state.history.length > 300) state.history.length = 300;
    store.set(LS.history, state.history);
    renderHistory(true);
    updateDepth();
  }

  const hhmm = ts => { const d = new Date(ts), p = n => String(n).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())}`; };
  const ESCAPE = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' };
  const escapeHTML = s => (s || '').replace(/[&<>"']/g, c => ESCAPE[c]);

  function renderHistory(fresh) {
    const n = state.history.length;
    $('#descensoActions').hidden = n === 0;
    $('#descensoCount').textContent = n === 0
      ? 'vacía · todavía no has soltado nada aquí abajo'
      : `${n} ${n === 1 ? 'inyección' : 'inyecciones'} · se hunden con la profundidad`;

    tunnelEl.innerHTML = '';
    state.history.forEach((e, i) => {
      const li = document.createElement('li');
      li.className = 'node' + (fresh && i === 0 ? ' fresh' : '');
      const scale = Math.max(0.5, 1 - i * 0.045);
      li.style.opacity = Math.max(0.18, 1 - i * 0.07).toFixed(2);

      const a = document.createElement('a');
      a.className = 'node-term';
      a.href = ytURL(e.term); a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = e.term;
      a.style.fontSize = (34 * scale).toFixed(1) + 'px';

      const meta = document.createElement('div');
      meta.className = 'node-meta';
      meta.innerHTML = `-${String(n - i).padStart(2, '0')} <span class="sep">◈</span> ${escapeHTML(e.source)} <span class="sep">◈</span> ${hhmm(e.t)}`;

      li.append(a, meta);
      tunnelEl.appendChild(li);
    });
  }

  const updateDepth = () => { depthEl.textContent = '-' + String(state.history.length).padStart(2, '0'); };

  // exportar rastro → markdown al portapapeles
  async function exportar() {
    if (!state.history.length) { toast('aún no hay rastro que llevarse'); return; }
    const lines = ['# INFECTAR — rastro de la madriguera', '',
      `> ${state.history.length} inyecciones · confía en tus amigas, no en el algoritmo`, ''];
    state.history.forEach((e, i) => {
      lines.push(`- \`-${String(state.history.length - i).padStart(2, '0')}\` **${e.term}** — _${e.source}_ · ${new Date(e.t).toISOString()}`);
      lines.push(`  - ${ytURL(e.term)}`);
    });
    lines.push('', '— Queimada Circuit Records · LAB · INFECTAR');
    const md = lines.join('\n');
    try {
      await navigator.clipboard.writeText(md);
      toast('rastro al portapapeles ✓');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = md; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('rastro al portapapeles ✓'); }
      catch { toast('no me deja copiar — mira los permisos'); }
      ta.remove();
    }
  }

  // colapsar el pozo (borra historial) con diálogo propio
  async function colapsar() {
    if (!state.history.length) return;
    const ok = await dialogo({
      titulo: 'colapsar el pozo',
      cuerpo: 'esto borra toda la madriguera. no hay vuelta atrás.',
      si: 'colapsar', no: 'déjalo', peligro: true,
    });
    if (!ok) return;
    state.history = [];
    store.set(LS.history, state.history);
    renderHistory(false);
    updateDepth();
    toast('pozo colapsado. a empezar de cero.');
  }

  // ───────────────────────── auto-infectar ─────────────────────────
  function toggleAuto() {
    state.auto = !state.auto;
    const btn = $('#btnAuto');
    btn.setAttribute('aria-pressed', String(state.auto));
    if (state.auto) {
      toast('auto on · reutiliza una pestaña, no te llena de pestañas');
      armarAuto();
      tickAuto();
    } else {
      pararAuto();
    }
  }
  function pararAuto() {
    clearInterval(state.autoTimer); state.autoTimer = null;
    const btn = $('#btnAuto');
    btn.textContent = 'auto ▷';
    btn.style.removeProperty('--p');
  }
  function armarAuto() {
    state.autoSecs = parseInt(($('#autoSecs') || {}).value || '8', 10);
    state.autoEndTs = Date.now() + state.autoSecs * 1000;
  }
  function tickAuto() {
    clearInterval(state.autoTimer);
    const btn = $('#btnAuto');
    state.autoTimer = setInterval(() => {
      if (!state.auto) return pararAuto();
      const queda = state.autoEndTs - Date.now();
      btn.textContent = 'auto ■ ' + Math.max(0, Math.ceil(queda / 1000));
      btn.style.setProperty('--p', (100 * (1 - queda / (state.autoSecs * 1000))).toFixed(0) + '%');
      if (queda <= 0) { infectar(true); armarAuto(); }
    }, 200);
  }

  // ───────────────────────── diálogo propio (estilo QCR, no el del navegador) ─────────────────────────
  let dlgPrev = null;
  function dialogo({ titulo, cuerpo, si = 'sí', no = 'no', peligro = false }) {
    return new Promise(resolve => {
      dlgPrev = document.activeElement;
      const ov = document.createElement('div');
      ov.className = 'dlg-ov';
      ov.innerHTML = `
        <div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgT" aria-describedby="dlgB">
          <p class="dlg-t" id="dlgT"><span class="sep">◈</span> ${escapeHTML(titulo)}</p>
          <p class="dlg-b" id="dlgB">${escapeHTML(cuerpo)}</p>
          <div class="dlg-row">
            <button class="btn btn-ghost dlg-no" type="button">${escapeHTML(no)}</button>
            <button class="btn ${peligro ? 'btn-ghost danger' : 'btn-main'} dlg-si" type="button">${escapeHTML(si)}</button>
          </div>
        </div>`;
      const cerrar = (val) => {
        ov.classList.remove('show');
        setTimeout(() => ov.remove(), 180);
        document.removeEventListener('keydown', onKey, true);
        if (dlgPrev && dlgPrev.focus) dlgPrev.focus();
        resolve(val);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); cerrar(false); }
        if (e.key === 'Enter')  { e.preventDefault(); cerrar(true); }
      };
      ov.querySelector('.dlg-si').addEventListener('click', () => cerrar(true));
      ov.querySelector('.dlg-no').addEventListener('click', () => cerrar(false));
      ov.addEventListener('mousedown', (e) => { if (e.target === ov) cerrar(false); });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(ov);
      requestAnimationFrame(() => { ov.classList.add('show'); ov.querySelector('.dlg-si').focus(); });
    });
  }

  // ───────────────────────── toast ─────────────────────────
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => { el.hidden = true; }, 250); }, 2600);
  }

  // ───────────────────────── toggles UI ─────────────────────────
  function buildToggle({ id, label, pressed, kind, cls }) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toggle' + (cls ? ' ' + cls : '') + (kind ? ' ' + kind : '');
    b.setAttribute('aria-pressed', String(!!pressed));
    b.dataset.id = id;
    const mark = document.createElement('span'); mark.className = 'mark'; mark.textContent = pressed ? '◈' : '◇';
    const txt = document.createElement('span'); txt.textContent = label;
    b.append(mark, txt);
    if (kind) { const badge = document.createElement('span'); badge.className = 'badge'; b.append(badge); }
    return b;
  }
  function syncToggle(b, pressed) {
    b.setAttribute('aria-pressed', String(pressed));
    b.querySelector('.mark').textContent = pressed ? '◈' : '◇';
  }

  function buildToggleGroup(sel, items, stateMap, lsKey, { cls, refresh } = {}) {
    const wrap = $(sel); wrap.innerHTML = '';
    items.forEach(it => {
      const b = buildToggle({ id: it.id, label: it.label, pressed: !!stateMap[it.id], kind: it.kind, cls });
      b.addEventListener('click', () => {
        stateMap[it.id] = !stateMap[it.id];
        syncToggle(b, stateMap[it.id]);
        store.set(lsKey, stateMap);
        if (refresh) { invalidarPrefetch(); recombinar(); }
      });
      wrap.appendChild(b);
    });
  }

  // atajos del pool
  function setPool(fn) {
    RESERVORIOS.forEach(r => state.pool[r.id] = fn(r));
    $$('#poolToggles .toggle').forEach(b => syncToggle(b, !!state.pool[b.dataset.id]));
    store.set(LS.pool, state.pool);
    invalidarPrefetch();
  }

  // ───────────────────────── eventos ─────────────────────────
  function wire() {
    $('#btnInfectar').addEventListener('click', () => infectar(false));
    $('#btnRecombinar').addEventListener('click', recombinar);
    $('#btnAuto').addEventListener('click', toggleAuto);
    $('#btnExport').addEventListener('click', exportar);
    $('#btnCollapse').addEventListener('click', colapsar);

    $('[data-pool-all]').addEventListener('click',   () => setPool(() => true));
    $('[data-pool-none]').addEventListener('click',  () => setPool(() => false));
    $('[data-pool-local]').addEventListener('click', () => setPool(r => r.kind === 'local'));

    const derivaN = $('#derivaN'), derivaOut = $('#derivaOut');
    derivaN.addEventListener('input', () => { derivaOut.textContent = '×' + derivaN.value; invalidarPrefetch(); });
    const autoSecs = $('#autoSecs'), autoOut = $('#autoOut');
    autoSecs.addEventListener('input', () => { autoOut.textContent = autoSecs.value + 's'; if (state.auto) armarAuto(); });

    $('#wikiLang').addEventListener('change', () => { invalidarPrefetch(); recombinar(); });

    const rg = $('#reduceGlitch');
    rg.checked = store.get(LS.noglitch, false);
    document.body.classList.toggle('no-glitch', rg.checked);
    rg.addEventListener('change', () => {
      document.body.classList.toggle('no-glitch', rg.checked);
      store.set(LS.noglitch, rg.checked);
    });

    // teclado
    document.addEventListener('keydown', (e) => {
      if ($('.dlg-ov')) return; // el diálogo gestiona sus teclas
      const tag = (e.target.tagName || '').toLowerCase();
      const editable = ['input','select','textarea','button','summary'].includes(tag) || e.target.isContentEditable;
      if (editable) return;
      if (e.code === 'Space') { e.preventDefault(); infectar(false); }
      else if (e.key.toLowerCase() === 'r') { recombinar(); }
    });

    // clicar el término gigante también cuenta como inyección
    termEl.addEventListener('click', () => {
      if (!state.current) return;
      pushHistory(state.current);
      setTimeout(recombinar, 30);
    });
  }

  function honorReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('no-glitch');
  }

  // ───────────────────────── init ─────────────────────────
  function init() {
    honorReducedMotion();
    buildToggleGroup('#poolToggles', RESERVORIOS, state.pool, LS.pool);
    buildToggleGroup('#mutToggles', MUTAGENOS, state.mut, LS.mut, { cls: 'mut', refresh: true });
    buildToggleGroup('#tplToggles', PLANTILLAS, state.tpl, LS.tpl, { cls: 'mut', refresh: true });
    wire();
    renderHistory(false);
    updateDepth();
    recombinar(); // primera muestra al cargar
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
