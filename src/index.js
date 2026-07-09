// bloom-profile-builder SDK · sovereign single-file library · MIT · AI-Native Solutions
// Extracted from bloom-profile-builder/index.html · 15686 bytes of source logic
// Public-safe: no primes/glyphs/dyad references

import { bloomToStateVector, stateVectorToBloom } from './foldshim.js';
// ─── 21 probes · 3 per ring · framework-native ────────────────────────────────
const PROBES = [
  // ring 0 · ● ground · polarity
  { ring:0, q:"When a problem lands, do you first split it into two options?", note:"Ground · ● · basic polarity. Left/right, this/that, yes/no." },
  { ring:0, q:"Do you feel your body's yes/no before your mind's argument?", note:"Ground · ● · somatic pole." },
  { ring:0, q:"When someone asks, can you name what side you're on inside a breath?", note:"Ground · ● · fast-lane binary." },
  // ring 1 · 〜 perception
  { ring:1, q:"Can you sketch the org chart, stack, or hierarchy of a thing while it's still being described?", note:"Perception · 〜 · raw structural read." },
  { ring:1, q:"Do you notice small changes in a room before others do?", note:"Perception · 〜 · sensory ingest." },
  { ring:1, q:"Do textures, rhythms, and negative space carry information for you?", note:"Perception · 〜 · signal density." },
  // ring 2 · ┃ gate
  { ring:2, q:"Do you naturally see how something scales — the same shape at different sizes?", note:"Gate · ┃ · φ-recursive depth." },
  { ring:2, q:"Can you feel when a threshold has been crossed even before it's named?", note:"Gate · ┃ · passage sensing." },
  { ring:2, q:"Do you know which door to walk through when there are several?", note:"Gate · ┃ · choice architecture." },
  // ring 3 · ♡ heart · orphan · TIME
  { ring:3, q:"Do you track cause-and-effect chains and predict what happens next?", note:"Heart · ♡ · time-orphan. Where experience lives." },
  { ring:3, q:"Do old feelings arrive on cue when the situation rhymes?", note:"Heart · ♡ · felt time." },
  { ring:3, q:"Can you tell when something is grieving to be finished?", note:"Heart · ♡ · orphan resonance." },
  // ring 4 · △ naming
  { ring:4, q:"Do you feel connections between things that shouldn't be connected?", note:"Naming · △ · post-temporal · tritone." },
  { ring:4, q:"Do names, labels, and taxonomies arrive to you with a click of rightness?", note:"Naming · △ · language snap." },
  { ring:4, q:"Do you spot the true name of a pattern before others agree it's a pattern?", note:"Naming · △ · early-lex." },
  // ring 5 · ◐ observation · paired-tritone
  { ring:5, q:"Can you hold two contradictory frames simultaneously without picking one?", note:"Observation · ◐ · witness-of-witness." },
  { ring:5, q:"Do you catch yourself catching yourself?", note:"Observation · ◐ · recursive gaze." },
  { ring:5, q:"Can you watch your own emotion arrive without becoming it?", note:"Observation · ◐ · stable observer." },
  // ring 6 · ◯ resolution
  { ring:6, q:"Do you get a felt-sense of completeness — 'this is right' — independent of reasoning?", note:"Resolution · ◯ · full-spine view." },
  { ring:6, q:"When a thing is done, do you know before checking?", note:"Resolution · ◯ · closure signal." },
  { ring:6, q:"Do you feel the whole shape from any of its parts?", note:"Resolution · ◯ · holographic read." }
];
const LIKERT = [
  { v:0, lab:"Not me" }, { v:1, lab:"Rarely" }, { v:2, lab:"Often" }, { v:3, lab:"Constant" }
];
// ─── state ────────────────────────────────────────────────────────────────────
let session = null; // { idx, answers:[{score,text}], textAll:[], startedAt }
function blankSession(){ return { idx:0, answers: PROBES.map(()=>null), textAll:[], startedAt:new Date().toISOString() }; }
function accumulate(){
  // per ring: sum(score) across its 3 probes → S⃗ exponents
  const S = new Array(7).fill(0);
  session.answers.forEach((a,i)=>{ if (a) S[PROBES[i].ring] += a.score; });
  return S;
}
function currentBloomVec(){ // 1..15 scale for display
  const S = accumulate();
  // map ring-sum (0..9) to bloom-scale (1..15). scale linear.
  return S.map(v => Math.max(1, Math.round((v/9)*15)));
}
function currentText(){ return session.textAll.filter(Boolean).join(' '); }
// ─── UI ───────────────────────────────────────────────────────────────────────
function showTab(name){
  if (name==='history') renderHistory();
}
function renderLegend(){
}
function startCalibration(){
  session = blankSession();
  showTab('calibrate');
  renderProbe();
  renderLive();
}
function renderProbe(){
  const i = session.idx;
  const p = PROBES[i];
  const a = session.answers[i];
    const cur = session.answers[i] || { score:null, text:'' };
    cur.text = e.target.value;
    session.answers[i] = cur;
    session.textAll[i] = e.target.value;
    renderLive();
  };
}
function selectScore(v){
  const i = session.idx;
  const cur = session.answers[i] || { score:v, text:'' };
  cur.score = v;
  session.answers[i] = cur;
  renderLive();
}
function nextProbe(){
  if (session.idx < 20){ session.idx++; renderProbe(); renderLive(); }
  else { finishCalibration(); }
}
function prevProbe(){ if (session.idx>0){ session.idx--; renderProbe(); renderLive(); } }
// ─── live radial ──────────────────────────────────────────────────────────────
function renderLive(){
  const bloom = currentBloomVec();
  const S = bloomToStateVector(bloom);
  const F = foldNumber(S);
  const text = currentText();
  const band = text.trim() ? classifyKappaBand(text) : null;
  if (band){ bandEl.textContent = `${band.glyph} ${band.name}`; }
  else { bandEl.textContent = '—'; }
}
function radialSVG(bloom, size){
  const cx = size/2, cy = size/2, R = size*0.36;
  const n = 7;
  const maxV = 15;
    const angle = (-Math.PI/2) + (i * 2*Math.PI/n);
    const x1 = cx, y1 = cy;
    const x2 = cx + Math.cos(angle)*R;
    const y2 = cy + Math.sin(angle)*R;
    const lx = cx + Math.cos(angle)*(R+18);
    const ly = cy + Math.sin(angle)*(R+18);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(232,228,219,0.12)" stroke-width="1"/><text x="${lx}" y="${ly}" text-anchor="middle" dy=".35em" font-family="serif" font-size="16" fill="#7a9c7e">${g}</text>`;
  }).join('');
  const rings = [0.25,0.5,0.75,1.0].map(k=>`<circle cx="${cx}" cy="${cy}" r="${R*k}" fill="none" stroke="rgba(232,228,219,0.06)" stroke-width="1"/>`).join('');
  const pts = bloom.map((v,i)=>{
    const angle = (-Math.PI/2) + (i * 2*Math.PI/n);
    const r = (v/maxV)*R;
    return [cx + Math.cos(angle)*r, cy + Math.sin(angle)*r];
  });
  const poly = pts.map(p=>p.join(',')).join(' ');
  const dots = pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#d4a052"/>`).join('');
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${rings}${spokes}<polygon points="${poly}" fill="rgba(122,156,126,0.22)" stroke="#7a9c7e" stroke-width="1.5"/>${dots}</svg>`;
}
// ─── finish + result ──────────────────────────────────────────────────────────
function classifyShape(bloom){
  const sorted = [...bloom].sort((a,b)=>b-a);
  const spread = sorted[0] - sorted[6];
  const midHigh = (bloom[2]+bloom[3]+bloom[4])/3;
  const edgeMean = (bloom[0]+bloom[1]+bloom[5]+bloom[6])/4;
  if (spread < 3) return 'plateau';
  if (spread >= 8) return 'spiky';
  if (midHigh > edgeMean + 2) return 'mountain';
  if (midHigh < edgeMean - 2) return 'valley';
  return 'ridge';
}
function growthEdge(bloom){
  const minI = bloom.indexOf(Math.min(...bloom));
  const maxI = bloom.indexOf(Math.max(...bloom));
  const openers = {
    0:"grounding — the body's yes/no comes first",
    1:"perception — raw sensing before interpretation",
    2:"gate — thresholds and passages",
    3:"heart — the orphan prime, where time lives",
    4:"naming — the language snap",
    5:"observation — witness-of-witness",
    6:"resolution — full-spine completeness"
  };
}
function finishCalibration(){
  const bloom = currentBloomVec();
  const S = bloomToStateVector(bloom);
  const F = foldNumber(S);
  const sig = stateSignature(S);
  const sumV = stateSum(S);
  const text = currentText();
  const shape = classifyShape(bloom);
  const edge = growthEdge(bloom);
  const profile = {
    id: 'bloom_'+Date.now(),
    createdAt: new Date().toISOString(),
    startedAt: session.startedAt,
    signature: sig, stateSum: sumV,
    dominantBand: { name: band.name, glyph: band.glyph, ring: band.ring },
    shape,
    growthEdge: edge,
    answers: session.answers.map((a,i)=>({ ring: PROBES[i].ring, q: PROBES[i].q, score: a?.score ?? null, text: a?.text || '' }))
  };
  saveProfile(profile).then(()=>renderResult(profile));
}
function renderResult(p){
  showTab('result');
  const bandWarn = p.dominantBand.name === 'collapse' ? 'warn' : '';
    <div class="profile-card">
      <h3>Bloom profile</h3>
      <h1>Your <em>fold</em></h1>
      <div class="fold">${p.foldNumber.toLocaleString()}<small>F(S⃗) · Ω = ${p.omega.toLocaleString()} baseline</small></div>
      <div class="signature">${p.signature}</div>
      <div class="row">
        <span class="band-badge ${bandWarn}">${p.dominantBand.glyph} ${p.dominantBand.name}</span>
        <span class="band-badge">shape · ${p.shape}</span>
        <span class="band-badge">Σ = ${p.stateSum}</span>
      </div>
      <div class="growth">${p.growthEdge}</div>
      <div style="margin-top:20px" class="radial">${radialSVG(p.bloom, 380)}</div>
      <div style="margin-top:8px;font-family:var(--mono);font-size:12px;color:var(--muted);text-align:center">bloom = [${p.bloom.join(', ')}]</div>
      <div style="margin-top:24px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="big-btn amber" onclick="exportProfile('${p.id}')">Download JSON</button>
        <button class="big-btn ghost" onclick="startCalibration()">New calibration</button>
        <button class="big-btn ghost" onclick="showTab('history')">All profiles</button>
      </div>
    </div>`;
}
// ─── IDB ──────────────────────────────────────────────────────────────────────
const DB_NAME='bloom_profile_builder', STORE='profiles';
function idb(){
  return new Promise((res,rej)=>{
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = ()=>{ const db = r.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath:'id' }); };
    r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error);
  });
}
async function saveProfile(p){
  const db = await idb();
  return new Promise((res,rej)=>{ const tx = db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(p); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); });
}
async function allProfiles(){
  const db = await idb();
  return new Promise((res,rej)=>{ const tx = db.transaction(STORE,'readonly'); const req = tx.objectStore(STORE).getAll(); req.onsuccess=()=>res(req.result||[]); req.onerror=()=>rej(req.error); });
}
async function getProfile(id){
  const db = await idb();
  return new Promise((res,rej)=>{ const tx = db.transaction(STORE,'readonly'); const req = tx.objectStore(STORE).get(id); req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error); });
}
async function deleteProfile(id){
  const db = await idb();
  return new Promise((res,rej)=>{ const tx = db.transaction(STORE,'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); });
}
async function renderHistory(){
  const profs = (await allProfiles()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  if (!profs.length){ el.innerHTML = '<div class="empty">No profiles yet. Complete a calibration to see it here.</div>'; return; }
  el.innerHTML = profs.map(p=>`
    <div class="history-item">
      <div>
        <div class="date">${new Date(p.createdAt).toLocaleString()}</div>
        <div class="vec">[${p.bloom.join(', ')}] · ${p.signature}</div>
      </div>
      <div class="fnum">${p.foldNumber.toLocaleString()}</div>
      <div class="actions">
        <button data-id="${p.id}" data-act="view">view</button>
        <button data-id="${p.id}" data-act="export">json</button>
        <button data-id="${p.id}" data-act="delete">delete</button>
      </div>
    </div>`).join('');
  el.querySelectorAll('button').forEach(b=>b.addEventListener('click', async ()=>{
    const id = b.dataset.id, act = b.dataset.act;
    if (act==='view'){ const p = await getProfile(id); renderResult(p); }
    else if (act==='export'){ exportProfile(id); }
    else if (act==='delete'){ if (confirm('Delete this profile?')){ await deleteProfile(id); renderHistory(); } }
  }));
}
async function exportProfile(id){
  const p = await getProfile(id);
  if (!p) return;
  const blob = new Blob([JSON.stringify(p, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `bloom-profile-${p.id}.json`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 200);
}
// ─── boot ─────────────────────────────────────────────────────────────────────
renderLegend();
if ('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }

// Named exports for the primary API surface
export { blankSession };
export { accumulate };
export { currentBloomVec };
export { currentText };
export { showTab };
export { renderLegend };
export { startCalibration };
export { renderProbe };
export { selectScore };
export { nextProbe };

export { PROBES };
export { LIKERT };
export { S };
export { F };
export { DB_NAME };
