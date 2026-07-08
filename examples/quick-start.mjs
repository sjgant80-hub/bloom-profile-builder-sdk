// examples/quick-start.mjs · walk a full 21-probe calibration in ~40 lines.
// Run: node examples/quick-start.mjs

import {
  createSession, foldNumber, bloomToStateVector,
  classifyKappaBand, radialSVG, profileCard, PROBES, VERSION
} from '../src/index.js';

console.log(`bloom-profile-builder-sdk v${VERSION}\n`);

// One-shot primitives
console.log('foldNumber([1,1,1,1,1,1,1]) =', foldNumber([1,1,1,1,1,1,1]), '(should be 510510 · Ω)');
console.log('classifyKappaBand("i feel lonely and sad") =', classifyKappaBand('i feel lonely and sad').name);

// Full 21-probe session · answer everything at score 2 with a heart-band text tail
console.log('\n--- Walking a full 21-probe calibration ---');
const s = createSession();
let probe = s.firstProbe();
let step;
for (let i = 0; i < PROBES.length; i++) {
  const text = i === PROBES.length - 1 ? 'i feel this is grieving to be finished' : '';
  step = s.answer({ score: 2, text });
  probe = step.next;
}

// Live readings mid-flight
console.log('final live readings:', s.live());

// Compute final profile
const profile = s.end();
console.log('\n' + profileCard(profile));
console.log('\nradial SVG length:', radialSVG(profile.bloom, 300).length, 'chars');
console.log('\ndone.');
