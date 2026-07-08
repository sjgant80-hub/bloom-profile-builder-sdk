// @ai-native-solutions/bloom-profile-builder-sdk
// Sovereign SDK for the Bloom Profile Builder · 7-ring calibration · κ classifier · F(S⃗) fingerprint.
// All algorithms extracted directly from the bloom-profile-builder source (index.html + foldkit.js).
// Runs identically in Node.js and browsers · IndexedDB helpers browser-only.

export {
  RINGS, SPINE, SPINE_GLYPHS, SPINE_NAMES,
  PROBES, LIKERT, PROBE_COUNT, PROBES_PER_RING,
  probeAt, nextProbe, blankSession
} from './probes.js';

export {
  PHI, KAPPA, OMEGA, BASELINE,
  foldNumber, unfoldState, stateSum, stateSignature,
  KAPPA_BANDS, depthBand, isOrphanZone,
  BAND_MARKERS, classifyKappaBand,
  accumulate, ringSumsToBloom, currentBloom,
  bloomToStateVector, stateVectorToBloom,
  cumulativeText, liveReadings
} from './scoring.js';

export {
  classifyShape, growthEdge, radialSVG,
  computeProfile, profileCard,
  exportProfileJSON, importProfileJSON
} from './profile.js';

export {
  DB_NAME, DB_VERSION, STORE,
  openDB, saveProfile, getProfile, allProfiles, deleteProfile, clearAll
} from './storage.js';

// ─── Session helper · stateful wrapper around the primitives ──────────────────

import { PROBES, PROBE_COUNT, blankSession as makeBlank, probeAt } from './probes.js';
import { liveReadings } from './scoring.js';
import { computeProfile } from './profile.js';

/**
 * Create an in-memory bloom-profile-builder session.
 * Not required to use the SDK · you can call the primitives directly.
 * @param {{ startedAt?:string }} [opts]
 */
export function createSession(opts = {}) {
  const state = makeBlank();
  if (opts.startedAt) state.startedAt = opts.startedAt;

  function currentProbe() {
    if (state.idx >= PROBE_COUNT) return null;
    return probeAt(state.idx);
  }

  function firstProbe() {
    state.idx = 0;
    return currentProbe();
  }

  /**
   * Record an answer for the current probe and advance the index.
   * @param {{ score:number, text?:string }} answer
   */
  function answer({ score, text }) {
    if (state.idx >= PROBE_COUNT) throw new Error('session already complete');
    if (score == null || score < 0 || score > 3) throw new Error('score must be 0..3');
    state.answers[state.idx] = { score, text: text || '' };
    state.textAll[state.idx] = text || '';
    state.idx++;
    const done = state.idx >= PROBE_COUNT;
    return {
      done,
      live: liveReadings(state),
      next: done ? null : currentProbe()
    };
  }

  function back() {
    if (state.idx > 0) state.idx--;
    return currentProbe();
  }

  function live() { return liveReadings(state); }

  function end() {
    return computeProfile(state);
  }

  function getState() { return { ...state, answers: state.answers.slice(), textAll: state.textAll.slice() }; }

  return { firstProbe, currentProbe, answer, back, live, end, getState };
}

export const VERSION = '1.0.0';
