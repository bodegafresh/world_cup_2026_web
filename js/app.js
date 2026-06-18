// ─── Flags ───────────────────────────────────────────────────────────────────
const FLAGS = {
  'Argentina':'🇦🇷','Brasil':'🇧🇷','Francia':'🇫🇷','Alemania':'🇩🇪','España':'🇪🇸',
  'Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Países Bajos':'🇳🇱','Netherlands':'🇳🇱',
  'Bélgica':'🇧🇪','Uruguay':'🇺🇾','Colombia':'🇨🇴','México':'🇲🇽',
  'USA':'🇺🇸','Estados Unidos':'🇺🇸','Canadá':'🇨🇦','Canada':'🇨🇦',
  'Marruecos':'🇲🇦','Senegal':'🇸🇳','Japón':'🇯🇵','Japan':'🇯🇵','Corea del Sur':'🇰🇷',
  'Australia':'🇦🇺','Ecuador':'🇪🇨','Chile':'🇨🇱','Perú':'🇵🇪',
  'Venezuela':'🇻🇪','Bolivia':'🇧🇴','Paraguay':'🇵🇾','Costa Rica':'🇨🇷',
  'Panamá':'🇵🇦','Honduras':'🇭🇳','Jamaica':'🇯🇲','Qatar':'🇶🇦','Catar':'🇶🇦',
  'EE.UU.':'🇺🇸','Haití':'🇭🇹','Haiti':'🇭🇹','Curazao':'🇨🇼','Curaçao':'🇨🇼',
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
  'Mali':'🇲🇱','Angola':'🇦🇴','Tanzania':'🇹🇿','Kenia':'🇰🇪','Cabo Verde':'🇨🇻','Cape Verde':'🇨🇻',
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

function evColor(ev, sospechoso, outlier) {
  if (outlier)    return 'outlier';
  if (sospechoso) return 'sospechoso';
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
  const container = document.getElementById('section-live');
  // Solo mostrar loading si no hay contenido previo (primera carga)
  if (!container.querySelector('.match-detail-card')) {
    container.innerHTML = loadingHtml();
  }
  try {
    const matches = await fetchTab('live');
    if (!matches.length) {
      // Si había contenido y ahora no hay partidos, actualizar silenciosamente
      container.innerHTML = emptyHtml('📡', 'No hay partidos en vivo ahora mismo.');
      document.getElementById('live-badge').style.display = 'none';
      return;
    }
    document.getElementById('live-badge').style.display = 'inline-flex';
    // Guardar qué alineaciones estaban abiertas antes de reemplazar el HTML
    const openLineups = new Set(
      [...document.querySelectorAll('[id^="lineup-body-"]')]
        .filter(el => el.style.display !== 'none')
        .map(el => el.id.replace('lineup-body-', ''))
    );
    // Actualizar sin flash: fade out → update → fade in
    container.style.transition = 'opacity 0.25s';
    container.style.opacity    = '0.4';
    requestAnimationFrame(() => {
      container.innerHTML    = matches.map(buildLiveCard).join('');
      container.style.opacity = '1';
      // Restaurar alineaciones que estaban abiertas
      openLineups.forEach(mk => { if (mk) toggleLiveLineup(mk); });
    });
  } catch(e) {
    if (!container.querySelector('.match-detail-card')) {
      container.innerHTML = errorHtml('Error en vivo: ' + e.message);
    }
  }
}

function buildLiveCard(m) {
  const eventIcons = { goal:'⚽', subst:'🔄', yellowcard:'🟨', yellowredcard:'🟨🟥', redcard:'🟥', var:'📺' };
  const eventos = m.eventos || [];
  const evHtml = eventos.length ? eventos.map(ev => {
    const icon  = eventIcons[(ev.tipo||'').toLowerCase()] || '•';
    const min   = ev.extra ? `${ev.minuto}+${ev.extra}'` : `${ev.minuto ? ev.minuto+"'" : ''}`;
    const isLocal = (ev.equipo||'') === m.local;
    const jugador = ev.jugador ? `<strong>${ev.jugador}</strong>` : '';
    const asistencia = ev.asistente ? ` <span style="color:var(--text3);font-size:.78rem">(🎯 ${ev.asistente})</span>` : '';
    return `<div class="live-event" style="justify-content:${isLocal ? 'flex-start' : 'flex-end'}; text-align:${isLocal ? 'left' : 'right'}">
      ${isLocal
        ? `<span class="live-min">${min}</span><span class="live-icon">${icon}</span><span class="live-player">${jugador}${asistencia}</span>`
        : `<span class="live-player">${jugador}${asistencia}</span><span class="live-icon">${icon}</span><span class="live-min">${min}</span>`}
    </div>`;
  }).join('') : `<p style="color:var(--text3);font-size:.8rem;padding:.5rem 0;text-align:center">⏳ Sin eventos aún</p>`;
  const statsHtml = m.stats ? buildStatsBars(m.local, m.visitante, m.stats) : '';

  // Venue + clima
  const horaLocal = m.hora_local ? ` · ⏰ ${m.hora_local} local` : '';
  const venueInfo = [m.estadio, m.ciudad].filter(Boolean).join(', ');
  let climaInfo = '';
  if (m.clima) {
    const c = m.clima;
    const condIcon = {'DESPEJADO':'☀️','NUBLADO':'☁️','LLUVIA':'🌧️','TORMENTA':'⛈️','NIEBLA':'🌫️','VIENTO':'💨'}[(c.condicion||'').toUpperCase()]||'🌡️';
    const parts = [];
    if (c.temperatura != null) parts.push(`${c.temperatura}°C`);
    if (c.humedad     != null) parts.push(`💧${c.humedad}%`);
    if (c.viento      != null) parts.push(`💨${c.viento}km/h`);
    if (parts.length) climaInfo = `<div class="match-clima" style="margin:.3rem 0">${condIcon} ${parts.join(' · ')}</div>`;
  }

  // Probabilities
  let probHtml = '';
  if (m.poisson) {
    const p = m.poisson;
    probHtml = `<div class="live-probs">
      <span class="lp-label">${m.local}</span>
      <div class="prob-bar" style="margin:0 .5rem;flex:1">
        <div class="ph" style="width:${p.prob_home}%"></div>
        <div class="pd" style="width:${p.prob_draw}%"></div>
        <div class="pa" style="width:${p.prob_away}%"></div>
      </div>
      <span class="lp-label">${m.visitante}</span>
    </div>
    <div class="live-probs-nums">
      <span class="ph-l">${p.prob_home}%</span>
      <span style="color:var(--text3)">Empate ${p.prob_draw}%</span>
      <span class="pa-l">${p.prob_away}%</span>
    </div>`;
  }

  // Alineaciones con visualización de cancha
  const mk = m.match_key || '';
  const alin = m.alineaciones || [];
  let lineupHtml = '';
  if (alin.length) {
    const titularesLocal     = alin.filter(a => a.equipo === m.local     && a.rol === 'titular');
    const titularesVisitante = alin.filter(a => a.equipo === m.visitante && a.rol === 'titular');
    const supLocal     = alin.filter(a => a.equipo === m.local     && a.rol !== 'titular');
    const supVisitante = alin.filter(a => a.equipo === m.visitante && a.rol !== 'titular');

    const fieldSvg = buildLineupField(m.local, m.visitante, titularesLocal, titularesVisitante, m.formacion_local, m.formacion_visitante);
    const subHtml  = (subs, equipo) => subs.length ? `<div class="lineup-subs">
      <span style="color:var(--text3);font-size:.7rem">Suplentes:</span>
      ${subs.slice(0,7).map(p=>`<span class="lineup-sub-name">${p.numero ? `${p.numero}.` : ''}${p.jugador}</span>`).join('')}
    </div>` : '';

    lineupHtml = `<div class="lineup-section">
      <div class="detail-block-title" onclick="toggleLiveLineup('${mk}')" style="cursor:pointer">
        📋 Alineaciones <span id="lineup-arrow-${mk}">▶</span>
      </div>
      <div id="lineup-body-${mk}" style="display:none">
        ${fieldSvg}
        <div class="lineups-grid" style="margin-top:.75rem">
          <div class="lineup-col">
            <div style="font-weight:600;margin-bottom:.4rem">${flag(m.local)} ${m.local}</div>
            ${titularesLocal.map(p=>`<div class="lineup-player"><span class="lineup-num">${p.numero||''}</span>${p.jugador}</div>`).join('')}
            ${subHtml(supLocal)}
          </div>
          <div class="lineup-col">
            <div style="font-weight:600;margin-bottom:.4rem">${flag(m.visitante)} ${m.visitante}</div>
            ${titularesVisitante.map(p=>`<div class="lineup-player"><span class="lineup-num">${p.numero||''}</span>${p.jugador}</div>`).join('')}
            ${subHtml(supVisitante)}
          </div>
        </div>
      </div>
    </div>`;
  }

  // Árbitro
  let arbHtml = '';
  if (m.arbitro && m.arbitro.nombre) {
    const ar = m.arbitro;
    const tendColor = {'ESTRICTO':'var(--red)','PERMISIVO':'var(--green)','NORMAL':'var(--text2)'}[ar.tendencia]||'var(--text2)';
    arbHtml = `<div class="live-arbitro">
      👨‍⚖️ <strong>${ar.nombre}</strong>
      <span style="color:var(--text3)">${ar.nacionalidad ? `(${ar.nacionalidad})` : ''}</span>
      ${ar.amarillas_pp != null ? `· 🟨 ${ar.amarillas_pp}/pj` : ''}
      ${ar.tendencia ? `<span style="color:${tendColor};font-size:.72rem;font-weight:600">${ar.tendencia}</span>` : ''}
    </div>`;
  }

  return `<div class="match-detail-card live">
    <div class="md-header">
      <span class="live-pill">🔴 EN VIVO ${m.minuto||m.status||''}</span>
      <span style="color:var(--text3);font-size:.8rem">${venueInfo}${horaLocal}</span>
    </div>
    ${climaInfo}
    ${arbHtml}
    <div class="md-score">
      <div class="md-team">${flag(m.local)} <span>${m.local||''}</span></div>
      <div class="md-scorebox">${m.goles_local !== null ? m.goles_local : '–'} – ${m.goles_visitante !== null ? m.goles_visitante : '–'}</div>
      <div class="md-team right">${flag(m.visitante)} <span>${m.visitante||''}</span></div>
    </div>
    ${probHtml}
    <div class="live-events-list">${evHtml}</div>
    ${statsHtml}
    ${lineupHtml}
  </div>`;
}

function toggleLiveLineup(mk) {
  const body  = document.getElementById(`lineup-body-${mk}`);
  const arrow = document.getElementById(`lineup-arrow-${mk}`);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display  = open ? 'none' : '';
  if (arrow) arrow.textContent = open ? '▶' : '▼';
}

function buildLineupField(localTeam, visitanteTeam, titLocal, titVisitante, formLocal, formVisitante) {
  if (!titLocal.length && !titVisitante.length) return '';
  const W = 320, H = 420;

  // Clasifica un jugador en GK/DF/MF/FW según abreviatura ESPN o nombre de posición
  const posGroup = (p) => {
    const pos = (p.posicion || '').toUpperCase().trim();
    if (!pos || pos === '') return 'UNK';
    const GK = new Set(['GK','POR','G']);
    const DF = new Set(['CB','LB','RB','LWB','RWB','SW','DC','DL','DR','WB','FB','D']);
    const MF = new Set(['CM','CDM','CAM','LM','RM','DM','AM','MC','MCD','MCO','MI','MD','M']);
    const FW = new Set(['LW','RW','ST','CF','SS','FW','CA','SD','EI','ED','F']);
    if (GK.has(pos) || pos.includes('GOALKEEPER')) return 'GK';
    if (DF.has(pos) || pos.includes('DEFENDER') || pos.includes('BACK')) return 'DF';
    if (FW.has(pos) || pos.includes('FORWARD') || pos === 'ATTACKER') return 'FW';
    if (MF.has(pos) || pos.includes('MIDFIELDER')) return 'MF';
    return 'UNK';
  };

  // Agrupa jugadores según la formación string "4-4-1-1" o por posición si no hay formación
  const groupByFormation = (players, formation) => {
    // Si hay grid de API-Football, usarlo
    if (players.some(p => p.grid)) {
      const rows = {};
      players.forEach(p => {
        const row = String(p.grid || '').split('-')[0] || '5';
        if (!rows[row]) rows[row] = [];
        rows[row].push(p);
      });
      return Object.keys(rows).sort().map(k => rows[k]);
    }

    if (formation) {
      // Parsear "4-4-1-1" → [4,4,1,1]
      const nums = formation.split('-').map(Number).filter(n => n > 0);
      if (nums.length >= 2) {
        // Ordenar: GK primero, luego resto por grupo DF→MF→FW, desconocidos al final
        const gks  = players.filter(p => posGroup(p) === 'GK');
        const defs = players.filter(p => posGroup(p) === 'DF');
        const mids = players.filter(p => posGroup(p) === 'MF');
        const fwds = players.filter(p => posGroup(p) === 'FW');
        const unk  = players.filter(p => posGroup(p) === 'UNK');
        // Si no se puede clasificar suficientes, distribuir por formación directo
        const ordered = [...gks, ...defs, ...mids, ...fwds, ...unk];
        const rows = [];
        // GK siempre primer row (1 jugador)
        if (ordered.length > 0) rows.push([ordered[0]]);
        let idx = 1;
        nums.forEach(n => {
          const slice = ordered.slice(idx, idx + n);
          if (slice.length) rows.push(slice);
          idx += n;
        });
        // Sobrantes (si hay más de 11)
        if (idx < ordered.length) rows.push(ordered.slice(idx));
        return rows.filter(r => r.length);
      }
    }

    // Sin formación: agrupar por posición
    const gks  = players.filter(p => posGroup(p) === 'GK');
    const defs = players.filter(p => posGroup(p) === 'DF');
    const mids = players.filter(p => posGroup(p) === 'MF');
    const fwds = players.filter(p => posGroup(p) === 'FW');
    const unk  = players.filter(p => posGroup(p) === 'UNK');
    const lines = [gks, defs, mids, fwds, unk].filter(g => g.length);
    if (!lines.length) {
      // Sin info de posición: 1 + mitad + resto
      const all = [...players];
      const out = [[all.shift()]];
      const half = Math.ceil(all.length / 2);
      out.push(all.splice(0, half));
      if (all.length) out.push(all);
      return out;
    }
    return lines;
  };

  const drawTeam = (players, yStart, yEnd, flip, formation) => {
    let lines = groupByFormation(players, formation);
    if (flip) lines = [...lines].reverse(); // GK al fondo para visitante
    if (!lines.length) return '';
    let svg = '';
    lines.forEach((row, li) => {
      const y = yStart + (yEnd - yStart) * (li + 0.5) / lines.length;
      row.forEach((p, pi) => {
        const x = W * (pi + 1) / (row.length + 1);
        const name = (p.jugador || '').split(' ').pop().substring(0, 10);
        svg += `<circle cx="${x}" cy="${y}" r="11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>`;
        svg += `<text x="${x}" y="${y+1}" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="white" font-weight="bold">${p.numero||''}</text>`;
        svg += `<text x="${x}" y="${y+16}" text-anchor="middle" font-size="6.5" fill="rgba(255,255,255,0.85)">${name}</text>`;
      });
    });
    return svg;
  };

  const fmtLocal = formLocal    ? ` (${formLocal})`    : '';
  const fmtVisit = formVisitante ? ` (${formVisitante})` : '';

  const svgContent = `
    <rect width="${W}" height="${H}" rx="8" fill="#2d5a1b"/>
    <rect x="0" y="${H/2-1}" width="${W}" height="2" fill="rgba(255,255,255,0.3)"/>
    <rect x="${W*0.15}" y="${H*0.04}" width="${W*0.7}" height="${H*0.15}" rx="2" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <rect x="${W*0.15}" y="${H*0.81}" width="${W*0.7}" height="${H*0.15}" rx="2" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <circle cx="${W/2}" cy="${H/2}" r="40" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <text x="${W/2}" y="12" text-anchor="middle" font-size="8.5" fill="rgba(255,255,255,0.75)">${localTeam}${fmtLocal}</text>
    <text x="${W/2}" y="${H-4}" text-anchor="middle" font-size="8.5" fill="rgba(255,255,255,0.75)">${visitanteTeam}${fmtVisit}</text>
    ${drawTeam(titLocal, 20, H/2 - 10, false, formLocal)}
    ${drawTeam(titVisitante, H/2 + 10, H - 20, true, formVisitante)}
  `;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;display:block;margin:.5rem auto;border-radius:8px">${svgContent}</svg>`;
}

// ─── Posiciones ───────────────────────────────────────────────────────────────
const KNOCKOUT_KEYS = ['octavos','cuartos','semifinal','semifinales','final','tercerpuesto','r16','qf','sf','3rd'];
const isKnockout = k => KNOCKOUT_KEYS.some(p => k.toLowerCase().replace(/\s/g,'').includes(p));
const KNOCKOUT_LABEL = {
  'octavos':'Octavos de Final','cuartos':'Cuartos de Final',
  'semifinal':'Semifinales','semifinales':'Semifinales',
  'final':'Gran Final','tercerpuesto':'Tercer Puesto',
  'r16':'Octavos de Final','qf':'Cuartos de Final','sf':'Semifinales'
};
function knockoutLabel(k) {
  const kn = k.toLowerCase().replace(/\s/g,'');
  const match = KNOCKOUT_KEYS.find(p => kn.includes(p));
  return KNOCKOUT_LABEL[match] || k;
}

async function renderStandings(groupKey) {
  document.getElementById('standings-content').innerHTML = `<div class="skeleton skel-row"></div>`.repeat(4);
  try {
    const grupos = await getData('standings');
    const letras = Object.keys(grupos).sort();

    // Separar grupos de fase de eliminación
    const groupPhase    = letras.filter(g => !isKnockout(g));
    const knockoutPhase = letras.filter(g =>  isKnockout(g));

    const tabsEl = document.getElementById('groups-tabs');
    // Rebuild tabs if needed (detect stale state)
    const builtFor = tabsEl.dataset.builtFor || '';
    if (builtFor !== letras.join(',')) {
      tabsEl.dataset.builtFor = letras.join(',');
      const gpTabs = groupPhase.map(g =>
        `<button class="group-tab${g === state.activeGroup ? ' active' : ''}" onclick="switchGroup('${g}')">${g}</button>`
      ).join('');
      const koTabs = knockoutPhase.length
        ? `<button class="group-tab ko-tab" onclick="switchGroup('__knockout__')">🏆 Eliminatorias</button>` : '';
      tabsEl.innerHTML = gpTabs + koTabs;
    }

    const active = groupKey || state.activeGroup;

    // ── Vista eliminatorias ──────────────────────────────────────────────────
    if (active === '__knockout__' || (knockoutPhase.length && groupPhase.length === 0)) {
      const sections = knockoutPhase.map(k => {
        const partidos = grupos[k] || [];
        const matches  = partidos.filter(p => p.match_key || p.local);
        return `<div class="ko-section">
          <h4 class="ko-round-title">${knockoutLabel(k)}</h4>
          <div class="ko-matches">${matches.map(m => `
            <div class="ko-match">
              <div class="ko-team ${m.clasificado || m.pts > 0 ? 'winner' : ''}">
                ${flag(m.equipo||m.local||'')} ${m.equipo||m.local||''}
                ${m.pts != null ? `<span class="ko-pts">${m.pts}pts</span>` : ''}
              </div>
              ${m.visitante ? `<div class="ko-vs">vs</div>
              <div class="ko-team">
                ${flag(m.visitante)} ${m.visitante}
              </div>` : ''}
              ${(m.goles_local != null && m.goles_visitante != null)
                ? `<div class="ko-score">${m.goles_local} – ${m.goles_visitante}</div>` : ''}
            </div>`).join('')}
          </div>
        </div>`;
      }).join('');
      document.getElementById('standings-content').innerHTML = sections ||
        `<p style="color:var(--text3);padding:1rem">La fase eliminatoria comenzará cuando terminen los grupos.</p>`;
      return;
    }

    // ── Vista grupos ─────────────────────────────────────────────────────────
    const equipo = grupos[active] || grupos[groupPhase[0]] || [];
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
  document.querySelectorAll('.group-tab').forEach(b => {
    b.classList.toggle('active',
      b.textContent.trim() === g ||
      (g === '__knockout__' && b.classList.contains('ko-tab'))
    );
  });
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
    const [opps, preds] = await Promise.all([
      getData('ev'),
      getData('predictions').catch(() => [])
    ]);

    let html = '';

    if (opps.length) {
      html += `
      <h3 class="section-title" style="margin-bottom:.75rem">💡 Oportunidades EV+</h3>
      <div style="overflow-x:auto">
      <table class="ev-table">
        <thead><tr>
          <th>Partido</th>
          <th>Mercado</th>
          <th>Selección</th>
          <th title="Probabilidad calculada por el modelo Poisson/ELO.">Modelo ℹ️</th>
          <th title="Cuota justa = 1 / Prob.modelo. Cuota mercado = lo que paga la casa. Si mercado > justa, hay value.">Cuota justa → Mercado ℹ️</th>
          <th title="Edge = Prob.modelo − Prob.implícita. Mide la ventaja real sobre el mercado.">Edge ℹ️</th>
          <th title="Expected Value = (Prob.modelo × Cuota) − 1. +10% = por cada $100 apostados se espera ganar $10.">EV ℹ️</th>
          <th title="Fracción Kelly / 4 (conservador). Porcentaje del bankroll sugerido.">Kelly% ℹ️</th>
        </tr></thead>
        <tbody>${opps.map(r => {
          const rowClass = r.outlier ? 'ev-row-outlier' : (r.sospechoso ? 'ev-row-sospechoso' : '');
          const warningIcon = r.outlier
            ? ' <span title="OUTLIER: EV >30% — mercado ilíquido o mapeo erróneo. No apostar sin confirmar en 2+ casas.">🚨</span>'
            : (r.sospechoso ? ' <span title="Sospechoso: EV 25-30% — verificar cuota en otra casa.">⚠️</span>' : '');
          const cuotaJustaStr = r.cuota_justa ? `<small style="color:var(--text3)">${fmt.dec(r.cuota_justa)}</small> → ` : '';
          const edgeStr = r.edge ? `<span style="color:${Number(r.edge)>0?'var(--green2)':'var(--red)'}">${(Number(r.edge)*100).toFixed(1)}pp</span>` : '—';
          const confColor = r.confianza === 'PELIGRO' ? 'var(--red)' : r.confianza === 'ALTA' ? 'var(--green2)' : r.confianza === 'MEDIA' ? 'var(--gold)' : 'var(--text3)';
          return `
          <tr${rowClass ? ` class="${rowClass}"` : ''}>
            <td>${flag(r.local||'')} ${r.local||''} vs ${flag(r.visitante||'')} ${r.visitante||''}<br>
                <small style="color:var(--text3)">${r.fecha||''}</small></td>
            <td><small>${r.mercado||''}</small></td>
            <td><strong>${r.seleccion||''}</strong>${warningIcon}</td>
            <td data-label="Modelo">${fmt.pct(Number(r.prob_modelo||0)*100)}</td>
            <td data-label="Cuota justa">${cuotaJustaStr}<strong style="color:var(--gold)">${fmt.dec(r.cuota)}</strong></td>
            <td data-label="Edge">${edgeStr}</td>
            <td data-label="EV"><span class="ev-badge ${evColor(r.ev, r.sospechoso, r.outlier)}">+${(Number(r.ev||0)*100).toFixed(1)}%</span></td>
            <td data-label="Kelly%"><span style="color:var(--text2)">${(Number(r.kelly||0)*100).toFixed(1)}%</span>${r.confianza ? `<br><small style="color:${confColor}">${r.confianza}</small>` : ''}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
      </div>
      <p class="table-note">EV = (Prob. modelo × cuota) − 1 · Edge = Prob.modelo − (1/cuota) · Cuotas: The Odds API</p>`;
    } else {
      html += `<div class="ev-no-odds">⚠️ Sin cuotas de mercado cargadas — activa The Odds API o corre <code>cronDailySetup</code> para calcular EV.</div>`;
    }

    // Análisis Poisson para próximos partidos (siempre visible)
    const upcoming = preds.filter(p => p.poisson || p.elo);
    if (upcoming.length) {
      html += `<h3 class="section-title" style="margin-top:1.5rem;margin-bottom:.75rem">🎯 Análisis del Modelo — Próximos Partidos</h3>
      <div class="poisson-cards">`;
      upcoming.forEach(p => {
        const px = p.poisson || {};
        const el = p.elo || {};
        const ph = Number(px.prob_home || el.prob_home || 0);
        const pd = Number(px.prob_draw || el.prob_draw || 0);
        const pa = Number(px.prob_away || el.prob_away || 0);
        const lH = Number(px.lambda_h || 0);
        const lA = Number(px.lambda_a || 0);
        const o25 = Number(px.over25 || 0);
        const btts = Number(px.btts || 0);
        html += `<div class="poisson-card">
          <div class="pc-header">
            <span class="pc-teams">${flag(p.local)} ${p.local} vs ${flag(p.visitante)} ${p.visitante}</span>
            <span class="pc-meta">${p.hora||''} ${p.grupo ? `· ${p.grupo}` : ''}</span>
          </div>
          <div class="pc-probs">
            <div class="pc-prob win"><div class="pc-pct">${ph.toFixed(1)}%</div><div class="pc-lbl">${p.local}</div></div>
            <div class="pc-prob draw"><div class="pc-pct">${pd.toFixed(1)}%</div><div class="pc-lbl">Empate</div></div>
            <div class="pc-prob win"><div class="pc-pct">${pa.toFixed(1)}%</div><div class="pc-lbl">${p.visitante}</div></div>
          </div>
          <div class="prob-bar" style="margin:.4rem 0">
            <div class="ph" style="width:${ph}%"></div>
            <div class="pd" style="width:${pd}%"></div>
            <div class="pa" style="width:${pa}%"></div>
          </div>
          ${lH || lA ? `<div class="pc-lambda">λ: ${lH} – ${lA} goles esperados${o25 ? ` · Over 2.5: ${o25}%` : ''}${btts ? ` · BTTS: ${btts}%` : ''}</div>` : ''}
        </div>`;
      });
      html += `</div>`;
    }

    if (!html) html = emptyHtml('🔍', 'Sin datos disponibles. Ejecuta cronDailySetup en Apps Script.');
    document.getElementById('section-ev').innerHTML = html;
  } catch(e) {
    document.getElementById('section-ev').innerHTML = errorHtml('Error EV: ' + e.message);
  }
}

// ─── ELO ──────────────────────────────────────────────────────────────────────
async function renderElo() {
  document.getElementById('section-elo').innerHTML = loadingHtml();
  try {
    const rows  = await getData('elo');
    const top28 = rows.slice(0, 28);
    if (!top28.length) { document.getElementById('section-elo').innerHTML = emptyHtml('📊', 'Sin datos ELO.'); return; }

    const minElo = top28[top28.length - 1].elo;
    const maxElo = top28[0].elo;
    const colors = top28.map((_,i) =>
      i === 0 ? '#ffd700' : i < 4 ? '#00c853' : i < 8 ? '#448aff' : '#546e7a'
    );

    document.getElementById('section-elo').innerHTML = `
      <div class="elo-header">
        <div class="elo-legend">
          <span class="elo-leg" style="--c:#ffd700">🥇 #1 Líder</span>
          <span class="elo-leg" style="--c:#00c853">Top 4</span>
          <span class="elo-leg" style="--c:#448aff">Top 8</span>
          <span class="elo-leg" style="--c:#546e7a">Resto</span>
        </div>
        <span style="font-size:.75rem;color:var(--text3)">Ranking ELO · ${top28.length} equipos</span>
      </div>
      <div class="elo-bars">
        ${top28.map((r, i) => {
          const pct = maxElo > minElo ? ((r.elo - minElo) / (maxElo - minElo) * 65 + 25) : 80;
          const col = colors[i];
          return `<div class="elo-row">
            <div class="elo-pos" style="color:${i<4?col:'var(--text3)'}">${r.pos}</div>
            <div class="elo-name">${flag(r.equipo)} ${r.equipo}</div>
            <div class="elo-bar-wrap">
              <div class="elo-bar" style="width:${pct.toFixed(1)}%;background:${col}"></div>
            </div>
            <div class="elo-val" style="color:${col}">${Math.round(r.elo)}</div>
          </div>`;
        }).join('')}
      </div>`;
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
    const byMarket = perf.byMarket || [];
    const calBuckets = perf.calibrationBuckets || [];

    let perfHtml = `<div class="perf-grid">${cards.map(c =>
      `<div class="perf-card ${c.type}">
        <div class="val">${c.val}</div>
        <div class="label">${c.label}</div>
        <div class="note">${c.note}</div>
      </div>`).join('')}</div>`;

    // Tabla calibración por bucket
    if (calBuckets.length) {
      perfHtml += `
      <h3 class="section-title" style="margin-top:1.5rem;margin-bottom:.75rem">📐 Calibración por bucket</h3>
      <p style="color:var(--text3);font-size:.8rem;margin-bottom:.75rem">¿Cuando el modelo dice 30%, ocurre realmente 30%? Ideal: predicha ≈ real.</p>
      <div style="overflow-x:auto"><table class="ev-table">
        <thead><tr><th>Rango predicho</th><th>Frec. real</th><th>N muestras</th><th>Bias</th></tr></thead>
        <tbody>${calBuckets.map(b => {
          const biasAbs = Math.abs(b.bias);
          const biasColor = biasAbs < 0.05 ? 'var(--green2)' : biasAbs < 0.10 ? 'var(--gold)' : 'var(--red)';
          const biasStr = b.bias >= 0 ? `+${(b.bias*100).toFixed(0)}pp` : `${(b.bias*100).toFixed(0)}pp`;
          const biasIcon = biasAbs < 0.05 ? '✅' : biasAbs < 0.10 ? '⚠️' : '🔴';
          return `<tr>
            <td>${b.label}</td>
            <td>${(b.real*100).toFixed(0)}%</td>
            <td style="color:var(--text3)">${b.n}</td>
            <td style="color:${biasColor}">${biasIcon} ${biasStr}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>`;
    }

    // Tabla por mercado
    if (byMarket.length) {
      perfHtml += `
      <h3 class="section-title" style="margin-top:1.5rem;margin-bottom:.75rem">📊 Rendimiento por mercado</h3>
      <div style="overflow-x:auto"><table class="ev-table">
        <thead><tr><th>Mercado</th><th>W/L</th><th>Win Rate</th><th>ROI</th><th>EV prom.</th><th>CLV prom.</th></tr></thead>
        <tbody>${byMarket.map(m => {
          const roiColor = Number(m.roi||0) >= 0 ? 'var(--green2)' : 'var(--red)';
          const clvColor = Number(m.clv_avg||0) >= 0 ? 'var(--green2)' : 'var(--red)';
          return `<tr>
            <td><small>${m.mercado||''}</small></td>
            <td style="color:var(--text3)">${m.ganadas||0}/${m.total||0}</td>
            <td>${m.win_rate != null ? fmt.pct(Number(m.win_rate)*100) : '—'}</td>
            <td style="color:${roiColor}">${m.roi != null ? fmt.sign(Number(m.roi)) : '—'}</td>
            <td style="color:var(--text2)">${m.ev_avg != null ? `+${(Number(m.ev_avg)*100).toFixed(1)}%` : '—'}</td>
            <td style="color:${clvColor}">${m.clv_avg != null ? fmt.sign(Number(m.clv_avg)) : '—'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>`;
    }

    document.getElementById('section-perf').innerHTML = perfHtml;
  } catch(e) {
    document.getElementById('section-perf').innerHTML = errorHtml('Error rendimiento: ' + e.message);
  }
}

// ─── Equipos ──────────────────────────────────────────────────────────────────
const _teamCache = {};

async function renderTeams() {
  document.getElementById('section-teams').innerHTML = loadingHtml();
  try {
    const teams = await getData('teams', 10*60*1000);
    if (!teams.length) { document.getElementById('section-teams').innerHTML = emptyHtml('🏳️', 'No hay datos de equipos.'); return; }

    // Guardar datos para modal
    teams.forEach(t => { _teamCache[t.nombre] = t; });

    // Agrupar
    const grupos = {};
    teams.forEach(t => { const g = t.grupo||'Sin grupo'; if (!grupos[g]) grupos[g]=[]; grupos[g].push(t); });
    const formaColor = r => ({W:'var(--green)',D:'var(--text3)',L:'var(--red)'})[r]||'var(--text3)';

    document.getElementById('section-teams').innerHTML = Object.keys(grupos).sort().map(g => {
      const gLabel = /^grupo\s/i.test(g) ? g : `Grupo ${g}`;
      return `
      <div style="margin-bottom:2rem">
        <h3 class="section-title">${gLabel}</h3>
        <div class="teams-grid">
          ${grupos[g].map(t => `
            <div class="team-card" onclick="showTeamDetail('${t.nombre.replace(/'/g,'\\\'')}')" style="cursor:pointer">
              <div class="team-card-top">
                <span class="team-flag-big">${flag(t.nombre)}</span>
                <div class="team-card-info">
                  <div class="team-name-big">${t.nombre}</div>
                  <div class="team-card-sub">${t.confederacion||''} ${t.entrenador ? `· ${t.entrenador}` : ''}</div>
                </div>
                ${t.pos ? `<div class="team-pos">#${t.pos} <small>${t.pts}pts</small></div>` : ''}
              </div>
              ${t.elo ? `<div class="team-elo">ELO <strong>${Math.round(t.elo)}</strong></div>` : ''}
              ${(() => {
                const detail = (t.forma_detail && t.forma_detail.length) ? t.forma_detail : (t.forma ? t.forma.split(',').filter(r=>/^[WDL]$/.test(r)).map(r=>({r,wc:false,rival:'',score:''})) : []);
                if (!detail.length) return '';
                const labels = {W:'Victoria',D:'Empate',L:'Derrota'};
                const wc  = detail.filter(d => d.wc).slice(-5);
                const prev= detail.filter(d => !d.wc).slice(-5);
                const dot = (d, gold) => `<span class="forma-dot${gold?' wc':''}" title="${labels[d.r]||d.r}${d.rival?' vs '+d.rival:''}${d.score?' ('+d.score+')':''}" style="background:${formaColor(d.r)};${gold?'box-shadow:0 0 0 2px var(--gold)':''}">${d.r}</span>`;
                let html = '<div class="team-forma">';
                if (wc.length)  html += `<span class="forma-label">⚽</span>${wc.map(d=>dot(d,true)).join('')}`;
                if (prev.length) html += `${wc.length?'<span class="forma-sep">·</span>':''}${prev.map(d=>dot(d,false)).join('')}`;
                html += '</div>';
                return html;
              })()}
            </div>`).join('')}
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    document.getElementById('section-teams').innerHTML = errorHtml('Error equipos: ' + e.message);
  }
}

function showTeamDetail(nombre) {
  const t = _teamCache[nombre];
  if (!t) return;

  const partidos = (t.partidos_wc || []).sort((a,b) => (a.fecha||'') < (b.fecha||'') ? -1 : 1);

  const played   = partidos.filter(p => p.status === 'FT' || p.status === 'AET' || p.status === 'PEN' || (p.goles_l !== null && p.goles_l !== undefined && String(p.goles_l) !== ''));
  const upcoming = partidos.filter(p => !played.includes(p));

  const normStr = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const isTeamLocal = (m) => normStr(m.local) === normStr(nombre);

  const matchResult = (m) => {
    const gl = Number(m.goles_l), gv = Number(m.goles_v);
    if (isNaN(gl) || isNaN(gv)) return null;
    const myGoals = isTeamLocal(m) ? gl : gv;
    const oppGoals = isTeamLocal(m) ? gv : gl;
    if (myGoals > oppGoals) return 'w';
    if (myGoals === oppGoals) return 'd';
    return 'l';
  };

  const fmtMatchDate = (f) => fmtDate(String(f||'').substring(0,10));

  const renderMatch = (m) => {
    const isPlayed = played.includes(m);
    const isLocal = isTeamLocal(m);
    const opp = isLocal ? m.visitante : m.local;
    const scoreClass = isPlayed ? (matchResult(m) === 'w' ? 'win' : matchResult(m) === 'd' ? 'draw' : 'loss') : 'upcoming';
    const scoreHtml = isPlayed
      ? `<span class="match-row-score ${scoreClass}">${m.goles_l}–${m.goles_v}</span><span class="match-result-badge ${matchResult(m)}">${{w:'V',d:'E',l:'D'}[matchResult(m)]||''}</span>`
      : `<span class="match-row-score upcoming">${(m.hora||m.hora_local||'').substring(0,5) || '–'}</span>`;
    return `<div class="match-row">
      <span class="match-row-date">${fmtMatchDate(m.fecha)}</span>
      <div class="match-row-teams">
        <span>${isLocal ? `<strong>${flag(nombre)} ${nombre}</strong> vs ${flag(opp)} ${opp}` : `${flag(opp)} ${opp} vs <strong>${flag(nombre)} ${nombre}</strong>`}</span>
      </div>
      ${scoreHtml}
      ${m.ciudad ? `<span class="match-row-venue">${m.ciudad}</span>` : ''}
    </div>`;
  };

  const squadId = `modal-squad-${nombre.replace(/\s/g,'_')}`;

  const html = `
    <div class="team-modal-overlay" id="team-modal-overlay" onclick="if(event.target===this)closeTeamModal()">
      <div class="team-modal">
        <div class="team-modal-header">
          <span class="team-modal-flag">${flag(nombre)}</span>
          <div class="team-modal-title">
            <h3>${nombre}</h3>
            <small>${t.confederacion||''} ${t.grupo ? `· Grupo ${t.grupo}` : ''} ${t.entrenador ? `· ${t.entrenador}` : ''}</small>
          </div>
          <button class="team-modal-close" onclick="closeTeamModal()">✕</button>
        </div>
        <div class="team-modal-body">
          ${played.length ? `<div class="team-modal-section">
            <div class="team-modal-section-title">Resultados ⚽ Mundial 2026</div>
            ${played.map(renderMatch).join('')}
          </div>` : ''}
          ${upcoming.length ? `<div class="team-modal-section">
            <div class="team-modal-section-title">Próximos partidos</div>
            ${upcoming.map(renderMatch).join('')}
          </div>` : ''}
          ${!partidos.length ? `<p style="color:var(--text3);font-size:.85rem;text-align:center;padding:1rem 0">Sin partidos programados.</p>` : ''}
          <div class="squad-modal-section">
            <button class="modal-squad-btn" onclick="loadModalSquad('${nombre.replace(/'/g,"\\'")}','${squadId}')">👕 Ver Plantel</button>
            <div id="${squadId}"></div>
          </div>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  document.body.style.overflow = 'hidden';
}

function closeTeamModal() {
  const el = document.getElementById('team-modal-overlay');
  if (el) el.remove();
  document.body.style.overflow = '';
}

async function loadModalSquad(nombre, containerId) {
  const el = document.getElementById(containerId);
  if (!el || el.dataset.loaded) return;
  const btn = el.previousElementSibling;
  if (btn) btn.style.display = 'none';
  el.innerHTML = `<div class="loading-center" style="padding:.75rem"><div class="spinner" style="width:20px;height:20px"></div></div>`;
  try {
    const squad = await getData('squad', 15*60*1000, { equipo: nombre });
    if (!squad.jugadores || !squad.jugadores.length) {
      el.innerHTML = '<p style="color:var(--text3);font-size:.8rem;padding:.5rem 0">Sin datos de plantel.</p>';
      return;
    }
    el.dataset.loaded = '1';

    // ── Plantel view ──
    const byPos = { Goalkeeper:[], Defender:[], Midfielder:[], Forward:[] };
    const posLabel = { Goalkeeper:'Porteros 🧤', Defender:'Defensas 🛡️', Midfielder:'Medios ⚙️', Forward:'Delanteros ⚡' };
    squad.jugadores.forEach(p => {
      const pos = p.posicion || 'Midfielder';
      const k = Object.keys(byPos).find(k => pos.toLowerCase().includes(k.toLowerCase())) || 'Midfielder';
      byPos[k].push(p);
    });
    const plantelHtml = `<div class="squad-grid">${Object.entries(byPos).filter(([,v])=>v.length).map(([pos,players]) => `
      <div class="squad-pos-group">
        <div class="squad-pos-label">${posLabel[pos]||pos}</div>
        <div class="squad-players">${players.map(p => `
          <div class="squad-player">
            ${p.foto ? `<img src="${p.foto}" class="squad-photo" onerror="this.style.display='none'">` : `<div class="squad-photo-ph">${(p.nombre||'?').charAt(0)}</div>`}
            <div class="squad-player-info">
              <span class="squad-player-name">${p.nombre||''}</span>
              <span class="squad-player-meta">${p.edad ? p.edad+'a' : ''}${p.goles>0?` · ⚽${p.goles}`:''}${p.asistencias>0?` · 🎯${p.asistencias}`:''}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>`).join('')}</div>`;

    // ── Stats WC view ──
    const hasStats = squad.jugadores.some(p => p.partidos > 0);
    const posOrd = { Goalkeeper:1, Defender:2, Midfielder:3, Forward:4 };
    const statsPlayers = [...squad.jugadores]
      .filter(p => p.partidos > 0 || p.minutos > 0)
      .sort((a,b) => {
        const pa = posOrd[Object.keys(posOrd).find(k => (a.posicion||'').toLowerCase().includes(k.toLowerCase()))||'Midfielder']||3;
        const pb = posOrd[Object.keys(posOrd).find(k => (b.posicion||'').toLowerCase().includes(k.toLowerCase()))||'Midfielder']||3;
        if (pa !== pb) return pa - pb;
        return (b.minutos||0) - (a.minutos||0);
      });

    const posShort = p => {
      const s = (p.posicion||'').toLowerCase();
      if (s.includes('goal') || s.includes('porter')) return 'PO';
      if (s.includes('def'))  return 'DF';
      if (s.includes('mid') || s.includes('medio')) return 'MC';
      return 'DL';
    };
    const ratingColor = r => r >= 7.5 ? 'var(--green)' : r >= 6.5 ? 'var(--gold)' : r > 0 ? 'var(--red)' : 'var(--text3)';

    const statsHtml = hasStats ? `
      <div class="squad-stats-table">
        <div class="squad-stats-header">
          <span>POS</span><span>Jugador</span><span title="Partidos">J</span><span title="Minutos">⏱</span>
          <span title="Goles">⚽</span><span title="Asistencias">🎯</span>
          <span title="Amarillas">🟨</span><span title="Rojas">🟥</span><span title="Rating">★</span>
        </div>
        ${statsPlayers.map(p => `
        <div class="squad-stats-row">
          <span class="spos">${posShort(p)}</span>
          <span class="sname">${p.nombre||''}</span>
          <span>${p.partidos||0}</span>
          <span>${p.minutos||0}</span>
          <span>${p.goles||0}</span>
          <span>${p.asistencias||0}</span>
          <span>${p.amarillas||0}</span>
          <span>${p.rojas||0}</span>
          <span style="color:${ratingColor(p.rating)};font-weight:600">${p.rating>0?p.rating.toFixed(1):'–'}</span>
        </div>`).join('')}
      </div>` : '<p style="color:var(--text3);font-size:.8rem;padding:.5rem 0">Sin estadísticas de partidos aún.</p>';

    // ── Toggle ──
    const uid = containerId.replace(/[^a-z0-9]/gi,'');
    el.innerHTML = `
      <div class="team-modal-section" style="margin-top:.75rem">
        <div class="squad-tab-bar">
          <button class="squad-tab active" onclick="squadToggle('${uid}','plantel')">👕 Plantel</button>
          <button class="squad-tab" onclick="squadToggle('${uid}','stats')">📊 Stats WC</button>
        </div>
        <div id="${uid}-plantel" class="squad-tab-panel">${plantelHtml}</div>
        <div id="${uid}-stats"   class="squad-tab-panel" style="display:none">${statsHtml}</div>
      </div>`;
  } catch(e) {
    el.innerHTML = '<p style="color:var(--text3);font-size:.8rem">Error cargando plantel.</p>';
  }
}

function squadToggle(uid, tab) {
  ['plantel','stats'].forEach(t => {
    const panel = document.getElementById(`${uid}-${t}`);
    if (panel) panel.style.display = t === tab ? '' : 'none';
  });
  // Update active tab button — find bar sibling to one of the panels
  const panel = document.getElementById(`${uid}-plantel`);
  if (panel) {
    const bar = panel.closest('.team-modal-section')?.querySelector('.squad-tab-bar');
    if (bar) bar.querySelectorAll('.squad-tab').forEach((btn,i) => {
      btn.classList.toggle('active', (i===0&&tab==='plantel')||(i===1&&tab==='stats'));
    });
  }
}

async function showTeamSquad(nombre) {
  showTeamDetail(nombre);
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
    <div class="stats-desktop">
    <table class="standings-table stats-table">
      <thead><tr>
        <th>Equipo</th><th title="Partidos jugados">PJ</th><th title="Victorias">W</th><th title="Empates">D</th><th title="Derrotas">L</th>
        <th title="Goles a favor">GF</th><th title="Goles en contra">GA</th>
        <th title="Posesión promedio del torneo">Pos%</th><th title="Tiros totales">Tiros</th>
        <th title="Tiros al arco">Arco</th><th title="Corners">Corn.</th>
        <th title="Tarjetas amarillas">🟨</th>
        <th title="Tarjetas rojas">🟥</th>
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
          <td style="color:var(--red)">${t.rojas||0}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
    <div class="stats-mobile">
      ${stats.map(t => `
      <div class="stat-card">
        <div class="stat-card-header">
          <span>${flag(t.equipo)} <strong>${t.equipo}</strong></span>
          <span class="stat-pj">${t.pj||0} PJ</span>
        </div>
        <div class="stat-card-row">
          <div class="stat-pill win">${t.pg||0}W</div>
          <div class="stat-pill draw">${t.pe||0}D</div>
          <div class="stat-pill loss">${t.pp||0}L</div>
          <div class="stat-pill gf">⚽ ${t.gf||0}</div>
          <div class="stat-pill ga" style="color:var(--text3)">−${t.ga||0}</div>
        </div>
        <div class="stat-card-row" style="margin-top:.3rem;font-size:.75rem;color:var(--text2);gap:.75rem">
          ${t.posesion_avg ? `<span title="Posesión promedio">🏃 ${Number(t.posesion_avg).toFixed(0)}% pos.</span>` : ''}
          ${t.tiros ? `<span title="Tiros / al arco">🎯 ${t.tiros||0}/${t.tiros_arco||0}</span>` : ''}
          ${t.corners ? `<span title="Corners">⛳ ${t.corners} corn.</span>` : ''}
          ${t.amarillas ? `<span>🟨 ${t.amarillas}</span>` : ''}
          ${t.rojas ? `<span>🟥 ${t.rojas}</span>` : ''}
        </div>
      </div>`).join('')}
    </div>
    <p class="table-note">Click en equipo (desktop) para ver plantel · Acumulado del torneo · Pos% = posesión promedio</p>`;
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

// ─── Árbitros ─────────────────────────────────────────────────────────────────
async function renderArbitros() {
  const el = document.getElementById('section-arbitros');
  el.innerHTML = loadingHtml();
  try {
    const arbs = await getData('arbitros', 5*60*1000);
    if (!arbs || !arbs.length) { el.innerHTML = emptyHtml('👨‍⚖️', 'Sin datos de árbitros todavía.'); return; }

    const tendBadge = t => {
      const map = { ESTRICTO: 'badge-red', NORMAL: 'badge-gray', PERMISIVO: 'badge-green' };
      return t ? `<span class="arb-tend ${map[t]||'badge-gray'}">${t}</span>` : '';
    };

    el.innerHTML = `<div class="card" style="padding:0;overflow:hidden">
      <table class="arb-table">
        <thead><tr>
          <th>Árbitro</th><th>País</th><th>Conf.</th><th>PJ</th><th>🟨/pj</th><th>🟥/pj</th><th>Tendencia</th>
        </tr></thead>
        <tbody>${arbs.map(a => `<tr>
          <td><strong>${a.nombre||''}</strong></td>
          <td style="color:var(--text2)">${a.nacionalidad||''}</td>
          <td style="color:var(--text3);font-size:.75rem">${a.confederacion||''}</td>
          <td style="text-align:center">${a.pj||0}</td>
          <td style="text-align:center">${a.amarillas_pp != null ? Number(a.amarillas_pp).toFixed(2) : '–'}</td>
          <td style="text-align:center">${a.rojas_pp != null ? Number(a.rojas_pp).toFixed(2) : '–'}</td>
          <td>${tendBadge(a.tendencia)}</td>
        </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  } catch(e) {
    el.innerHTML = errorHtml('Error árbitros: ' + e.message);
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
  arbitros:    renderArbitros,
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTeamModal(); });

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
