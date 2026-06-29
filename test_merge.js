const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

const noopCtx = new Proxy({}, { get: () => () => {} });
const fakeCanvas = {
  width: 800, height: 600,
  getContext: () => noopCtx,
  addEventListener: () => {}
};
global.window = { addEventListener: () => {} };
global.document = {
  getElementById: (id) => id === 'stage' ? fakeCanvas : null,
  addEventListener: () => {}
};
global.requestAnimationFrame = () => {};

eval(code);

let pass = 0, fail = 0;
function check(name, actual, expected) {
  const ok = Math.abs(actual - expected) < 1e-9;
  console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name + ': ' + actual + ' (expect ' + expected + ')');
  ok ? pass++ : fail++;
}

// Test 1: two overlapping equal-mass bodies merge
const out = window.mergeCollisions([
  { x: 0, y: 0, vx: 10, vy: 0, mass: 100, color: '#fff' },
  { x: 1, y: 0, vx: 0, vy: 5, mass: 100, color: '#000' }
]);
const b = out[0];
check('merge count', out.length, 1);
check('merge mass', b.mass, 200);
check('merge vx', b.vx, 5);
check('merge vy', b.vy, 2.5);
check('merge x (CoM)', b.x, 0.5);

// Test 2: non-overlapping bodies don't merge
const sep = window.mergeCollisions([
  { x: 0, y: 0, vx: 0, vy: 0, mass: 1, color: '#fff' },
  { x: 1000, y: 1000, vx: 0, vy: 0, mass: 1, color: '#fff' }
]);
check('non-overlap count', sep.length, 2);

// Test 3: empty/single input
check('empty input', window.mergeCollisions([]).length, 0);
check('single input', window.mergeCollisions([{x:0,y:0,vx:0,vy:0,mass:5,color:'#fff'}]).length, 1);

// Test 4: unequal masses conserve momentum
const out2 = window.mergeCollisions([
  { x: 0, y: 0, vx: 20, vy: 0, mass: 300, color: '#fff' },
  { x: 0.5, y: 0, vx: -10, vy: 0, mass: 100, color: '#000' }
]);
const b2 = out2[0];
check('unequal mass', b2.mass, 400);
check('unequal vx (momentum)', b2.vx, 12.5); // (300*20 + 100*(-10))/400 = 12.5

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
