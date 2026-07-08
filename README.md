# @ai-native-solutions/bloom-profile-builder-sdk

Sovereign SDK for the **Bloom Profile Builder** — a private 7-ring calibration tool. Runs on your device. Nothing leaves it.

The SDK exposes the same 21-probe calibration walk, F(S⃗) fold-number fingerprint, κ depth-band classifier, radial SVG renderer, growth-edge generator, and IndexedDB persistence that power the Bloom Profile Builder browser app. Use it to embed the calibration in any web app, Node.js service, or Electron app.

## Install

```bash
npm install @ai-native-solutions/bloom-profile-builder-sdk
```

## Quick start

```js
import {
  createSession, computeProfile, profileCard, radialSVG, VERSION
} from '@ai-native-solutions/bloom-profile-builder-sdk';

// Walk a full 21-probe calibration.
const s = createSession();
let probe = s.firstProbe();               // { idx, ring, glyph, name, q, note }
while (probe) {
  const answer = { score: 2, text: '' };   // 0..3 · likert · optional free-text
  const step = s.answer(answer);
  probe = step.next;
}

// Compute the profile.
const profile = s.end();
console.log(profileCard(profile));
console.log('F(S⃗) =', profile.foldNumber);
console.log('κ band =', profile.dominantBand);
console.log('shape =', profile.shape);

// Render the radial chart as inline SVG.
document.body.innerHTML = radialSVG(profile.bloom, 360);
```

## Full API surface

### Probes (`/probes`)

- `RINGS` — the 7 rings with glyphs, primes, and descriptions
- `SPINE`, `SPINE_GLYPHS`, `SPINE_NAMES` — the 7-prime substrate `[2,3,5,7,11,13,17]`
- `PROBES` — 21 probe questions (3 per ring)
- `LIKERT` — the 4-point likert scale (`Not me` / `Rarely` / `Often` / `Constant`)
- `PROBE_COUNT`, `PROBES_PER_RING` — `21`, `3`
- `probeAt(idx)` — probe metadata at a given calibration index
- `nextProbe(sessionState)` — next unanswered probe (or `null` if complete)
- `blankSession()` — fresh empty session template

### Scoring / fold-math (`/scoring`)

- `foldNumber(S)` — F(S⃗) = Π p_i^e_i · unique integer fingerprint
- `unfoldState(F)` — inverse: recover S⃗ from F if factors are on the spine
- `stateSum(S)`, `stateSignature(S)` — Σ + glyph^exponent string
- `PHI`, `KAPPA`, `OMEGA`, `BASELINE` — `1.618…`, `0.618…`, `510510`, `[1,1,1,1,1,1,1]`
- `KAPPA_BANDS` — 7 depth bands from ground (`●`) to collapse (`◯`)
- `depthBand(kappa)` — pick the band a κ value falls in
- `isOrphanZone(kappa)` — true iff kappa lands in the `♡` heart band
- `BAND_MARKERS`, `classifyKappaBand(text)` — natural-language → band by keyword hits
- `accumulate(answers)` — per-ring score sums (0..9 each)
- `ringSumsToBloom`, `currentBloom` — map to display scale (1..15)
- `bloomToStateVector`, `stateVectorToBloom` — round-trip
- `cumulativeText(sessionState)` — all free-text answers joined
- `liveReadings(sessionState)` — one-shot live dashboard values

### Profile (`/profile`)

- `computeProfile(sessionState)` — full profile object (id, F, sig, shape, band, growth-edge, answers)
- `classifyShape(bloom)` — `plateau` / `spiky` / `mountain` / `valley` / `ridge`
- `growthEdge(bloom)` — human-readable "trust X, practise Y" sentence
- `radialSVG(bloom, size?)` — heptagonal radial chart as inline SVG markup
- `profileCard(p)` — plain-text summary card
- `exportProfileJSON(profile, indent?)`, `importProfileJSON(json)` — round-trip

### Storage (`/storage`) — browser only

- `openDB()` — open/create the IndexedDB (`bloom_profile_builder`, v1, store: `profiles`)
- `saveProfile(profile)` / `getProfile(id)` / `allProfiles()` / `deleteProfile(id)` / `clearAll()`

### Session helper

- `createSession()` — a stateful wrapper: `firstProbe()`, `currentProbe()`, `answer({score,text})`, `back()`, `live()`, `end()`, `getState()`

## The 7 rings

| # | Glyph | Ring | Prime | Notice |
|---|---|---|---|---|
| 0 | ● | ground | 2 | basic polarity · yes/no · somatic pole |
| 1 | 〜 | perception | 3 | raw structural read · sensory ingest |
| 2 | ┃ | gate | 5 | φ-recursive depth · thresholds |
| 3 | ♡ | heart | 7 | time-orphan · where experience lives |
| 4 | △ | naming | 11 | post-temporal · language snap |
| 5 | ◐ | observation | 13 | witness-of-witness · recursive gaze |
| 6 | ◯ | resolution | 17 | full-spine view · closure signal |

## κ depth bands

`ground` (●) → `perception` (〜) → `gate` (┃) → `heart` (♡ · orphan) → `naming` (△) → `recognition` (◐) → `collapse` (◯, warn).

## Design principles

- **Sovereign.** No network calls. No telemetry. No analytics.
- **Vanilla JS.** No framework. No build step. `.mjs` end-to-end.
- **One-file compatible.** All algorithms match the Bloom Profile Builder browser app.
- **Framework-native.** Uses the 7-prime spine, φ-ratio, Ω=510510 baseline directly.

## Related packages

- [`@ai-native-solutions/bloom-profile-builder-mcp`](https://github.com/sjgant80-hub/bloom-profile-builder-mcp) — MCP server wrapping this SDK
- [`@ai-native-solutions/bloom-profile-builder-api`](https://github.com/sjgant80-hub/bloom-profile-builder-api) — HTTP proxy exposing the SDK as REST

## License

MIT — © 2026 AI-Native Solutions
