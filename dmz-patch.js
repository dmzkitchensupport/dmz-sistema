
// ── Inyectar CSS nuevo ─────────────────────────────────────────
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .ani { cursor: default; }
    .ani[draggable] { cursor: grab; }
    .ani[draggable]:active { cursor: grabbing; }
    .ani.drag-target { border: 2px dashed var(--gold) !important; background: #fffdf5 !important; }
    .ani.dragging { opacity: .4; }
    .ani-drag-handle { color: var(--mid); font-size: .75rem; cursor: grab; padding: 0 4px; flex-shrink: 0; user-select: none; }
    .hz-custom-mod { border: 1.5px solid var(--border); border-radius: 8px; margin-top: .75rem; overflow: hidden; }
    .hz-custom-mod-head { background: var(--cream); padding: .5rem .75rem; display: flex; align-items: center; gap: .5rem; }
    .hz-custom-mod-title { flex: 1; font-size: .72rem; font-weight: 700; color: var(--dark); border: none; background: transparent; outline: none; font-family: inherit; }
    .hz-custom-mod-del { background: none; border: none; color: var(--mid); cursor: pointer; font-size: .8rem; }
    .hz-custom-mod-del:hover { color: var(--red); }
    .hz-custom-mod-body { padding: .5rem .75rem; }
    .hz-custom-mod-ta { width: 100%; box-sizing: border-box; border: none; background: transparent; outline: none; resize: vertical; font-size: .76rem; color: var(--dark); line-height: 1.6; font-family: inherit; min-height: 56px; }
    .hz-add-module-btn { display: flex; align-items: center; gap: .4rem; background: none; border: 1px dashed var(--border); border-radius: 6px; color: var(--mid); font-size: .68rem; font-weight: 600; padding: .45rem .8rem; cursor: pointer; width: 100%; margin-top: .75rem; justify-content: center; transition: all .15s; }
    .hz-add-module-btn:hover { border-color: var(--gold); color: var(--gold); background: #fffdf5; }
    .edit-btn { background: var(--gold); color: #fff; border: none; border-radius: 4px; font-size: .58rem; font-weight: 700; padding: .22rem .55rem; cursor: pointer; letter-spacing: .04em; white-space: nowrap; }
    .edit-btn.secondary { background: var(--mid); }
    .edit-btn.danger { background: var(--red); }
    .edit-btn.ok { background: #27ae60; }
    .edit-textarea { width: 100%; box-sizing: border-box; border: 1.5px solid var(--gold); border-radius: 5px; padding: .55rem .7rem; font-size: .76rem; line-height: 1.6; color: var(--dark); resize: vertical; font-family: inherit; background: #fffdf5; min-height: 80px; }
    .edit-toolbar { display: flex; gap: .4rem; align-items: center; margin-top: .35rem; flex-wrap: wrap; }
    .edit-status { font-size: .6rem; color: var(--mid); margin-left: auto; }
    .editable-block { position: relative; }
    .editable-block:hover .edit-controls { opacity: 1; pointer-events: all; }
    .edit-controls { opacity: 0; pointer-events: none; transition: opacity .18s; position: absolute; top: .3rem; right: .3rem; display: flex; gap: .3rem; z-index: 10; }
    .recovery-panel { position:fixed;inset:0;z-index:9500;background:rgba(26,37,51,.82);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center; }
    .recovery-card { background:#fff;border-radius:12px;padding:1.5rem 1.8rem;max-width:500px;width:94%;max-height:80vh;overflow-y:auto;border-top:4px solid var(--gold); }
    .recovery-title { font-size:.9rem;font-weight:800;color:var(--dark);letter-spacing:.05em;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between; }
    .recovery-slot { border:1px solid var(--border);border-radius:8px;padding:.75rem 1rem;margin-bottom:.6rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem; }
    .recovery-slot-info { flex:1; }
    .recovery-slot-label { font-size:.7rem;font-weight:700;color:var(--dark); }
    .recovery-slot-ts { font-size:.62rem;color:var(--mid);margin-top:.15rem; }
    .recovery-slot-size { font-size:.6rem;color:var(--mid); }
    .recovery-slot-btns { display:flex;gap:.4rem; }
    .recovery-btn { padding:.28rem .7rem;border-radius:5px;font-size:.65rem;font-weight:700;cursor:pointer;border:none;white-space:nowrap; }
    .recovery-btn.primary { background:var(--gold);color:#fff; }
    .recovery-btn.neutral { background:var(--cream);color:var(--dark);border:1px solid var(--border); }
    @keyframes slideUp { from{transform:translateX(-50%) translateY(20px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
  `;
  document.head.appendChild(style);
})();

function movePhoto(pid, destAreaId) {
  // Encontrar la foto en el área actual
  const srcAreaId = STATE.currentArea;
  const srcPhotos = STATE.areas[srcAreaId].photos;
  const idx = srcPhotos.findIndex(p => p.id === pid);
  if (idx < 0) return;

  // Mover al área destino
  const [photo] = srcPhotos.splice(idx, 1);
  STATE.areas[destAreaId].photos.push(photo);

  const destArea = AREAS.find(a => a.id === destAreaId);
  showToast(`Foto movida a ${destArea ? destArea.name : destAreaId}`);
  markDirty();
  renderGrid();
  renderAreaNav();
  updateProgress();
  updateAnalyzeBtn();
}

function areaDragStart(e, idx) {
  _dragIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => {
    document.querySelectorAll('.ani')[idx]?.classList.add('dragging');
  }, 0);
}

function areaDragOver(e, idx) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.ani').forEach(el => el.classList.remove('drag-target'));
  if (idx !== _dragIdx) document.querySelectorAll('.ani')[idx]?.classList.add('drag-target');
}

function areaDragLeave(e) {
  e.currentTarget.classList.remove('drag-target');
}

function areaDrop(e, toIdx) {
  e.preventDefault();
  if (_dragIdx === null || _dragIdx === toIdx) return;
  const moved = AREAS.splice(_dragIdx, 1)[0];
  AREAS.splice(toIdx, 0, moved);
  _dragIdx = null;
  markDirty();
  renderAreaNav();
  showToast('Área reordenada');
}

function areaDragEnd() {
  _dragIdx = null;
  document.querySelectorAll('.ani').forEach(el => {
    el.classList.remove('dragging', 'drag-target');
  });
}

function hzCustomModAdd(aId) {
  const hz = _hzGetArea(aId);
  if (!hz) return;
  if (!hz.customModules) hz.customModules = [];
  hz.customModules.push({ title: '', text: '' });
  markDirty();
  renderHzPanel();
  // Focus en el título del nuevo módulo
  setTimeout(() => {
    const mods = document.querySelectorAll('.hz-custom-mod-title');
    mods[mods.length - 1]?.focus();
  }, 50);
}

function hzCustomModUpdate(aId, mi, field, val) {
  const hz = _hzGetArea(aId);
  if (!hz?.customModules?.[mi]) return;
  hz.customModules[mi][field] = val;
  markDirty();
}

function hzCustomModDelete(aId, mi) {
  const hz = _hzGetArea(aId);
  if (!hz?.customModules?.[mi]) return;
  const titulo = hz.customModules[mi].title || 'este módulo';
  if (!confirm(`¿Eliminar el módulo "${titulo}"? Esta acción no se puede deshacer.`)) return;
  hz.customModules.splice(mi, 1);
  markDirty();
  renderHzPanel();
  showToast('Módulo eliminado');
}

function cl2EditResumen(ri) {
  const card = document.getElementById(`cl2-res-${ri}`);
  const textEl = document.getElementById(`cl2-res-text-${ri}`);
  if (!card || !textEl) return;

  const origText = CL2_STATE.resumen[ri]?.resumen || '';
  const origHTML = card.innerHTML;

  // Reemplazar contenido con editor
  const uid = 'est-' + ri;
  card.innerHTML = `
    <div class="cl2-res-head" style="margin-bottom:.4rem">
      <span style="background:var(--gold);color:#fff;font-size:.58rem;font-weight:800;padding:.12rem .4rem;border-radius:3px">${CL2_STATE.resumen[ri]?.pregunta}</span>
      <span>${esc(CL2_STATE.resumen[ri]?.titulo || '')}</span>
    </div>
    <textarea id="ta-${uid}" class="edit-textarea" rows="4">${origText}</textarea>
    <div class="edit-toolbar">
      <button class="edit-btn ok" onclick="cl2SaveResumen(${ri})">✓ Guardar</button>
      <button class="edit-btn secondary" onclick="cl2CorregirResumen(${ri}, '${uid}')">🔤 Corregir ortografía</button>
      <button class="edit-btn danger" onclick="cl2CancelResumen(${ri}, \`${origHTML.replace(/`/g,"'")}\`)">✕ Cancelar</button>
      <span class="edit-status" id="${uid}-status"></span>
    </div>`;
}

function cl2SaveResumen(ri) {
  const uid = 'est-' + ri;
  const ta = document.getElementById('ta-' + uid);
  if (!ta) return;
  CL2_STATE.resumen[ri].resumen = ta.value.trim();
  markDirty();
  renderCl2AnalisisBlock();
  renderCl2Resumen(CL2_STATE.resumen);
  showToast('✓ Resumen guardado');
}

function cl2CancelResumen(ri, origHTML) {
  const card = document.getElementById(`cl2-res-${ri}`);
  if (card) card.innerHTML = origHTML;
}

async function cl2CorregirResumen(ri, uid) {
  if (!STATE?.apiKey?.startsWith('sk-ant-')) { showToast('API Key requerida'); return; }
  const ta = document.getElementById('ta-' + uid);
  const statusEl = document.getElementById(uid + '-status');
  if (!ta) return;
  statusEl.textContent = 'Corrigiendo…';
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': STATE.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content:
          `Corrige la ortografía y gramática del siguiente texto en español. ` +
          `Mantén el mismo significado, tono profesional y estructura. ` +
          `Responde ÚNICAMENTE con el texto corregido, sin explicaciones ni comillas:\n\n${ta.value}`
        }]
      })
    });
    const data = await resp.json();
    const corregido = data.content?.[0]?.text?.trim();
    if (corregido) { ta.value = corregido; statusEl.textContent = '✓ Corregido'; setTimeout(()=>statusEl.textContent='',3000); }
  } catch(e) { statusEl.textContent = 'Error: ' + e.message; }
}

function pvEditarRespuesta(colabId, qi, uid) {
  const colab = CL2_STATE.colaboradores.find(c => c.id === colabId);
  if (!colab) return;
  const textEl = document.getElementById(uid + '-text');
  if (!textEl) return;
  const actual = colab.respuestas[qi] || '';

  textEl.innerHTML = `
    <textarea class="edit-textarea" id="${uid}-ta" rows="3" style="margin:.3rem 0">${esc(actual)}</textarea>
    <div class="edit-toolbar" style="margin-top:.3rem">
      <button class="edit-btn ok" onclick="pvGuardarRespuesta('${colabId}',${qi},'${uid}')">✓ Guardar</button>
      <button class="edit-btn secondary" onclick="pvCorregirInline('${colabId}',${qi},'${uid}')">🔤 Corregir</button>
      <button class="edit-btn danger" onclick="renderCl2VistaPregunta()">✕ Cancelar</button>
      <span class="edit-status" id="${uid}-status"></span>
    </div>`;
  document.getElementById(uid + '-ta')?.focus();
}

function pvGuardarRespuesta(colabId, qi, uid) {
  const ta = document.getElementById(uid + '-ta');
  if (!ta) return;
  const colab = CL2_STATE.colaboradores.find(c => c.id === colabId);
  if (!colab) return;
  colab.respuestas[qi] = ta.value.trim();
  markDirty();
  renderCl2VistaPregunta();
  showToast('✓ Respuesta guardada');
}

async function pvCorregirRespuesta(colabId, qi, uid) {
  if (!STATE?.apiKey?.startsWith('sk-ant-')) { showToast('API Key requerida'); return; }
  const colab = CL2_STATE.colaboradores.find(c => c.id === colabId);
  if (!colab?.respuestas[qi]?.trim()) return;
  const textEl = document.getElementById(uid + '-text');
  if (textEl) textEl.style.opacity = '.5';
  showToast('Corrigiendo…');
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':STATE.apiKey,
        'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:512,
        messages:[{role:'user',content:`Corrige ortografía y gramática en español. Mantén el mismo significado. Solo devuelve el texto corregido:\n\n${colab.respuestas[qi]}`}] })
    });
    const data = await resp.json();
    const c = data.content?.[0]?.text?.trim();
    if (c) {
      colab.respuestas[qi] = c;
      markDirty();
      renderCl2VistaPregunta();
      showToast('✓ Respuesta corregida');
    }
  } catch(e) {
    if (textEl) textEl.style.opacity = '1';
    showToast('Error: ' + e.message);
  }
}

function openRecoveryPanel() {
  if (document.getElementById('recovery-panel')) return;

  const slots = [
    { key: 'dmz_audit_v4',    tsKey: null,                label: 'Sesión actual',        icon: '💾' },
    { key: 'dmz_emergency_backup', tsKey: 'dmz_emergency_ts', label: 'Backup emergencia', icon: '⚡' },
    { key: 'dmz_audit_v4_h1', tsKey: 'dmz_audit_v4_h1_ts', label: 'Versión histórica 1', icon: '🕐' },
    { key: 'dmz_audit_v4_h2', tsKey: null,                label: 'Versión histórica 2',  icon: '🕑' },
    { key: 'dmz_audit_v4_h3', tsKey: null,                label: 'Versión histórica 3',  icon: '🕒' },
  ];

  const slotsHtml = slots.map((s, i) => {
    const raw = localStorage.getItem(s.key);
    if (!raw) return `
      <div class="recovery-slot" style="opacity:.4">
        <div class="recovery-slot-info">
          <div class="recovery-slot-label">${s.icon} ${s.label}</div>
          <div class="recovery-slot-ts">Sin datos</div>
        </div>
      </div>`;

    let parsed = {};
    try { parsed = JSON.parse(raw); } catch(e) {}
    const ts    = s.tsKey ? localStorage.getItem(s.tsKey) : parsed.savedAt;
    const when  = ts ? new Date(ts).toLocaleString('es-MX', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Fecha desconocida';
    const kb    = Math.round(raw.length / 1024);
    const client = parsed.client || parsed.cl2State?.meta?.empresa || '—';
    const nAreas = Object.keys(parsed.areas || {}).length;
    const nFotos = Object.values(parsed.areas || {}).reduce((s,a)=>s+(a.photos||[]).length,0);

    return `
      <div class="recovery-slot">
        <div class="recovery-slot-info">
          <div class="recovery-slot-label">${s.icon} ${s.label}</div>
          <div class="recovery-slot-ts">${when} · ${client}</div>
          <div class="recovery-slot-size">${kb} KB · ${nAreas} áreas · ${nFotos} fotos</div>
        </div>
        <div class="recovery-slot-btns">
          ${i > 0 ? `<button class="recovery-btn primary" onclick="recoverFromSlot('${s.key}','${s.tsKey||''}')">Restaurar</button>` : ''}
          <button class="recovery-btn neutral" onclick="recoverPreview('${s.key}')">Ver</button>
        </div>
      </div>`;
  }).join('');

  // Estado de Supabase
  const sbStatus = SB.ready
    ? `<div style="padding:.6rem .8rem;background:#f0fdf4;border-radius:6px;font-size:.7rem;color:#27ae60;margin-bottom:.8rem">
        ☁ Supabase conectado — snapshot en la nube disponible
        <button class="recovery-btn neutral" style="margin-left:.5rem" onclick="sbRestoreLatest()">Restaurar desde nube</button>
      </div>`
    : `<div style="padding:.6rem .8rem;background:#fff5f5;border-radius:6px;font-size:.7rem;color:var(--red);margin-bottom:.8rem">
        ⚠ Supabase no conectado — solo respaldos locales disponibles
      </div>`;

  const panel = document.createElement('div');
  panel.className = 'recovery-panel';
  panel.id = 'recovery-panel';
  panel.innerHTML = `
    <div class="recovery-card">
      <div class="recovery-title">
        <span>🛡 PANEL DE RECUPERACIÓN</span>
        <button class="recovery-btn neutral" onclick="document.getElementById('recovery-panel').remove()">✕ Cerrar</button>
      </div>
      ${sbStatus}
      <div style="font-size:.65rem;font-weight:700;color:var(--mid);letter-spacing:.1em;margin-bottom:.5rem">RESPALDOS LOCALES DISPONIBLES</div>
      ${slotsHtml}
      <div style="margin-top:1rem;padding-top:.75rem;border-top:1px solid var(--border);display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="recovery-btn primary" onclick="exportSessionJSON()">⬇ Exportar JSON</button>
        <button class="recovery-btn neutral" onclick="document.getElementById('recovery-panel').remove()">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(panel);
}

function recoverFromSlot(key, tsKey) {
  const raw = localStorage.getItem(key);
  if (!raw) { showToast('No hay datos en ese slot'); return; }
  let parsed;
  try { parsed = JSON.parse(raw); } catch(e) { showToast('Datos corruptos en ese slot'); return; }
  const ts   = tsKey ? localStorage.getItem(tsKey) : parsed.savedAt;
  const when = ts ? new Date(ts).toLocaleString('es-MX') : 'fecha desconocida';
  if (!confirm(`¿Restaurar la versión del ${when}?\nLos cambios actuales se guardarán primero como backup de emergencia.`)) return;

  // Guardar estado actual como emergencia antes de restaurar
  try {
    localStorage.setItem('dmz_emergency_backup', localStorage.getItem('dmz_audit_v4') || '{}');
    localStorage.setItem('dmz_emergency_ts', new Date().toISOString());
  } catch(e) {}

  localStorage.setItem('dmz_audit_v4', raw);
  document.getElementById('recovery-panel')?.remove();
  showToast('Restaurando… recargando página');
  setTimeout(() => location.reload(), 1000);
}

async function sbUploadPhoto(photoId, b64, userId) {
  if (!SB.ready || !b64) return null;
  try {
    // Convertir base64 a blob
    const byteStr = atob(b64);
    const ab = new ArrayBuffer(byteStr.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
    const blob = new Blob([ab], { type: 'image/jpeg' });

    const path = `${userId}/${photoId}.jpg`;
    const url  = `${SB.url}/storage/v1/object/auditoria-fotos/${path}`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SB.token}`,
        'Content-Type':  'image/jpeg',
        'x-upsert':      'true',
      },
      body: blob,
    });
    if (!resp.ok) throw new Error(await resp.text());
    return path;
  } catch(e) {
    console.warn('sbUploadPhoto error:', e.message);
    return null;
  }
}

async function sbGetPhotoUrl(photoId, userId) {
  if (!SB.ready) return null;
  const path = `${userId}/${photoId}.jpg`;
  // Generar URL firmada (válida por 1 hora)
  try {
    const resp = await fetch(`${SB.url}/storage/v1/object/sign/auditoria-fotos/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SB.token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return SB.url + '/storage/v1' + data.signedURL;
  } catch(e) { return null; }
}

async function sbRefreshToken() {
  const refresh = localStorage.getItem('dmz_sb_refresh');
  if (!refresh) return false;
  try {
    const resp = await fetch(SB.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'apikey': SB.anon, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    SB.token  = data.access_token;
    SB.userId = data.user.id;
    SB.ready  = true;
    localStorage.setItem('dmz_sb_token',   data.access_token);
    localStorage.setItem('dmz_sb_refresh', data.refresh_token);
    localStorage.setItem('dmz_sb_user',    data.user.id);
    return true;
  } catch(e) { return false; }
}

async function autoRestoreFromSupabase() {
  try {
    const rows = await sbFetch('GET',
      '/rest/v1/auditorias?auditor_id=eq.' + SB.userId +
      '&cliente_nombre=neq.__dmz_presence__&order=guardada_en.desc&limit=1&select=snapshot,cliente_nombre,guardada_en'
    );
    if (!rows?.length || !rows[0].snapshot?.client) return false;
    const snap = rows[0].snapshot;

    STATE.client = snap.client;
    const el = document.getElementById('inp-client');
    if (el) el.value = STATE.client;

    if (snap.cl2State)        Object.assign(CL2_STATE, snap.cl2State);
    if (snap.hallazgosState)  Object.assign(HZ_STATE,  snap.hallazgosState);
    if (snap.aliState?.items) ALI_STATE.items = snap.aliState.items;

    if (snap.customAreaDefs?.length) {
      STATE.customAreaDefs = snap.customAreaDefs;
      snap.customAreaDefs.forEach(d => {
        if (!AREAS.find(a => a.id === d.id)) AREAS.push(d);
        if (!STATE.areas[d.id]) STATE.areas[d.id] = { photos: [], hallazgos: _hzDefault() };
      });
    }

    if (snap.areas) {
      for (const aId in snap.areas) {
        if (!STATE.areas[aId]) STATE.areas[aId] = { photos: [], hallazgos: _hzDefault() };
        STATE.areas[aId].hallazgos = snap.areas[aId].hallazgos || _hzDefault();
        STATE.areas[aId].photos = (snap.areas[aId].photos || []).map(p => ({
          ...p, storageB64: null, displayUrl: null, _lazyPending: true
        }));
      }
    }

    // Guardar en localStorage para siguiente carga offline
    const saveState = {
      version: '10.0', savedAt: new Date().toISOString(),
      client: STATE.client, customAreaDefs: STATE.customAreaDefs,
      areas: {}, cl2State: CL2_STATE, hallazgosState: HZ_STATE, aliState: ALI_STATE,
    };
    for (const aId in STATE.areas) {
      saveState.areas[aId] = {
        hallazgos: STATE.areas[aId].hallazgos || _hzDefault(),
        photos: STATE.areas[aId].photos.map(p => ({
          id:p.id, name:p.name, alert:p.alert,
          state:p.state==='loading'?'empty':p.state,
          notes:p.notes, markers:p.markers, aiSuggestion:p.aiSuggestion,
        }))
      };
    }
    localStorage.setItem('dmz_audit_v4', JSON.stringify(saveState));
    return true;
  } catch(e) {
    console.warn('autoRestoreFromSupabase:', e.message);
    return false;
  }
}

function renderCl2AnalisisBlock() {
  /* Agrega fortalezas/focos PRIMERO — UNA SOLA VEZ */
  const resBody = document.getElementById('cl2-resumen-body');
  if (!resBody) return;
  // Limpiar bloques previos de análisis Y resumen AI para reordenar correctamente
  resBody.querySelectorAll('.cl2-analisis-append, .cl2-resumen-ai').forEach(el => el.remove());
  const m = CL2_STATE.meta || {};
  if (!m.fortalezas && !m.focos) return;
  const toBullets = txt => txt.split('\n').filter(Boolean)
    .map(b => `<li style="margin-bottom:.4rem;font-size:.76rem;color:#2D3A3F;line-height:1.6">${esc(b)}</li>`)
    .join('');
  const div = document.createElement('div');
  div.className = 'cl2-analisis-append';
  div.style.cssText = 'border-top:2px solid var(--gold);margin-top:1rem;padding:1.2rem 1.4rem';
  div.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
      <div style="font-size:.6rem;font-weight:800;letter-spacing:.15em;color:var(--dark)">ANÁLISIS DE RESULTADOS</div>
      <div style="display:flex;gap:.4rem">
        <button class="edit-btn secondary" style="font-size:.58rem" onclick="cl2EditAnalisis('fortalezas')">✏️ Editar fortalezas</button>
        <button class="edit-btn secondary" style="font-size:.58rem" onclick="cl2EditAnalisis('focos')">✏️ Editar focos</button>
        <button class="edit-btn secondary" style="font-size:.58rem" onclick="cl2CorregirAnalisis()">🔤 Corregir</button>
      </div>
    </div>
    ${m.fortalezas ? `
    <div style="margin-bottom:1rem" id="analisis-fortalezas-view">
      <div style="font-size:.58rem;font-weight:800;letter-spacing:.12em;color:#27ae60;
        border-left:3px solid #27ae60;padding-left:.5rem;margin-bottom:.5rem">FORTALEZAS DETECTADAS</div>
      <ul style="margin:0;padding-left:1.2rem;list-style:disc">${toBullets(m.fortalezas)}</ul>
    </div>` : ''}
    ${m.focos ? `
    <div id="analisis-focos-view">
      <div style="font-size:.58rem;font-weight:800;letter-spacing:.12em;color:#c0392b;
        border-left:3px solid #c0392b;padding-left:.5rem;margin-bottom:.5rem">FOCOS ROJOS / ÁREAS DE ATENCIÓN</div>
      <ul style="margin:0;padding-left:1.2rem;list-style:disc">${toBullets(m.focos)}</ul>
    </div>` : ''}`;
  resBody.appendChild(div);
}

function cl2EditAnalisis(campo) {
  const m = CL2_STATE.meta || {};
  const actual = m[campo === 'fortalezas' ? 'fortalezas' : 'focos'] || '';
  const label = campo === 'fortalezas' ? 'FORTALEZAS DETECTADAS' : 'FOCOS ROJOS / ÁREAS DE ATENCIÓN';
  const uid = 'analisis-edit-' + campo;

  // Si ya hay un editor abierto, cerrarlo
  document.getElementById(uid)?.remove();

  const div = document.createElement('div');
  div.id = uid;
  div.style.cssText = 'margin:8px 0;padding:10px;background:#fffdf5;border:1.5px solid var(--gold);border-radius:6px';
  div.innerHTML = `
    <div style="font-size:.6rem;font-weight:800;letter-spacing:.1em;color:var(--mid);margin-bottom:.4rem">${label}</div>
    <div style="font-size:.62rem;color:var(--mid);margin-bottom:.4rem">Un punto por línea</div>
    <textarea id="ta-${uid}" class="edit-textarea" rows="6" style="min-height:100px">${actual}</textarea>
    <div class="edit-toolbar">
      <button class="edit-btn ok" onclick="cl2SaveAnalisis('${campo}','${uid}')">✓ Guardar</button>
      <button class="edit-btn secondary" onclick="cl2CorregirCampoAnalisis('${campo}','${uid}')">🔤 Corregir ortografía</button>
      <button class="edit-btn danger" onclick="document.getElementById('${uid}')?.remove()">✕ Cancelar</button>
      <span class="edit-status" id="${uid}-status"></span>
    </div>`;

  const target = document.getElementById('analisis-' + campo + '-view')
    || document.querySelector('.cl2-analisis-append');
  if (target) target.insertAdjacentElement('afterend', div);
  else document.getElementById('cl2-resumen-body')?.appendChild(div);
  document.getElementById('ta-' + uid)?.focus();
}

function cl2SaveAnalisis(campo, uid) {
  const ta = document.getElementById('ta-' + uid);
  if (!ta) return;
  if (!CL2_STATE.meta) CL2_STATE.meta = {};
  CL2_STATE.meta[campo] = ta.value.trim();
  markDirty();
  document.getElementById(uid)?.remove();
  renderCl2AnalisisBlock();
  if (CL2_STATE.resumen?.length) renderCl2Resumen(CL2_STATE.resumen);
  showToast('✓ ' + (campo === 'fortalezas' ? 'Fortalezas' : 'Focos') + ' guardados');
}

function makeEditable(containerEl, getText, onSave) {
  /* Convierte un elemento en editable con corrección ortográfica AI */
  containerEl.classList.add('editable-block');

  // Botón editar flotante
  const controls = document.createElement('div');
  controls.className = 'edit-controls';
  controls.innerHTML = `<button class="edit-btn" onclick="this.closest('.editable-block')._startEdit()">✏️ Editar</button>`;
  containerEl.appendChild(controls);

  containerEl._startEdit = function() {
    const currentText = getText();
    const ta = document.createElement('textarea');
    ta.className = 'edit-textarea';
    ta.value = currentText;
    ta.rows = Math.max(3, (currentText.match(/\n/g)||[]).length + 3);

    const toolbar = document.createElement('div');
    toolbar.className = 'edit-toolbar';
    toolbar.innerHTML = `
      <button class="edit-btn ok" onclick="this.closest('.editable-block')._saveEdit()">✓ Guardar</button>
      <button class="edit-btn secondary" onclick="this.closest('.editable-block')._fixOrtografia()">🔤 Corregir ortografía</button>
      <button class="edit-btn danger" onclick="this.closest('.editable-block')._cancelEdit()">✕ Cancelar</button>
      <span class="edit-status" id="edit-status-${Date.now()}"></span>`;

    // Ocultar contenido original y controles
    containerEl._origHTML = containerEl.innerHTML;
    containerEl.innerHTML = '';
    containerEl.appendChild(ta);
    containerEl.appendChild(toolbar);
    containerEl._ta = ta;
    controls.style.opacity = '0';

    containerEl._saveEdit = function() {
      const newText = ta.value.trim();
      if (newText) onSave(newText);
      markDirty && markDirty();
    };

    containerEl._cancelEdit = function() {
      containerEl.innerHTML = containerEl._origHTML;
      containerEl.appendChild(controls);
    };

    containerEl._fixOrtografia = async function() {
      if (!STATE?.apiKey?.startsWith('sk-ant-')) { showToast('API Key requerida'); return; }
      const statusEl = toolbar.querySelector('.edit-status');
      statusEl.textContent = 'Corrigiendo…';
      const textoActual = ta.value.trim();
      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': STATE.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{ role: 'user', content:
              `Corrige la ortografía y gramática del siguiente texto en español. ` +
              `Mantén el mismo significado, tono profesional y estructura. ` +
              `Responde ÚNICAMENTE con el texto corregido, sin explicaciones ni comillas:\n\n${textoActual}`
            }]
          })
        });
        const data = await resp.json();
        const corregido = data.content?.[0]?.text?.trim();
        if (corregido) {
          ta.value = corregido;
          statusEl.textContent = '✓ Texto corregido';
          setTimeout(() => statusEl.textContent = '', 3000);
        }
      } catch(e) {
        statusEl.textContent = 'Error: ' + e.message;
      }
    };
  };
}

function hzEditItem(cat, idx) {
  const li = document.getElementById(`hz-item-${cat}-${idx}`);
  if (!li) return;
  const origText = HZ_STATE.clasificados[cat][idx];
  const uid = `hz-${cat}-${idx}`;
  li.innerHTML = `
    <textarea id="ta-${uid}" class="edit-textarea" rows="2" style="margin:.2rem 0">${origText}</textarea>
    <div class="edit-toolbar" style="margin-top:.2rem">
      <button class="edit-btn ok" onclick="hzSaveItem('${cat}',${idx})">✓ Guardar</button>
      <button class="edit-btn secondary" onclick="hzCorregirItem('${cat}',${idx},'${uid}')">🔤 Corregir</button>
      <button class="edit-btn danger" onclick="renderSummaries()">✕ Cancelar</button>
      <span class="edit-status" id="${uid}-status"></span>
    </div>`;
}

function hzSaveItem(cat, idx) {
  const uid = `hz-${cat}-${idx}`;
  const ta = document.getElementById('ta-' + uid);
  if (!ta) return;
  HZ_STATE.clasificados[cat][idx] = ta.value.trim();
  markDirty();
  renderSummaries();
  showToast('✓ Hallazgo guardado');
}

async function planCorregirFila(idx) {
  if (!STATE?.apiKey?.startsWith('sk-ant-')) { showToast('API Key requerida'); return; }
  const item = HZ_STATE.planAccion[idx];
  if (!item) return;
  showToast('Corrigiendo ortografía…');
  const campos = ['hallazgo','solucion','mejora'];
  for (const campo of campos) {
    if (!item[campo]?.trim()) continue;
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':STATE.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:512,
          messages:[{role:'user',content:`Corrige ortografía y gramática en español. Mantén el mismo significado. Solo devuelve el texto corregido:

${item[campo]}`}] })
      });
      const data = await resp.json();
      const c = data.content?.[0]?.text?.trim();
      if (c) item[campo] = c;
    } catch(e) {}
  }
  markDirty();
  renderPlanAccion();
  showToast('✓ Fila corregida');
}

function delPhoto(pid) {
  // Si ya está en papelera, cancelar y borrar definitivo ahora
  if (_trashBin[pid]) {
    _confirmDeletePhoto(pid);
    return;
  }

  const photo = findPhoto(pid);
  if (!photo) return;

  // Encontrar el área donde está
  let areaId = null;
  for (const aId in STATE.areas) {
    if (STATE.areas[aId].photos.find(p => p.id === pid)) { areaId = aId; break; }
  }
  if (!areaId) return;

  // Mover a papelera temporal (ocultar de la grid pero no borrar aún)
  photo._trashed = true;
  for (const aId in STATE.areas) {
    STATE.areas[aId].photos = STATE.areas[aId].photos.filter(p => p.id !== pid);
  }
  renderGrid(); renderAreaNav(); updateProgress(); updateAnalyzeBtn();

  // Toast con countdown y opción de deshacer
  const toastId = 'trash-toast-' + pid;
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.style.cssText = `position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
    background:#1a2533;color:#fff;padding:.65rem 1.1rem;border-radius:8px;
    display:flex;align-items:center;gap:.75rem;z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.35);font-size:.76rem;min-width:260px;
    animation:slideUp .2s ease`;
  toast.innerHTML = `
    <span id="${toastId}-msg">Foto eliminada · <strong id="${toastId}-cnt">10</strong>s</span>
    <button onclick="undoDeletePhoto('${pid}')" style="background:var(--gold);border:none;
      color:#fff;border-radius:5px;padding:.25rem .7rem;font-size:.7rem;
      font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0">↩ Deshacer</button>`;
  document.body.appendChild(toast);

  // Countdown
  let secs = 10;
  const interval = setInterval(() => {
    secs--;
    const cntEl = document.getElementById(`${toastId}-cnt`);
    if (cntEl) cntEl.textContent = secs;
    if (secs <= 0) {
      clearInterval(interval);
      _confirmDeletePhoto(pid);
    }
  }, 1000);

  _trashBin[pid] = { photo, areaId, timer: interval, toastEl: toast };
}

function undoDeletePhoto(pid) {
  const entry = _trashBin[pid];
  if (!entry) return;
  clearInterval(entry.timer);
  // Restaurar foto al área
  entry.photo._trashed = false;
  STATE.areas[entry.areaId].photos.push(entry.photo);
  renderGrid(); renderAreaNav(); updateProgress(); updateAnalyzeBtn(); markDirty();
  if (entry.toastEl) entry.toastEl.remove();
  delete _trashBin[pid];
  showToast('Foto restaurada');
}

function _confirmDeletePhoto(pid) {
  const entry = _trashBin[pid];
  if (entry) {
    clearInterval(entry.timer);
    if (entry.toastEl) entry.toastEl.remove();
    if (entry.photo?.displayUrl) URL.revokeObjectURL(entry.photo.displayUrl);
    if (entry.photo?.id) idbDeletePhoto(entry.photo.id);
    delete _trashBin[pid];
  }
  markDirty();
}

function renderAreaNav() {
  const nav = document.getElementById('area-nav');
  nav.innerHTML = AREAS.map((a, i) => {
    const photos = STATE.areas[a.id].photos;
    const col    = areaColor(photos);
    const cnt    = photos.length;
    const conf   = photos.filter(p => p.state === 'confirmed').length;
    const active = a.id === STATE.currentArea;
    const badge  = cnt ? `<span class="ani-badge" style="background:${col}">${conf}/${cnt}</span>` : '';
    return `<div class="ani ${active ? 'active' : ''}" data-area="${a.id}" data-idx="${i}"
      draggable="true"
      onclick="switchArea('${a.id}')"
      ondragstart="areaDragStart(event,${i})"
      ondragover="areaDragOver(event,${i})"
      ondragleave="areaDragLeave(event)"
      ondrop="areaDrop(event,${i})"
      ondragend="areaDragEnd()">
      <span class="ani-drag-handle" title="Arrastrar para reordenar">⠿</span>
      <div class="ani-dot" style="background:${col}"></div>
      <div class="ani-info">
        <div style="display:flex;align-items:center;gap:2px;">
          <span class="ani-name" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.name}</span>
          <button class="ani-edit-btn" onclick="event.stopPropagation();openEditArea('${a.id}')" title="Editar área"></button>
          <button class="ani-del-btn"  onclick="event.stopPropagation();confirmDeleteArea('${a.id}')" title="Eliminar área">×</button>
        </div>
        <div class="ani-meta">${badge}<span>${cnt} foto${cnt !== 1 ? 's' : ''}</span></div>
      </div>
    </div>`;
  }).join('');
  nav.innerHTML += `<div class="sb-reorder-hint" onclick="openReorderAreas()">↕ Reordenar áreas</div>`;
  updateGlobalStats();
  if (document.getElementById('dash-view').style.display !== 'none') buildDash();
}

function renderCl2VistaPregunta() {
  const wrap = document.getElementById('cl2-pregunta-wrap');
  if (!wrap) return;

  const colabs = CL2_STATE.colaboradores;
  const coLabsOrdenados = [...colabs].sort((a, b) => cl2LetraColab(a).localeCompare(cl2LetraColab(b)));
  const activos = coLabsOrdenados.filter(c => Object.values(c.respuestas).some(r => r?.trim()));
  const todos   = activos.length ? activos : coLabsOrdenados;

  const html = CL2_PREGUNTAS.map((q, qi) => {
    const respRows = todos.map(c => {
      const resp = c.respuestas[qi]?.trim();
      if (!resp) return '';
      const letra  = cl2LetraColab(c);
      const uid    = `pv-${c.id}-${qi}`;
      return `<div id="${uid}-row" style="display:flex;gap:.75rem;padding:.65rem 0;border-bottom:1px solid var(--border);align-items:flex-start">
        <div style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--gold);
          color:#fff;font-size:.62rem;font-weight:800;display:flex;align-items:center;
          justify-content:center;margin-top:2px">${letra}</div>
        <div style="flex:1">
          <div style="font-size:.68rem;font-weight:700;color:var(--mid);margin-bottom:.15rem;display:flex;align-items:center;justify-content:space-between">
            <span>Colaborador ${letra}</span>
            <div style="display:flex;gap:.25rem">
              <button class="edit-btn secondary" style="font-size:.54rem;padding:.12rem .38rem"
                onclick="pvEditarRespuesta('${c.id}',${qi},'${uid}')" title="Editar">✏️</button>
              <button class="edit-btn secondary" style="font-size:.54rem;padding:.12rem .38rem"
                onclick="pvCorregirRespuesta('${c.id}',${qi},'${uid}')" title="Corregir ortografía">🔤</button>
            </div>
          </div>
          <div id="${uid}-text" style="font-size:.8rem;color:var(--dark);line-height:1.55;text-align:justify">
            ${esc(resp)}
          </div>
        </div>
      </div>`;
    }).filter(Boolean).join('');

    if (!respRows) return '';

    return `<div style="background:#fff;border-radius:var(--r);border:1px solid var(--border);
      margin-bottom:1rem;overflow:hidden">
      <div style="background:var(--dark);padding:.6rem 1.1rem;display:flex;align-items:center;gap:.6rem">
        <span style="background:var(--gold);color:#fff;font-size:.65rem;font-weight:800;
          width:22px;height:22px;border-radius:50%;display:flex;align-items:center;
          justify-content:center;flex-shrink:0">${qi+1}</span>
        <span style="font-size:.82rem;font-weight:700;color:#fff;letter-spacing:.02em">
          ${esc(q)}
        </span>
      </div>
      <div style="padding:.3rem 1.1rem">${respRows}</div>
    </div>`;
  }).filter(Boolean).join('');

  wrap.innerHTML = html || `<div style="padding:2rem;text-align:center;color:var(--mid)">
    Sin respuestas cargadas. Carga el documento primero.</div>`;
}

// Re-renderizar nav con drag handles
try { renderAreaNav(); } catch(e) {}
// Aplicar ECT_COLORS
window.ECT_COLORS = {1:'#C0392B',2:'#E07B00',3:'#F5C518',4:'#84CC16',5:'#2E7D32'};
showToast('✅ Funciones actualizadas — Mover fotos, módulos y más disponibles');