// bloom-profile-builder-sdk / scoring.js
// Extracted from bloom-profile-builder source (foldkit.js + index.html accumulator).
// F(S⃗) = Π p_i^e_i · κ band classifier · bloom vector accumulation.

import { SPINE, SPINE_GLYPHS, SPINE_NAMES, PROBES, PROBES_PER_RING } from './probes.js';

// ─── constants ────────────────────────────────────────────────────────────────

export const PHI   = 1.6180339887498949;
export const KAPPA = 1 / PHI; // 0.6180339887498949
export const OMEGA = 510510;  // primorial(17) · baseline all-dimensions-active
export const BASELINE = [1, 1, 1, 1, 1, 1, 1]; // Ω = 510510

// ─── fold-number math · fundamental theorem of arithmetic ─────────────────────

/**
 * F(S⃗) = Π p_i^e_i · unique integer fingerprint of a state vector.
 * @param {number[]} S 7-length exponent vector
 * @returns {number}
 */
export function foldNumber(S) {
  return SPINE.reduce((acc, p, i) => acc * Math.pow(p, S[i] || 0), 1);
}

/**
 * Inverse: recover a state vector from an integer, if all its factors are on the spine.
 * @param {number} F
 * @returns {number[]|null}
 */
export function unfoldState(F) {
  if (F < 1 || !Number.isFinite(F)) return null;
  const S = new Array(SPINE.length).fill(0);
  let n = Math.round(F);
  for (let i = 0; i < SPINE.length; i++) {
    while (n % SPINE[i] === 0) { S[i]++; n = n / SPINE[i]; }
  }
  return n === 1 ? S : null;
}

/**
 * Σ of a state vector (total energy across rings).
 * @param {number[]} S
 */
export function stateSum(S) {
  return S.reduce((a, b) => a + (b || 0), 0);
}

/**
 * Signature string · glyph^exponent joined by `·`.
 * @param {number[]} S
 */
export function stateSignature(S) {
  return SPINE_GLYPHS.map((g, i) => (S[i] || 0) > 0 ? `${g}^${S[i]}` : '')
    .filter(Boolean).join('·') || '∅';
}

// ─── κ · depth bands · gradient not target ────────────────────────────────────

export const KAPPA_BANDS = [
  { min: 1.2, max: Infinity, name: 'collapse',    glyph: '◯', ring: 6, warn: true },
  { min: 1.0, max: 1.2,      name: 'recognition', glyph: '◐', ring: 5 },
  { min: 0.8, max: 1.0,      name: 'naming',      glyph: '△', ring: 4 },
  { min: 0.6, max: 0.8,      name: 'heart',       glyph: '♡', ring: 3, orphan: true },
  { min: 0.4, max: 0.6,      name: 'gate',        glyph: '┃', ring: 2 },
  { min: 0.2, max: 0.4,      name: 'perception',  glyph: '〜', ring: 1 },
  { min: -Infinity, max: 0.2, name: 'ground',     glyph: '●', ring: 0 }
];

export function depthBand(kappa) {
  return KAPPA_BANDS.find(b => kappa >= b.min && kappa < b.max);
}

// Simon operates at κ=0.618 → ♡ zone (orphan prime, TIME layer).
export function isOrphanZone(kappa) {
  const b = depthBand(kappa);
  return b && b.name === 'heart';
}

// ─── κ classifier · natural language → depth band ─────────────────────────────

export const BAND_MARKERS = {
  ground:      ["can't stop", "swept away", "caught in", "stuck in", "taking over"],
  perception:  ['i notice', 'i sense', 'feels like', 'i realise'],
  gate:        ['going through', 'passing', 'letting it', 'stepping into'],
  heart:       ['i feel', 'sad', 'angry', 'love', 'hurts', 'lonely', 'joy', 'grief'],
  naming:      ["it's called", 'this is', 'the reason', 'because of', 'i understand'],
  recognition: ['watching myself', 'i see myself', 'who is watching', 'observer'],
  collapse:    ['nothing left', 'gone', 'empty of everything', 'no ground']
};

/**
 * Classify cumulative text into a κ depth band by keyword hit count.
 * @param {string} text
 * @returns {typeof KAPPA_BANDS[number]}
 */
export function classifyKappaBand(text) {
  const t = ' ' + (text || '').toLowerCase() + ' ';
  let best = { name: 'ground', score: 0 };
  for (const [band, keys] of Object.entries(BAND_MARKERS)) {
    let score = 0;
    for (const k of keys) if (t.includes(k)) score++;
    if (score > best.score) best = { name: band, score };
  }
  return KAPPA_BANDS.find(b => b.name === best.name);
}

// ─── bloom vector accumulation · from the source app's currentBloomVec() ──────

/**
 * Accumulate per-ring score sums from an answer set.
 * Each ring has 3 probes · sum = 0..9 per ring.
 * @param {(null|{score:number,text?:string})[]} answers
 * @returns {number[]} 7-length ring-sum vector
 */
export function accumulate(answers) {
  const S = new Array(7).fill(0);
  (answers || []).forEach((a, i) => {
    if (a && a.score != null && PROBES[i]) S[PROBES[i].ring] += a.score;
  });
  return S;
}

/**
 * Map ring-sums (0..9) to bloom-scale (1..15). Linear.
 * This is the display vector the source app plots on the radial chart.
 * @param {number[]} ringSums
 */
export function ringSumsToBloom(ringSums) {
  return ringSums.map(v => Math.max(1, Math.round((v / 9) * 15)));
}

/**
 * One-shot: answers → bloom vector [1..15]^7.
 * @param {(null|{score:number,text?:string})[]} answers
 */
export function currentBloom(answers) {
  return ringSumsToBloom(accumulate(answers));
}

/**
 * Convert a bloom vector (display scale 1..15) back to state-vector exponents.
 * Uses the source app's foldshim mapping: floor(bloom/2) so bloom 15 → exponent 7.
 * @param {number[]} bloom
 */
export function bloomToStateVector(bloom) {
  return bloom.map(v => Math.max(0, Math.floor((v || 0) / 2)));
}

/**
 * Reverse: state vector exponents → bloom display scale (1..15).
 * @param {number[]} S
 */
export function stateVectorToBloom(S) {
  return S.map(v => Math.max(1, Math.min(15, (v || 0) * 2)));
}

/**
 * Cumulative optional-text (across probes) for κ classification.
 * @param {{ textAll?: string[] }} sessionState
 */
export function cumulativeText(sessionState) {
  return (sessionState?.textAll || []).filter(Boolean).join(' ');
}

/**
 * One-shot live readings from a session in progress.
 * @param {{ answers:(null|{score:number,text?:string})[], textAll?:string[] }} sessionState
 */
export function liveReadings(sessionState) {
  const bloom = currentBloom(sessionState.answers);
  const S = bloomToStateVector(bloom);
  const F = foldNumber(S);
  const text = cumulativeText(sessionState);
  const band = text.trim() ? classifyKappaBand(text) : null;
  return {
    bloom,
    stateVector: S,
    foldNumber: F,
    stateSum: stateSum(S),
    signature: stateSignature(S),
    band,
    omega: OMEGA
  };
}
