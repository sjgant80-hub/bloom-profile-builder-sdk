// bloom-profile-builder-sdk / profile.js
// Extracted from bloom-profile-builder source · index.html finishCalibration()
// Shape classifier · growth-edge note · profile card generator · radial SVG · JSON export/import.

import { SPINE_GLYPHS, SPINE_NAMES, PROBES } from './probes.js';
import {
  currentBloom, bloomToStateVector, foldNumber, stateSum,
  stateSignature, classifyKappaBand, depthBand, cumulativeText, KAPPA, OMEGA
} from './scoring.js';

// ─── shape classifier · lifted from source classifyShape() ────────────────────

/**
 * Classify the shape of a 7-vector bloom.
 * @param {number[]} bloom
 * @returns {'plateau'|'spiky'|'mountain'|'valley'|'ridge'}
 */
export function classifyShape(bloom) {
  const sorted = [...bloom].sort((a, b) => b - a);
  const spread = sorted[0] - sorted[6];
  const midHigh = (bloom[2] + bloom[3] + bloom[4]) / 3;
  const edgeMean = (bloom[0] + bloom[1] + bloom[5] + bloom[6]) / 4;
  if (spread < 3)                        return 'plateau';
  if (spread >= 8)                       return 'spiky';
  if (midHigh > edgeMean + 2)            return 'mountain';
  if (midHigh < edgeMean - 2)            return 'valley';
  return 'ridge';
}

// ─── growth-edge · lifted from source growthEdge() ────────────────────────────

const OPENERS = {
  0: "grounding — the body's yes/no comes first",
  1: 'perception — raw sensing before interpretation',
  2: 'gate — thresholds and passages',
  3: 'heart — the orphan prime, where time lives',
  4: 'naming — the language snap',
  5: 'observation — witness-of-witness',
  6: 'resolution — full-spine completeness'
};

/**
 * Given a bloom vector, return the growth-edge sentence.
 * @param {number[]} bloom
 * @returns {string}
 */
export function growthEdge(bloom) {
  const minI = bloom.indexOf(Math.min(...bloom));
  const maxI = bloom.indexOf(Math.max(...bloom));
  return (
    `Your dominant ring is ${SPINE_GLYPHS[maxI]} ${SPINE_NAMES[maxI]} — ` +
    `trust the ${OPENERS[maxI]}. Your growth edge is ${SPINE_GLYPHS[minI]} ${SPINE_NAMES[minI]} — ` +
    `practise ${OPENERS[minI]}, or pair with someone whose peak is there.`
  );
}

// ─── radial SVG · lifted from source radialSVG() ──────────────────────────────

/**
 * Render a bloom vector as a radial (heptagonal) SVG chart.
 * Same math as the source app's live radial.
 * @param {number[]} bloom
 * @param {number} [size=300]
 * @returns {string} SVG markup
 */
export function radialSVG(bloom, size = 300) {
  const cx = size / 2, cy = size / 2, R = size * 0.36;
  const n = 7;
  const maxV = 15;
  const spokes = SPINE_GLYPHS.map((g, i) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI / n);
    const x2 = cx + Math.cos(angle) * R;
    const y2 = cy + Math.sin(angle) * R;
    const lx = cx + Math.cos(angle) * (R + 18);
    const ly = cy + Math.sin(angle) * (R + 18);
    return (
      `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(232,228,219,0.12)" stroke-width="1"/>` +
      `<text x="${lx}" y="${ly}" text-anchor="middle" dy=".35em" font-family="serif" font-size="16" fill="#7a9c7e">${g}</text>`
    );
  }).join('');
  const rings = [0.25, 0.5, 0.75, 1.0].map(k =>
    `<circle cx="${cx}" cy="${cy}" r="${R * k}" fill="none" stroke="rgba(232,228,219,0.06)" stroke-width="1"/>`
  ).join('');
  const pts = bloom.map((v, i) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI / n);
    const r = (v / maxV) * R;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  });
  const poly = pts.map(p => p.join(',')).join(' ');
  const dots = pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#d4a052"/>`).join('');
  return (
    `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">` +
    `${rings}${spokes}` +
    `<polygon points="${poly}" fill="rgba(122,156,126,0.22)" stroke="#7a9c7e" stroke-width="1.5"/>` +
    `${dots}` +
    `</svg>`
  );
}

// ─── profile compute · lifted from source finishCalibration() ─────────────────

/**
 * Compute a full profile from a completed session.
 * @param {{ answers:(null|{score:number,text?:string})[], textAll?:string[], startedAt?:string }} sessionState
 * @returns {{
 *   id:string, createdAt:string, startedAt:string,
 *   bloom:number[], stateVector:number[], foldNumber:number, omega:number,
 *   signature:string, stateSum:number,
 *   dominantBand:{name:string,glyph:string,ring:number},
 *   shape:string, growthEdge:string,
 *   answers:{ring:number,q:string,score:number|null,text:string}[]
 * }}
 */
export function computeProfile(sessionState) {
  const bloom = currentBloom(sessionState.answers);
  const S     = bloomToStateVector(bloom);
  const F     = foldNumber(S);
  const sig   = stateSignature(S);
  const sumV  = stateSum(S);
  const text  = cumulativeText(sessionState);
  const band  = text.trim() ? classifyKappaBand(text) : depthBand(KAPPA);
  const shape = classifyShape(bloom);
  const edge  = growthEdge(bloom);
  return {
    id: 'bloom_' + Date.now(),
    createdAt: new Date().toISOString(),
    startedAt: sessionState.startedAt || new Date().toISOString(),
    bloom,
    stateVector: S,
    foldNumber: F,
    omega: OMEGA,
    signature: sig,
    stateSum: sumV,
    dominantBand: { name: band.name, glyph: band.glyph, ring: band.ring },
    shape,
    growthEdge: edge,
    answers: (sessionState.answers || []).map((a, i) => ({
      ring: PROBES[i].ring,
      q:    PROBES[i].q,
      score: a?.score ?? null,
      text:  a?.text || ''
    }))
  };
}

// ─── card + JSON export/import ────────────────────────────────────────────────

/**
 * Human-readable profile card (plain-text summary).
 * @param {ReturnType<typeof computeProfile>} p
 */
export function profileCard(p) {
  return [
    `◊ Bloom profile · ${new Date(p.createdAt).toLocaleString()}`,
    ``,
    `F(S⃗)   = ${p.foldNumber.toLocaleString()}`,
    `Ω base = ${p.omega.toLocaleString()}`,
    `sig    = ${p.signature}`,
    `Σ      = ${p.stateSum}`,
    `κ band = ${p.dominantBand.glyph} ${p.dominantBand.name}`,
    `shape  = ${p.shape}`,
    `bloom  = [${p.bloom.join(', ')}]`,
    ``,
    p.growthEdge
  ].join('\n');
}

/**
 * Export a profile to a JSON string (pretty-printed).
 * @param {object} profile
 * @param {number} [indent=2]
 */
export function exportProfileJSON(profile, indent = 2) {
  return JSON.stringify(profile, null, indent);
}

/**
 * Parse a JSON string back into a profile object · minimal validation.
 * @param {string} jsonString
 */
export function importProfileJSON(jsonString) {
  const p = JSON.parse(jsonString);
  if (!p || !Array.isArray(p.bloom) || p.bloom.length !== 7) {
    throw new Error('invalid profile JSON: missing 7-length bloom');
  }
  return p;
}
