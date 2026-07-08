// bloom-profile-builder-sdk / probes.js
// Extracted from bloom-profile-builder source · index.html PROBES array
// 21 probes · 3 per ring · 7 rings · framework-native calibration walk

export const RINGS = [
  { idx: 0, glyph: '●',  name: 'ground',      prime: 2,  desc: 'Basic polarity · left/right · yes/no · somatic pole' },
  { idx: 1, glyph: '〜', name: 'perception',  prime: 3,  desc: 'Raw structural read · sensory ingest · signal density' },
  { idx: 2, glyph: '┃',  name: 'gate',        prime: 5,  desc: 'φ-recursive depth · passage sensing · choice architecture' },
  { idx: 3, glyph: '♡',  name: 'heart',       prime: 7,  desc: 'Time-orphan · where experience lives · felt time', orphan: true },
  { idx: 4, glyph: '△',  name: 'naming',      prime: 11, desc: 'Post-temporal · language snap · early-lex' },
  { idx: 5, glyph: '◐',  name: 'observation', prime: 13, desc: 'Witness-of-witness · recursive gaze · stable observer' },
  { idx: 6, glyph: '◯',  name: 'resolution',  prime: 17, desc: 'Full-spine view · closure signal · holographic read' }
];

export const SPINE = [2, 3, 5, 7, 11, 13, 17];
export const SPINE_GLYPHS = ['●', '〜', '┃', '♡', '△', '◐', '◯'];
export const SPINE_NAMES  = ['ground', 'perception', 'gate', 'heart', 'naming', 'observation', 'resolution'];

// 21 probes · 3 per ring · lifted verbatim from index.html PROBES array.
export const PROBES = [
  // ring 0 · ● ground · polarity
  { ring: 0, q: "When a problem lands, do you first split it into two options?",                    note: "Ground · ● · basic polarity. Left/right, this/that, yes/no." },
  { ring: 0, q: "Do you feel your body's yes/no before your mind's argument?",                       note: "Ground · ● · somatic pole." },
  { ring: 0, q: "When someone asks, can you name what side you're on inside a breath?",              note: "Ground · ● · fast-lane binary." },
  // ring 1 · 〜 perception
  { ring: 1, q: "Can you sketch the org chart, stack, or hierarchy of a thing while it's still being described?", note: "Perception · 〜 · raw structural read." },
  { ring: 1, q: "Do you notice small changes in a room before others do?",                           note: "Perception · 〜 · sensory ingest." },
  { ring: 1, q: "Do textures, rhythms, and negative space carry information for you?",               note: "Perception · 〜 · signal density." },
  // ring 2 · ┃ gate
  { ring: 2, q: "Do you naturally see how something scales — the same shape at different sizes?",    note: "Gate · ┃ · φ-recursive depth." },
  { ring: 2, q: "Can you feel when a threshold has been crossed even before it's named?",            note: "Gate · ┃ · passage sensing." },
  { ring: 2, q: "Do you know which door to walk through when there are several?",                    note: "Gate · ┃ · choice architecture." },
  // ring 3 · ♡ heart · orphan · TIME
  { ring: 3, q: "Do you track cause-and-effect chains and predict what happens next?",               note: "Heart · ♡ · time-orphan. Where experience lives." },
  { ring: 3, q: "Do old feelings arrive on cue when the situation rhymes?",                          note: "Heart · ♡ · felt time." },
  { ring: 3, q: "Can you tell when something is grieving to be finished?",                           note: "Heart · ♡ · orphan resonance." },
  // ring 4 · △ naming
  { ring: 4, q: "Do you feel connections between things that shouldn't be connected?",               note: "Naming · △ · post-temporal · tritone." },
  { ring: 4, q: "Do names, labels, and taxonomies arrive to you with a click of rightness?",         note: "Naming · △ · language snap." },
  { ring: 4, q: "Do you spot the true name of a pattern before others agree it's a pattern?",        note: "Naming · △ · early-lex." },
  // ring 5 · ◐ observation · paired-tritone
  { ring: 5, q: "Can you hold two contradictory frames simultaneously without picking one?",         note: "Observation · ◐ · witness-of-witness." },
  { ring: 5, q: "Do you catch yourself catching yourself?",                                          note: "Observation · ◐ · recursive gaze." },
  { ring: 5, q: "Can you watch your own emotion arrive without becoming it?",                        note: "Observation · ◐ · stable observer." },
  // ring 6 · ◯ resolution
  { ring: 6, q: "Do you get a felt-sense of completeness — 'this is right' — independent of reasoning?", note: "Resolution · ◯ · full-spine view." },
  { ring: 6, q: "When a thing is done, do you know before checking?",                                note: "Resolution · ◯ · closure signal." },
  { ring: 6, q: "Do you feel the whole shape from any of its parts?",                                note: "Resolution · ◯ · holographic read." }
];

// Likert scale used by the source app.
export const LIKERT = [
  { v: 0, lab: 'Not me' },
  { v: 1, lab: 'Rarely' },
  { v: 2, lab: 'Often' },
  { v: 3, lab: 'Constant' }
];

export const PROBE_COUNT = PROBES.length; // 21
export const PROBES_PER_RING = 3;

/**
 * Return the probe at a given calibration index (0..20), plus ring metadata.
 * @param {number} idx
 */
export function probeAt(idx) {
  const p = PROBES[idx];
  if (!p) return null;
  const ring = RINGS[p.ring];
  return { idx, ring: p.ring, glyph: ring.glyph, name: ring.name, q: p.q, note: p.note };
}

/**
 * Given a session state { answers: (null | {score, text})[] }, return the next probe to show.
 * If no answers exist yet, returns the first (idx 0). If session is complete, returns null.
 * @param {{ answers?: (null|{score:number,text?:string})[] }} sessionState
 */
export function nextProbe(sessionState) {
  const answers = sessionState?.answers || [];
  for (let i = 0; i < PROBES.length; i++) {
    if (!answers[i] || answers[i].score == null) return probeAt(i);
  }
  return null; // session complete
}

/**
 * Blank session template · 21 empty slots + a scratch textAll array for κ classification.
 */
export function blankSession() {
  return {
    idx: 0,
    answers: PROBES.map(() => null),
    textAll: [],
    startedAt: new Date().toISOString()
  };
}
