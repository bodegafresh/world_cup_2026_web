// ─── Flags ───────────────────────────────────────────────────────────────────
const FLAGS = {
  'Argentina':'🇦🇷','Brasil':'🇧🇷','Francia':'🇫🇷','Alemania':'🇩🇪','España':'🇪🇸',
  'Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Países Bajos':'🇳🇱','Netherlands':'🇳🇱',
  'Bélgica':'🇧🇪','Uruguay':'🇺🇾','Colombia':'🇨🇴','México':'🇲🇽',
  'USA':'🇺🇸','Estados Unidos':'🇺🇸','Canadá':'🇨🇦','Canada':'🇨🇦',
  'Marruecos':'🇲🇦','Senegal':'🇸🇳','Japón':'🇯🇵','Japan':'🇯🇵','Corea del Sur':'🇰🇷',
  'Australia':'🇦🇺','Ecuador':'🇪🇨','Chile':'🇨🇱','Perú':'🇵🇪',
  'Venezuela':'🇻🇪','Bolivia':'🇧🇴','Paraguay':'🇵🇾','Costa Rica':'🇨🇷',
  'Panamá':'🇵🇦','Honduras':'🇭🇳','Jamaica':'🇯🇲','Qatar':'🇶🇦',
  'Arabia Saudita':'🇸🇦','Irán':'🇮🇷','Irak':'🇮🇶','Suiza':'🇨🇭',
  'Croacia':'🇭🇷','Serbia':'🇷🇸','Polonia':'🇵🇱','Dinamarca':'🇩🇰',
  'Austria':'🇦🇹','Turquía':'🇹🇷','Ucrania':'🇺🇦','Nigeria':'🇳🇬',
  'Ghana':'🇬🇭','Costa de Marfil':'🇨🇮','Camerún':'🇨🇲','Túnez':'🇹🇳',
  'Egipto':'🇪🇬','Argelia':'🇩🇿','Suecia':'🇸🇪','Noruega':'🇳🇴',
  'Italia':'🇮🇹','Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Grecia':'🇬🇷','Georgia':'🇬🇪',
  'China':'🇨🇳','Nueva Zelanda':'🇳🇿','Rep. Checa':'🇨🇿','Rumanía':'🇷🇴',
  'Eslovaquia':'🇸🇰','Hungría':'🇭🇺','Albania':'🇦🇱','Eslovenia':'🇸🇮',
  'Congo DR':'🇨🇩','Uzbekistán':'🇺🇿','Uzbekistan':'🇺🇿','Sudáfrica':'🇿🇦',
  'Bosnia':'🇧🇦','Catar':'🇶🇦','República Checa':'🇨🇿','Rep. Dominicana':'🇩🇴',
  'El Salvador':'🇸🇻','Guatemala':'🇬🇹','Cuba':'🇨🇺','Trinidad y Tobago':'🇹🇹',
  'Nueva Caledonia':'🇳🇨','Tahití':'🇵🇫','Fiji':'🇫🇯','Vanuatu':'🇻🇺',
  'Israel':'🇮🇱','Siria':'🇸🇾','Jordania':'🇯🇴','Iraq':'🇮🇶',
  'Mali':'🇲🇱','Angola':'🇦🇴','Tanzania':'🇹🇿','Kenia':'🇰🇪',
};
const flag = t => FLAGS[t] || '🏳️';

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = {
  pct:  v => `${Number(v||0).toFixed(1)}%`,
  dec:  v => Number(v||0).toFixed(2),
  sign: v => { const n = Number(v||0); return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }
};

function formatHora(v) {
  if (!v) return '';
  const s = String(v);
  const m = s.match(/T(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;
  if (/^\d{1,2}:\d{2}/.test(s)) return s.substring(0,5);
  return '';
}

function fmtDate(s) {
  if (!s) return '';
  const [y,mo,d] = String(s).substring(0,10).split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${months[parseInt(mo)-1]}`;
}

function today() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Santiago' });
}

function evColor(ev) {
  const v = Number(ev) * 100;
  if (v >= 10) return 'alta';
  if (v >=  5) return 'media';
  return 'baja';
}
function simBarColor(p) {
  if (p >= 70) return '#00c853';
  if (p >= 40) return '#ffd700';
  return '#ff7043';
}
function posOrder(p) {
  const m = {goalkeeper:0,gk:0,defender:1,cb:1,lb:1,rb:1,wb:1,midfielder:2,cm:2,dm:2,am:2,forward:3,fw:3,st:3,lw:3,rw:3};
  return m[(p||'').toLowerCase()] ?? 2;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const KEY_STORAGE = 'wc2026_key';
const getSavedKey = () => localStorage.getItem(KEY_STORAGE) || '';
const saveKey     = k  => localStorage.setItem(KEY_STORAGE, k);
const clearKey    = () => localStorage.removeItem(KEY_STORAGE);

// ─── API fetcher ──────────────────────────────────────────────────────────────
async function fetchTab(tab, extraParams) {
  const key = getSavedKey();
  let url = `${WORKER_URL}/api?tab=${encodeURIComponent(tab)}&key=${encodeURIComponent(key)}`;
  if (extraParams) url += '&' + new URLSearchParams(extraParams).toString();
  const res  = await fetch(url);
  const json = await res.json();
  if (res.status === 401 || (json && json.error === 'Unauthorized')) {
    clearKey(); showLogin('Clave incorrecta. Inténtalo de nuevo.');
    throw new Error('Unauthorized');
  }
  if (!json.ok) throw new Error(json.error || 'Error del servidor');
  return json.data;
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const cache = {};
async function getData(tab, ttlMs = 5 * 60 * 1000, extraParams) {
  const cacheKey = tab + (extraParams ? JSON.stringify(extraParams) : '');
  const now = Date.now();
  if (cache[cacheKey] && (now - cache[cacheKey].ts) < ttlMs) return cache[cacheKey].data;
  const data = await fetchTab(tab, extraParams);
  cache[cacheKey] = { data, ts: now };
  return data;
}

// ─── State ────────────────────────────────────────────────────────────────────
const state = { section: 'hoy', activeGroup: 'A', dateView: 'hoy' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const loadingHtml = () => `<div class="loading-center"><div class="spinner"></div><span>Cargando...</span></div>`;
const errorHtml   = m  => `<div class="error-state"><div class="icon">⚠️</div><p>${m}</p></div>`;
const skeletons   = n  => `<div class="matches-grid">${'<div class="skeleton skel-card"></div>'.repeat(n)}</div>`;
const emptyHtml   = (icon, msg) => `<div class="error-state"><div class="icon">${icon}</div><p>${msg}</p></div>`;

// ─── Match card base ──────────────────────────────────────────────────────────
function renderMatchCard(m, preds) {
  const STATUS_LIVE = ['1H','2H','HT','ET','BT','P','INT','LIVE'];
  const STATUS_FT   = ['FT','AET','PEN'];
  const st = String(m.status||'').toUpperCase();
  const isLive = STATUS_LIVE.includes(st);
  const isFT   = STATUS_FT.includes(st);

  const gL = m.goles_local     !== null && m.goles_local     !== undefined ? m.goles_local     : null;
  const gV = m.goles_visitante !== null && m.goles_visitante !== undefined ? m.goles_visitante : null;

  let statusHtml;
  if (isLive) {
    const min = m.minuto ? ` ${m.minuto}` : (m.status ? ` ${m.status}` : '');
    statusHtml = `<span class="status-live">🔴 EN VIVO${min}</span>`;
  } else if (isFT) {
    statusHtml = `<span class="status-ft">FT</span>`;
  } else {
    const hora = formatHora(m.hora_chile || m.hora);
    statusHtml = `<span class="match-time">${hora || '–'}</span>`;
  }

  const scoreHtml = (gL !== null && gV !== null)
    ? `<div class="match-score${isLive ? ' live-score' : ''}">${gL} – ${gV}</div>`
    : `<div class="match-score pending">vs</div>`;

  const pred = preds && preds.find(p =>
    String(p.local||'').toLowerCase() === String(m.local||'').toLowerCase() &&
    String(p.visitante||'').toLowerCase() === String(m.visitante||'').toLowerCase()
  );
  let probHtml = '';
  if (pred && !isLive) {
    const ph = Number(pred.prob_home || pred.prob_local || 0) * 100;
    const pd = Number(pred.prob_draw || 0) * 100;
    const pa = Number(pred.prob_away || pred.prob_visitante || 0) * 100;
    if (ph + pd + pa >= 1) {
      probHtml = `
        <div class="prob-bar">
          <div class="ph" style="width:${ph}%"></div>
          <div class="pd" style="width:${pd}%"></div>
          <div class="pa" style="width:${pa}%"></div>
        </div>
        <div class="prob-labels">
          <span class="ph-l">${fmt.pct(ph)}</span>
          <span style="color:var(--text3)">${fmt.pct(pd)}</span>
          <span class="pa-l">${fmt.pct(pa)}</span>
        </div>`;
    }
  }

  const grupoLabel = (m.grupo && !['NS','TBD',''].includes((m.grupo||'').toUpperCase()))
    ? m.grupo : (m.ronda || '');
  const mk = m.match_key || '';
  const clickAttr = mk ? `onclick="toggleMatchDetail('${mk}')" style="cursor:pointer"` : '';

  // Estadio + hora local + clima
  let venueHtml = '';
  if (m.estadio || m.ciudad) {
    const horaLocal = m.hora_local ? ` · ${m.hora_local} local` : '';
    venueHtml += `<div class="match-venue">📍 ${[m.estadio, m.ciudad].filter(Boolean).join(', ')}${horaLocal}</div>`;
  }
  if (m.clima) {
    const c = m.clima;
    const condIcon = {'DESPEJADO':'☀️','NUBLADO':'☁️','LLUVIA':'🌧️','TORMENTA':'⛈️','NIEBLA':'🌫️','VIENTO':'💨'}[c.condicion] || '🌡️';
    const parts = [];
    if (c.temperatura != null) parts.push(`${c.temperatura}°C`);
    if (c.humedad     != null) parts.push(`💧${c.humedad}%`);
    if (c.viento      != null) parts.push(`💨${c.viento}km/h`);
    if (parts.length) venueHtml += `<div class="match-clima">${condIcon} ${parts.join(' · ')}</div>`;
  }

  return `
  <div class="match-card${isLive ? ' live' : ''}" ${clickAttr}>
    <div class="match-meta">
      <span class="grupo">${grupoLabel}</span>
      ${statusHtml}
    </div>
    <div class="match-teams">
      <div class="match-team">
        <div class="flag">${flag(m.local)}</div>
        <div class="name">${m.local||''}</div>
      </div>
      ${scoreHtml}
      <div class="match-team">
        <div class="flag">${flag(m.visitante)}</div>
        <div class="name">${m.visitante||''}</div>
      </div>
    </div>
    ${venueHtml}
    ${probHtml}
  </div>
  ${mk ? `<div id="detail-${mk}" class="match-detail-inline" style="display:none"></div>` : ''}`;
}

// ─── Sección: HOY / AYER / MAÑANA / PRÓXIMOS ─────────────────────────────────
let hoyRefreshInterval = null;

function switchDateView(view) {
  state.dateView = view;
  document.querySelectorAll('.date-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.date === view));
  renderDateSection();
}

async function renderHoy() {
  renderDateSection();
}

async function renderDateSection() {
  const el = document.getElementById('section-hoy');
  el.innerHTML = skeletons(4);
  const view = state.dateView;

  try {
    if (view === 'proximos') {
      await renderProximosInline(el);
      return;
    }

    const tab  = view === 'manana' ? 'proximos' : view; // mañana comes from proximos[0]
    let data, preds;

    if (view === 'hoy') {
      [data, preds] = await Promise.all([getData('hoy', 0), getData('predictions').catch(() => [])]);
    } else if (view === 'ayer') {
      [data, preds] = await Promise.all([getData('ayer', 2*60*1000), getData('predictions').catch(() => [])]);
    } else {
      // mañana: tomar el primer día de proximos
      const proxData = await getData('proximos', 5*60*1000);
      const dias = proxData.dias || [];
      const mañanaData = dias[0] || { fecha: '', partidos: [] };
      data = { fecha: mañanaData.fecha, terminados: [], en_vivo: [], proximos: mañanaData.partidos };
      preds = await getData('predictions').catch(() => []);
    }

    let html = '';

    if (view === 'hoy') {
      const enVivo     = data.en_vivo    || [];
      const terminados = data.terminados || [];
      const proximos   = data.proximos   || [];

      if (enVivo.length) {
        document.getElementById('live-badge').style.display = 'inline-flex';
        html += `<h3 class="section-title">🔴 En vivo <span class="title-sub">actualiza cada 30s</span></h3>
                 <div class="matches-grid">${enVivo.map(m => renderMatchCard(m, preds)).join('')}</div>`;
      } else {
        document.getElementById('live-badge').style.display = 'none';
      }
      if (terminados.length) {
        html += `<h3 class="section-title" style="margin-top:1.5rem">✅ Resultados</h3>
                 <div class="matches-grid">${terminados.map(m => renderMatchCard(m, preds)).join('')}</div>`;
      }
      if (proximos.length) {
        html += `<h3 class="section-title" style="margin-top:1.5rem">🕒 Próximos hoy</h3>
                 <div class="matches-grid">${proximos.map(m => renderMatchCard(m, preds)).join('')}</div>`;
      }
      if (!html) html = emptyHtml('📅', 'No hay partidos registrados para hoy.');

      clearInterval(hoyRefreshInterval);
      if (enVivo.length) {
        hoyRefreshInterval = setInterval(() => {
          if (state.section === 'hoy' && state.dateView === 'hoy') { delete cache['hoy']; renderDateSection(); }
        }, 30000);
      }

    } else if (view === 'ayer') {
      const partidos = data.partidos || [];
      if (!partidos.length) { html = emptyHtml('📅', 'No hay datos de ayer.'); }
      else {
        html = `<h3 class="section-title">✅ Resultados de ayer ${data.fecha ? '· ' + fmtDate(data.fecha) : ''}</h3>
                <div class="matches-grid">${partidos.map(m => renderMatchCard(m, preds)).join('')}</div>`;
      }
    } else {
      // mañana
      const partidos = (data.proximos || data.partidos || []);
      const fecha = data.fecha || '';
      if (!partidos.length) { html = emptyHtml('📅', 'Sin partidos mañana.'); }
      else {
        html = `<h3 class="section-title">📅 Mañana ${fecha ? '· ' + fmtDate(fecha) : ''}</h3>
                <div class="matches-grid">${partidos.map(m => renderMatchCard(m, preds)).join('')}</div>`;
      }
    }

    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = errorHtml('No se pudo cargar: ' + e.message);
  }
}

async function renderProximosInline(el) {
  try {
    const [proxData, preds] = await Promise.all([
      getData('proximos', 5*60*1000),
      getData('predictions').catch(() => [])
    ]);
    const dias = proxData.dias || [];
    if (!dias.length) { el.innerHTML = emptyHtml('📅', 'No hay próximos partidos.'); return; }
    el.innerHTML = dias.map(dia => `
      <div style="margin-bottom:1.5rem">
        <h3 class="section-title">📅 ${fmtDate(dia.fecha)}</h3>
        <div class="matches-grid">${(dia.partidos||[]).map(m => renderMatchCard(m, preds)).join('')}</div>
      </div>`).join('');
  } catch(e) {
    el.innerHTML = errorHtml('Error próximos: ' + e.message);
  }
}

// ─── Match detail toggle ──────────────────────────────────────────────────────
async function toggleMatchDetail(matchKey) {
  const el = document.getElementById(`detail-${matchKey}`);
  if (!el) return;
  if (el.style.display !== 'none') { el.style.display = 'none'; return; }
  el.style.display = '';
  if (el.dataset.loaded) return;
  el.innerHTML = loadingHtml();
  try {
    const data = await fetchTab('match', { match_key: matchKey });
    el.dataset.loaded = '1';
    el.innerHTML = buildMatchDetail(data);
  } catch(e) {
    el.innerHTML = errorHtml('No se pudo cargar el detalle: ' + e.message);
  }
}

function buildMatchDetail(m) {
  const eventIcons = { Goal:'⚽', subst:'🔄', yellowcard:'🟨', yellowredcard:'🟨🟥', redcard:'🟥', var:'📺' };

  const evHtml = (m.eventos && m.eventos.length)
    ? m.eventos.map(ev => {
        const icon = eventIcons[(ev.tipo||'').toLowerCase()] || '•';
        const min  = ev.extra ? `${ev.minuto}+${ev.extra}'` : `${ev.minuto}'`;
        return `<div class="live-event">
          <span class="live-min">${min}</span>
          <span class="live-icon">${icon}</span>
          <span class="live-team">${ev.equipo||''}</span>
          <span class="live-player">${ev.jugador||''}${ev.asistente ? ` <small>(${ev.asistente})</small>` : ''}</span>
        </div>`;
      }).join('')
    : '';

  const statsHtml  = m.stats       ? buildStatsBars(m.local, m.visitante, m.stats) : '';
  const alinHtml   = buildLineups(m.local, m.visitante, m.alineaciones || []);

  const poissonHtml = m.poisson ? `
    <div class="detail-block">
      <div class="detail-block-title">🎯 Predicción Poisson</div>
      <div class="prob-bar" style="height:10px;margin-bottom:.5rem">
        <div class="ph" style="width:${m.poisson.prob_home}%"></div>
        <div class="pd" style="width:${m.poisson.prob_draw}%"></div>
        <div class="pa" style="width:${m.poisson.prob_away}%"></div>
      </div>
      <div class="prob-labels">
        <span class="ph-l">${m.poisson.prob_home}%</span>
        <span style="color:var(--text3)">${m.poisson.prob_draw}%</span>
        <span class="pa-l">${m.poisson.prob_away}%</span>
      </div>
      <div class="match-xg" style="margin-top:.5rem">
        xG esperado: <span>${m.poisson.lambda_h}</span> – <span>${m.poisson.lambda_a}</span>
        &nbsp;·&nbsp; O2.5: <span>${m.poisson.over25}%</span>
        &nbsp;·&nbsp; BTTS: <span>${m.poisson.btts}%</span>
      </div>
    </div>` : '';

  const aiHtml = (m.ai && m.ai.resumen) ? `
    <div class="detail-block">
      <div class="detail-block-title">🤖 Análisis IA</div>
      <p class="ai-text">${m.ai.resumen}</p>
      ${m.ai.factores ? `<p class="ai-sub">📌 ${m.ai.factores}</p>` : ''}
      ${m.ai.alertas  ? `<p class="ai-sub ai-alert">⚠️ ${m.ai.alertas}</p>` : ''}
    </div>` : '';

  const h2hHtml = (m.h2h && m.h2h.length) ? `
    <div class="detail-block">
      <div class="detail-block-title">🔁 Historial H2H</div>
      ${m.h2h.map(h => `<div class="h2h-row">
        <span>${flag(h.local)} ${h.local}</span>
        <strong class="h2h-score">${h.goles_local} – ${h.goles_visitante}</strong>
        <span>${flag(h.visitante)} ${h.visitante}</span>
      </div>`).join('')}
    </div>` : '';

  return `<div class="match-detail-body">
    ${evHtml ? `<div class="detail-block"><div class="detail-block-title">📋 Eventos</div><div class="live-events-list">${evHtml}</div></div>` : ''}
    ${statsHtml}
    ${poissonHtml}
    ${alinHtml}
    ${aiHtml}
    ${h2hHtml}
  </div>`;
}

// ─── Stats bars ───────────────────────────────────────────────────────────────
function buildStatsBars(local, visitante, s) {
  const rows = [
    ['Posesión %',   s.posesion_local,    s.posesion_visitante,    100],
    ['Tiros',        s.tiros_local,       s.tiros_visitante,       null],
    ['Al arco',      s.tiros_arco_local,  s.tiros_arco_visitante,  null],
    ['Corners',      s.corners_local,     s.corners_visitante,     null],
    ['Faltas',       s.faltas_local,      s.faltas_visitante,      null],
    ['Amarillas 🟨', s.amarillas_local,   s.amarillas_visitante,   null],
    ['Rojas 🟥',     s.rojas_local,       s.rojas_visitante,       null],
  ].filter(([,l,v]) => (l||0) + (v||0) > 0);
  if (!rows.length) return '';
  return `<div class="detail-block">
    <div class="detail-block-title">📊 Estadísticas</div>
    <div class="stats-compare">
      <div class="stats-header">
        <span class="stats-team-l">${flag(local)} ${local}</span>
        <span></span>
        <span class="stats-team-r">${flag(visitante)} ${visitante}</span>
      </div>
      ${rows.map(([label, lv, rv, max]) => {
        const total = max || (Number(lv||0) + Number(rv||0)) || 1;
        const lPct  = Math.round(Number(lv||0) / total * 100);
        const rPct  = Math.round(Number(rv||0) / total * 100);
        return `<div class="stat-row">
          <span class="stat-val-l">${lv||0}</span>
          <div class="stat-bar-wrap">
            <div class="stat-bar-l" style="width:${lPct}%"></div>
            <span class="stat-label">${label}</span>
            <div class="stat-bar-r" style="width:${rPct}%"></div>
          </div>
          <span class="stat-val-r">${rv||0}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── Lineups ──────────────────────────────────────────────────────────────────
function buildLineups(local, visitante, alineaciones) {
  const local11  = alineaciones.filter(a => a.equipo === local     && a.rol === 'titular').sort((a,b)=>a.numero-b.numero);
  const visit11  = alineaciones.filter(a => a.equipo === visitante && a.rol === 'titular').sort((a,b)=>a.numero-b.numero);
  const localSub = alineaciones.filter(a => a.equipo === local     && a.rol !== 'titular');
  const visitSub = alineaciones.filter(a => a.equipo === visitante && a.rol !== 'titular');
  if (!local11.length && !visit11.length) return '';
  const row = p => `<div class="lineup-player"><span class="lineup-num">${p.numero}</span><span>${p.jugador}</span><span class="lineup-pos">${p.posicion||''}</span></div>`;
  return `<div class="detail-block">
    <div class="detail-block-title">👥 Alineaciones</div>
    <div class="lineups-grid">
      <div class="lineup-col">
        <div class="lineup-team">${flag(local)} ${local}</div>
        ${local11.map(row).join('')}
        ${localSub.length ? `<div class="lineup-subs">Suplentes: ${localSub.map(p=>p.jugador).join(', ')}</div>` : ''}
      </div>
      <div class="lineup-col">
        <div class="lineup-team">${flag(visitante)} ${visitante}</div>
        ${visit11.map(row).join('')}
        ${visitSub.length ? `<div class="lineup-subs">Suplentes: ${visitSub.map(p=>p.jugador).join(', ')}</div>` : ''}
      </div>
    </div>
  </div>`;
}

// ─── En Vivo ──────────────────────────────────────────────────────────────────
let liveInterval = null;

async function renderLive() {
  document.getElementById('section-live').innerHTML = loadingHtml();
  try {
    const matches = await fetchTab('live');
    if (!matches.length) {
      document.getElementById('section-live').innerHTML = emptyHtml('📡', 'No hay partidos en vivo ahora mismo.');
      return;
    }
    document.getElementById('live-badge').style.display = 'inline-flex';
    document.getElementById('section-live').innerHTML = matches.map(buildLiveCard).join('');
  } catch(e) {
    document.getElementById('section-live').innerHTML = errorHtml('Error en vivo: ' + e.message);
  }
}

function buildLiveCard(m) {
  const eventIcons = { goal:'⚽', subst:'🔄', yellowcard:'🟨', yellowredcard:'🟨🟥', redcard:'🟥', var:'📺' };
  const evHtml = (m.eventos||[]).map(ev => {
    const icon = eventIcons[(ev.tipo||'').toLowerCase()] || '•';
    const min  = ev.extra ? `${ev.minuto}+${ev.extra}'` : `${ev.minuto}'`;
    return `<div class="live-event">
      <span class="live-min">${min}</span>
      <span class="live-icon">${icon}</span>
      <span class="live-team">${ev.equipo||''}</span>
      <span class="live-player">${ev.jugador||''}${ev.asistente ? ` <small>(${ev.asistente})</small>` : ''}</span>
    </div>`;
  }).join('') || `<p style="color:var(--text3);font-size:.8rem;padding:.5rem 0">Sin eventos registrados aún</p>`;
  const statsHtml = m.stats ? buildStatsBars(m.local, m.visitante, m.stats) : '';
  return `<div class="match-detail-card live">
    <div class="md-header">
      <span class="live-pill">🔴 EN VIVO</span>
      <span style="color:var(--text3);font-size:.8rem">${m.status||''} · ${m.estadio||''}</span>
    </div>
    <div class="md-score">
      <div class="md-team">${flag(m.local)} <span>${m.local||''}</span></div>
      <div class="md-scorebox">${m.goles_local??'–'} – ${m.goles_visitante??'–'}</div>
      <div class="md-team right">${flag(m.visitante)} <span>${m.visitante||''}</span></div>
    </div>
    <div class="live-events-list">${evHtml}</div>
    ${statsHtml}
  </div>`;
}

// ─── Posiciones ───────────────────────────────────────────────────────────────
async function renderStandings(groupKey) {
  document.getElementById('standings-content').innerHTML = `<div class="skeleton skel-row"></div>`.repeat(4);
  try {
    const grupos = await getData('standings');
    const letras = Object.keys(grupos).sort();
    const tabsEl = document.getElementById('groups-tabs');
    if (!tabsEl.children.length) {
      tabsEl.innerHTML = letras.map(g =>
        `<button class="group-tab${g === state.activeGroup ? ' active' : ''}" onclick="switchGroup('${g}')">Grupo ${g}</button>`
      ).join('');
    }
    const active = groupKey || state.activeGroup;
    const equipo = grupos[active] || grupos[letras[0]] || [];
    document.getElementById('standings-content').innerHTML = `
    <table class="standings-table">
      <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
      <tbody>${equipo.map((t, i) => `
        <tr class="${i < 2 ? 'classify' : ''}" onclick="filterTeamMatches('${t.equipo}')" style="cursor:pointer">
          <td>${i+1}</td>
          <td><div class="team-cell">${flag(t.equipo)} ${t.equipo}</div></td>
          <td>${t.pj}</td><td>${t.pg}</td><td>${t.pe}</td><td>${t.pp}</td>
          <td>${t.gf}</td><td>${t.gc}</td>
          <td style="color:${t.gd>0?'var(--green)':t.gd<0?'var(--red)':'var(--text2)'}">${t.gd>0?'+':''}${t.gd}</td>
          <td class="pts">${t.pts}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p style="font-size:.7rem;color:var(--text3);margin-top:.5rem">🟩 Clasifican a octavos · click en equipo para ver squad</p>`;
  } catch(e) {
    document.getElementById('standings-content').innerHTML = errorHtml('Error tabla: ' + e.message);
  }
}
function switchGroup(g) {
  state.activeGroup = g;
  document.querySelectorAll('.group-tab').forEach(b => b.classList.toggle('active', b.textContent === `Grupo ${g}`));
  renderStandings(g);
}
function filterTeamMatches(equipo) {
  showSection('equipos');
  setTimeout(() => showTeamSquad(equipo), 300);
}

// ─── EV ───────────────────────────────────────────────────────────────────────
async function renderEV() {
  document.getElementById('section-ev').innerHTML = `<div class="skeleton skel-row"></div>`.repeat(5);
  try {
    const opps = await getData('ev');
    if (!opps.length) {
      document.getElementById('section-ev').innerHTML = emptyHtml('🔍', 'Sin oportunidades EV+ por ahora.');
      return;
    }
    document.getElementById('section-ev').innerHTML = `
    <div style="overflow-x:auto">
    <table class="ev-table">
      <thead><tr><th>Partido</th><th>Mercado</th><th>Selección</th><th>Modelo</th><th>Cuota</th><th>EV</th><th>Kelly%</th></tr></thead>
      <tbody>${opps.map(r => `
        <tr>
          <td>${flag(r.local||'')} ${r.local||''} vs ${flag(r.visitante||'')} ${r.visitante||''}<br>
              <small style="color:var(--text3)">${r.fecha||''}</small></td>
          <td><small>${r.mercado||''}</small></td>
          <td><strong>${r.seleccion||''}</strong></td>
          <td>${fmt.pct(Number(r.prob_modelo||0)*100)}</td>
          <td><strong style="color:var(--gold)">${fmt.dec(r.cuota)}</strong></td>
          <td><span class="ev-badge ${evColor(r.ev)}">+${(Number(r.ev||0)*100).toFixed(1)}%</span></td>
          <td style="color:var(--text2)">${(Number(r.kelly||0)*100).toFixed(1)}%</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
    <p class="table-note">EV = (Prob. modelo × cuota) − 1 · Cuotas: Pinnacle / The Odds API</p>`;
  } catch(e) {
    document.getElementById('section-ev').innerHTML = errorHtml('Error EV: ' + e.message);
  }
}

// ─── ELO ──────────────────────────────────────────────────────────────────────
async function renderElo() {
  document.getElementById('section-elo').innerHTML = loadingHtml();
  try {
    const rows  = await getData('elo');
    const top24 = rows.slice(0, 24);
    document.getElementById('section-elo').innerHTML = `
      <div class="elo-chart-wrap"><canvas id="elo-chart"></canvas></div>
      <div class="elo-legend">
        <span class="elo-leg gold">🥇 Líder</span>
        <span class="elo-leg green">Top 4</span>
        <span class="elo-leg blue">Top 8</span>
        <span class="elo-leg grey">Resto</span>
      </div>`;
    new Chart(document.getElementById('elo-chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: top24.map(r => `${flag(r.equipo)} ${r.equipo}`),
        datasets: [{
          label: 'ELO',
          data: top24.map(r => r.elo),
          backgroundColor: top24.map((_,i) => i===0?'#ffd700':i<4?'#00c853':i<8?'#448aff':'#546e7a'),
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend:{display:false}, tooltip:{ callbacks:{ label: c => ` ELO: ${c.parsed.x}` } } },
        scales: {
          x: { grid:{color:'rgba(30,45,77,.5)'}, ticks:{color:'#90a4ae'},
               min: top24.length ? top24[top24.length-1].elo - 100 : 1300 },
          y: { grid:{display:false}, ticks:{color:'#e8eaf6', font:{size:11}} }
        }
      }
    });
  } catch(e) {
    document.getElementById('section-elo').innerHTML = errorHtml('Error ELO: ' + e.message);
  }
}

// ─── Simulación ───────────────────────────────────────────────────────────────
async function renderSimulation() {
  document.getElementById('section-sim').innerHTML = loadingHtml();
  try {
    const grupos = await getData('simulation');
    const letras = Object.keys(grupos).sort();
    if (!letras.length) {
      document.getElementById('section-sim').innerHTML = emptyHtml('🎲', 'Simulación aún no disponible.');
      return;
    }
    document.getElementById('section-sim').innerHTML = `<div class="sim-grid">${letras.map(g => {
      const teams = grupos[g];
      return `<div class="sim-group-card">
        <div class="sim-group-title">Grupo ${g}</div>
        ${teams.map(t => {
          // prob_clasificar stored as decimal 0-1, convert to %
          const p = Number(t.prob_clasificar||0) * (Number(t.prob_clasificar||0) <= 1 ? 100 : 1);
          return `<div class="sim-row">
            <div class="sim-team">${flag(t.equipo)} ${t.equipo}</div>
            <div class="sim-bar-wrap"><div class="sim-bar" style="width:${Math.min(p,100)}%;background:${simBarColor(p)}"></div></div>
            <div class="sim-val" style="color:${simBarColor(p)}">${Math.round(p)}%</div>
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}</div>
    <p class="table-note">Probabilidad de clasificar a octavos · Monte Carlo 2000 simulaciones</p>`;
  } catch(e) {
    document.getElementById('section-sim').innerHTML = errorHtml('Error simulación: ' + e.message);
  }
}

// ─── Rendimiento ──────────────────────────────────────────────────────────────
async function renderPerformance() {
  document.getElementById('section-perf').innerHTML = loadingHtml();
  try {
    const perf = await getData('performance');
    const cal  = perf.calibration  || {};
    const bets = perf.bettingStats || {};
    const roi  = bets.roi      != null ? bets.roi      : null;
    const wr   = bets.win_rate != null ? bets.win_rate : null;
    const cards = [
      { label:'Brier Score', val: cal.brier_score ? Number(cal.brier_score).toFixed(3) : '—', type:'blue',  note:'Calibración · menor = mejor' },
      { label:'Accuracy',    val: cal.accuracy    ? fmt.pct(Number(cal.accuracy)*100)  : '—', type:'green', note:'Predicciones correctas' },
      { label:'Win Rate',    val: wr !== null      ? fmt.pct(wr)                        : '—', type:'gold',  note:`${bets.ganadas||0}/${bets.total||0} apuestas` },
      { label:'ROI',         val: roi !== null     ? fmt.sign(roi)                      : '—', type: roi>=0?'green':'red', note:'Retorno sobre inversión' },
    ];
    document.getElementById('section-perf').innerHTML = `<div class="perf-grid">${cards.map(c =>
      `<div class="perf-card ${c.type}">
        <div class="val">${c.val}</div>
        <div class="label">${c.label}</div>
        <div class="note">${c.note}</div>
      </div>`).join('')}</div>`;
  } catch(e) {
    document.getElementById('section-perf').innerHTML = errorHtml('Error rendimiento: ' + e.message);
  }
}

// ─── Equipos ──────────────────────────────────────────────────────────────────
async function renderTeams() {
  document.getElementById('section-teams').innerHTML = loadingHtml();
  try {
    const teams = await getData('teams', 10*60*1000);
    if (!teams.length) { document.getElementById('section-teams').innerHTML = emptyHtml('🏳️', 'No hay datos de equipos.'); return; }

    // Agrupar
    const grupos = {};
    teams.forEach(t => { const g = t.grupo||'Sin grupo'; if (!grupos[g]) grupos[g]=[]; grupos[g].push(t); });
    const formaColor = r => ({W:'var(--green)',D:'var(--text3)',L:'var(--red)'})[r]||'var(--text3)';

    document.getElementById('section-teams').innerHTML = Object.keys(grupos).sort().map(g => `
      <div style="margin-bottom:2rem">
        <h3 class="section-title">Grupo ${g}</h3>
        <div class="teams-grid">
          ${grupos[g].map(t => `
            <div class="team-card" onclick="showTeamSquad('${t.nombre}')" style="cursor:pointer">
              <div class="team-card-top">
                <span class="team-flag-big">${flag(t.nombre)}</span>
                <div class="team-card-info">
                  <div class="team-name-big">${t.nombre}</div>
                  <div class="team-card-sub">${t.confederacion||''} ${t.entrenador ? `· ${t.entrenador}` : ''}</div>
                </div>
                ${t.pos ? `<div class="team-pos">#${t.pos} <small>${t.pts}pts</small></div>` : ''}
              </div>
              ${t.elo ? `<div class="team-elo">ELO <strong>${Math.round(t.elo)}</strong></div>` : ''}
              ${t.forma ? `<div class="team-forma">${t.forma.split('').slice(-5).map(r =>
                `<span class="forma-dot" style="background:${formaColor(r)}">${r}</span>`
              ).join('')}</div>` : ''}
              <div id="squad-${t.nombre.replace(/\s/g,'_')}" class="squad-inline" style="display:none"></div>
            </div>`).join('')}
        </div>
      </div>`).join('');
  } catch(e) {
    document.getElementById('section-teams').innerHTML = errorHtml('Error equipos: ' + e.message);
  }
}

async function showTeamSquad(nombre) {
  const safeId = nombre.replace(/\s/g, '_');
  const el = document.getElementById(`squad-${safeId}`);
  if (!el) return;
  if (el.style.display !== 'none') { el.style.display = 'none'; return; }
  el.style.display = '';
  if (el.dataset.loaded) return;
  el.innerHTML = `<div class="loading-center" style="padding:.5rem"><div class="spinner" style="width:20px;height:20px"></div></div>`;
  try {
    const squad = await getData('squad', 15*60*1000, { equipo: nombre });
    if (!squad.jugadores || !squad.jugadores.length) { el.innerHTML = '<p style="color:var(--text3);font-size:.8rem;padding:.5rem 0">Sin datos de plantel.</p>'; return; }
    el.dataset.loaded = '1';
    const byPos = { Goalkeeper:[], Defender:[], Midfielder:[], Forward:[] };
    const posLabel = { Goalkeeper:'Porteros 🧤', Defender:'Defensas 🛡️', Midfielder:'Medios ⚙️', Forward:'Delanteros ⚡' };
    squad.jugadores.forEach(p => {
      const pos = p.posicion || 'Midfielder';
      const k = Object.keys(byPos).find(k => pos.toLowerCase().includes(k.toLowerCase())) || 'Midfielder';
      byPos[k].push(p);
    });
    el.innerHTML = `<div class="squad-grid">${Object.entries(byPos).filter(([,v])=>v.length).map(([pos,players]) => `
      <div class="squad-pos-group">
        <div class="squad-pos-label">${posLabel[pos]||pos}</div>
        <div class="squad-players">${players.map(p => `
          <div class="squad-player">
            ${p.foto ? `<img src="${p.foto}" class="squad-photo" onerror="this.style.display='none'">` : `<div class="squad-photo-ph">${(p.nombre||'?').charAt(0)}</div>`}
            <div class="squad-player-info">
              <span class="squad-player-name">${p.nombre||''}</span>
              <span class="squad-player-meta">${p.edad ? p.edad+'a' : ''} ${p.goles>0?`· ⚽${p.goles}`:''}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>`).join('')}</div>`;
  } catch(e) {
    el.innerHTML = errorHtml('Error cargando plantel');
  }
}

// ─── Jugadores ────────────────────────────────────────────────────────────────
async function renderPlayers() {
  document.getElementById('section-players').innerHTML = loadingHtml();
  try {
    const players = await getData('players', 10*60*1000);
    if (!players.length) {
      document.getElementById('section-players').innerHTML = emptyHtml('👤', 'No hay estadísticas de jugadores aún.');
      return;
    }
    const topScorers  = players.filter(p => p.goles > 0);
    const withAssists = players.filter(p => p.goles === 0 && p.asistencias > 0);

    const playerRow = (p, i, showRank) => {
      const photoHtml = p.foto
        ? `<img src="${p.foto}" alt="${p.jugador}" class="player-photo" onerror="this.style.display='none'">`
        : `<div class="player-photo-placeholder">${p.jugador.charAt(0)}</div>`;
      const posTag = p.posicion ? `<span class="player-pos">${p.posicion.substring(0,3).toUpperCase()}</span>` : '';
      return `<tr>
        ${showRank ? `<td class="rank-cell" style="color:var(--${i<3?'gold':'text3'})">${i+1}</td>` : '<td></td>'}
        <td><div class="player-cell">
          ${photoHtml}
          <div class="player-info"><strong>${p.jugador}</strong>${posTag}</div>
        </div></td>
        <td>${flag(p.equipo)} <span class="hide-xs">${p.equipo}</span></td>
        <td><strong style="color:var(--gold)">${p.goles}</strong></td>
        <td>${p.asistencias}</td>
        <td style="color:var(--text2)">${p.partidos}</td>
        <td style="color:var(--text3)">${p.minutos?p.minutos+"'":'–'}</td>
        <td>${p.amarillas||0}</td><td>${p.rojas||0}</td>
      </tr>`;
    };

    const thead = `<thead><tr>
      <th>#</th><th>Jugador</th><th>Equipo</th>
      <th title="Goles">⚽</th><th title="Asistencias">🎯</th>
      <th title="PJ">PJ</th><th title="Min">Min</th>
      <th title="Amarillas">🟨</th><th title="Rojas">🟥</th>
    </tr></thead>`;

    let html = `<div style="overflow-x:auto"><table class="standings-table players-table">${thead}<tbody>`;
    if (topScorers.length) {
      html += `<tr class="table-section-header"><td colspan="9">⚽ Goleadores</td></tr>`;
      html += topScorers.map((p,i) => playerRow(p,i,true)).join('');
    }
    if (withAssists.length) {
      html += `<tr class="table-section-header"><td colspan="9">🎯 Asistidores</td></tr>`;
      html += withAssists.map((p,i) => playerRow(p,i,false)).join('');
    }
    html += `</tbody></table></div>`;
    document.getElementById('section-players').innerHTML = html;
  } catch(e) {
    document.getElementById('section-players').innerHTML = errorHtml('Error jugadores: ' + e.message);
  }
}

// ─── Stats de equipo ──────────────────────────────────────────────────────────
async function renderStats() {
  document.getElementById('section-stats').innerHTML = loadingHtml();
  try {
    const stats = await getData('stats', 10*60*1000);
    if (!stats.length) { document.getElementById('section-stats').innerHTML = emptyHtml('📈', 'Sin estadísticas acumuladas aún.'); return; }
    document.getElementById('section-stats').innerHTML = `
    <div style="overflow-x:auto">
    <table class="standings-table stats-table">
      <thead><tr>
        <th>Equipo</th><th title="PJ">PJ</th><th title="Victorias">W</th><th title="Empates">D</th><th title="Derrotas">L</th>
        <th title="Goles">GF</th><th title="Goles en contra">GA</th>
        <th title="Posesión promedio">Pos%</th><th title="Tiros">Tiros</th>
        <th title="Al arco">Arco</th><th title="Corners">Corn.</th>
        <th title="Amarillas">🟨</th>
      </tr></thead>
      <tbody>${stats.map(t => `
        <tr onclick="showTeamSquad('${t.equipo}');showSection('equipos')" style="cursor:pointer">
          <td><div class="team-cell">${flag(t.equipo)} <strong>${t.equipo}</strong></div></td>
          <td>${t.pj||0}</td>
          <td style="color:var(--green)">${t.pg||0}</td>
          <td style="color:var(--text3)">${t.pe||0}</td>
          <td style="color:var(--red)">${t.pp||0}</td>
          <td><strong style="color:var(--gold)">${t.gf||0}</strong></td>
          <td style="color:var(--text2)">${t.ga||0}</td>
          <td>${t.posesion_avg ? Number(t.posesion_avg).toFixed(1)+'%' : '–'}</td>
          <td>${t.tiros||0}</td>
          <td>${t.tiros_arco||0}</td>
          <td>${t.corners||0}</td>
          <td>${t.amarillas||0}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
    <p class="table-note">Click en equipo para ver plantel · Acumulado del torneo</p>`;
  } catch(e) {
    document.getElementById('section-stats').innerHTML = errorHtml('Error stats: ' + e.message);
  }
}

// ─── Noticias ─────────────────────────────────────────────────────────────────
async function renderNoticias() {
  document.getElementById('section-noticias').innerHTML = loadingHtml();
  try {
    const noticias = await getData('noticias', 5*60*1000);
    if (!noticias.length) { document.getElementById('section-noticias').innerHTML = emptyHtml('📰', 'Sin noticias recientes.'); return; }
    document.getElementById('section-noticias').innerHTML = `
      <div class="news-grid">${noticias.map(n => `
        <div class="news-card${n.url ? ' clickable' : ''}" ${n.url ? `onclick="window.open('${n.url}','_blank')"` : ''}>
          <div class="news-meta">
            ${n.equipo ? `<span class="news-team">${flag(n.equipo)} ${n.equipo}</span>` : ''}
            <span class="news-date">${fmtDate(n.fecha)||''}</span>
            ${n.fuente ? `<span class="news-source">${n.fuente}</span>` : ''}
          </div>
          <h3 class="news-title">${n.titulo||''}</h3>
          ${n.resumen ? `<p class="news-summary">${n.resumen}</p>` : ''}
          ${n.url ? `<span class="news-link">Leer más →</span>` : ''}
        </div>`).join('')}
      </div>`;
  } catch(e) {
    document.getElementById('section-noticias').innerHTML = errorHtml('Error noticias: ' + e.message);
  }
}

// ─── Navegación ───────────────────────────────────────────────────────────────
let liveRefreshInterval = null;

const renderers = {
  hoy:         renderHoy,
  live:        renderLive,
  tabla:       renderStandings,
  equipos:     renderTeams,
  jugadores:   renderPlayers,
  stats:       renderStats,
  noticias:    renderNoticias,
  ev:          renderEV,
  elo:         renderElo,
  simulacion:  renderSimulation,
  rendimiento: renderPerformance,
};

function showSection(id) {
  state.section = id;
  document.querySelectorAll('.section-panel').forEach(s => s.style.display = s.id === `panel-${id}` ? '' : 'none');
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.dataset.section === id));

  if (liveRefreshInterval) { clearInterval(liveRefreshInterval); liveRefreshInterval = null; }
  if (id === 'live') {
    liveRefreshInterval = setInterval(() => { delete cache['live']; renderLive(); }, 30000);
  }
  if (renderers[id]) renderers[id]();
}

// ─── Login ────────────────────────────────────────────────────────────────────
function showLogin(errorMsg) {
  document.getElementById('app-content').style.display   = 'none';
  document.getElementById('config-banner').style.display = 'none';
  document.getElementById('login-screen').style.display  = '';
  const errEl = document.getElementById('login-error');
  errEl.textContent   = errorMsg || '';
  errEl.style.display = errorMsg ? '' : 'none';
}

function initApp() {
  document.getElementById('login-screen').style.display  = 'none';
  document.getElementById('config-banner').style.display = 'none';
  document.getElementById('app-content').style.display   = '';
  const tnEl = document.getElementById('torneo-nombre');
  const teEl = document.getElementById('torneo-emoji');
  if (tnEl) tnEl.textContent = TORNEO_NOMBRE;
  if (teEl) teEl.textContent = TORNEO_EMOJI;

  document.querySelectorAll('nav a').forEach(a =>
    a.addEventListener('click', e => { e.preventDefault(); showSection(a.dataset.section); })
  );
  showSection('hoy');

  setInterval(() => {
    ['hoy','dashboard','ev'].forEach(t => delete cache[t]);
    if (renderers[state.section]) renderers[state.section]();
  }, 5*60*1000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!WORKER_URL) {
    document.getElementById('config-banner').style.display = '';
    document.getElementById('app-content').style.display   = 'none';
    document.getElementById('login-screen').style.display  = 'none';
    return;
  }
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const key = document.getElementById('login-key').value.trim();
    saveKey(key);
    try {
      await fetchTab('dashboard');
      initApp();
    } catch(err) {
      if (err.message !== 'Unauthorized') initApp();
    }
  });
  if (getSavedKey()) {
    fetchTab('dashboard')
      .then(() => initApp())
      .catch(err => err.message === 'Unauthorized' ? showLogin() : initApp());
  } else {
    showLogin();
  }
});
