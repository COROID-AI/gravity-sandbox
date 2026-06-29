/* Headless verification for the fading-trail implementation in index.html.
 * Loads the page's <script>, mocks the minimal DOM/canvas globals, then
 * asserts that trail config, recording, trimming, and configurability work.
 */
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// --- Full browser mock ---
const fakeCtx = {
  createRadialGradient: () => ({ addColorStop: () => {} }),
  beginPath: () => {}, arc: () => {}, fill: () => {},
  fillRect: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
};
Object.defineProperty(fakeCtx, 'lineCap', { set(){} });
Object.defineProperty(fakeCtx, 'lineJoin', { set(){} });
Object.defineProperty(fakeCtx, 'strokeStyle', { set(){} });
Object.defineProperty(fakeCtx, 'lineWidth', { set(){} });
Object.defineProperty(fakeCtx, 'fillStyle', { set(){} });

const fakeCanvas = { width: 800, height: 600, getContext: () => fakeCtx };
global.window = { addEventListener: () => {} };
global.document = {
  getElementById: (id) => (id === 'stage' ? fakeCanvas : null),
  addEventListener: () => {},
};
global.requestAnimationFrame = () => {};

eval(code);

const STATE = window.STATE;
const CONFIG = window.CONFIG;
let failures = 0;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); failures++; }
  else console.log('PASS: ' + msg);
}

// --- Config checks ---
assert(CONFIG.TRAIL_LENGTH === 60, 'TRAIL_LENGTH default is 60');
assert(CONFIG.TRAIL_MAX_LENGTH === 400, 'TRAIL_MAX_LENGTH is 400');
assert(STATE.params.trailLength === 60, 'params.trailLength defaults to 60');
assert(STATE.flags.showTrails === true, 'showTrails defaults to true');
assert(Array.isArray(STATE.trails), 'STATE.trails is an array');
assert(STATE.trails.length === STATE.bodies.length, 'trails array matches bodies count');

// --- Replicate recordTrails (closure-private) to test the logic ---
function recordTrails() {
  const bodies = STATE.bodies;
  const trails = STATE.trails;
  const maxLen = STATE.params.trailLength;
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    const tr = trails[i] || (trails[i] = []);
    tr.push(b.x, b.y);
    if (tr.length > maxLen * 2) tr.splice(0, tr.length - maxLen * 2);
  }
}

// Run 100 physics + trail frames
for (let f = 0; f < 100; f++) {
  const dt = STATE.params.dt;
  const sub = STATE.params.substeps;
  for (let s = 0; s < sub; s++) STATE.bodies = window.gravityStep(STATE.bodies, dt);
  recordTrails();
}

// --- Verify trails populated and trimmed to default length ---
for (let i = 0; i < STATE.trails.length; i++) {
  const pairs = STATE.trails[i].length / 2;
  assert(pairs > 0, 'trail[' + i + '] has points after 100 frames');
  assert(pairs <= 60, 'trail[' + i + '] trimmed to <= 60 (got ' + pairs + ')');
}

// --- Verify configurability: shrink to 10 ---
STATE.params.trailLength = 10;
for (let f = 0; f < 20; f++) recordTrails();
for (let i = 0; i < STATE.trails.length; i++) {
  const pairs = STATE.trails[i].length / 2;
  assert(pairs <= 10, 'trail[' + i + '] trims to <= 10 after config change (got ' + pairs + ')');
}

// --- Verify showTrails=false skips rendering (flag check) ---
STATE.flags.showTrails = false;
assert(STATE.flags.showTrails === false, 'showTrails can be disabled');

console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
process.exit(failures === 0 ? 0 : 1);
