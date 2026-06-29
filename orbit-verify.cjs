// Replicate orbit-test.html's circular-orbit test against the
// integrator exactly as implemented in index.html.
const PHYS = { G: 1.0, SOFTENING: 0.05 };
function gravityStep(bodies, dt) {
  if (!Array.isArray(bodies) || bodies.length === 0) return [];
  const n = bodies.length;
  const G = PHYS.G;
  const eps2 = PHYS.SOFTENING * PHYS.SOFTENING;
  const ax = new Array(n).fill(0);
  const ay = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const r2 = dx * dx + dy * dy + eps2;
      const invR = 1 / Math.sqrt(r2);
      const invR3 = invR * invR * invR;
      const gi = G * bodies[j].mass * invR3;
      ax[i] += gi * dx; ay[i] += gi * dy;
      const gj = G * bodies[i].mass * invR3;
      ax[j] -= gj * dx; ay[j] -= gj * dy;
    }
  }
  return bodies.map(function (b, i) {
    const vx = b.vx + ax[i] * dt;
    const vy = b.vy + ay[i] * dt;
    return { x: b.x + vx * dt, y: b.y + vy * dt, vx, vy, mass: b.mass };
  });
}

// ---- orbit-test.html scenario ----
const G = 1, M = 1e6, R = 100;
const V = Math.sqrt((G * M) / R);
const PERIOD = 2 * Math.PI * Math.sqrt((R * R * R) / (G * M));
const STEPS = 8000;
const DT = PERIOD / STEPS;
function initialBodies() {
  return [
    { x: 0, y: 0, vx: 0, vy: 0, mass: M },
    { x: R, y: 0, vx: 0, vy: V, mass: 1e-3 },
  ];
}
let bodies = initialBodies();
let minR = Infinity, maxR = -Infinity, totalAngle = 0, prevAng = 0;
let ok = true;
for (let s = 0; s < STEPS; s++) {
  bodies = gravityStep(bodies.map((b) => ({ ...b })), DT);
  if (!Array.isArray(bodies) || bodies.length !== 2) { ok = false; console.log('wrong shape at', s); break; }
  const c = bodies[0], p = bodies[1];
  const dx = p.x - c.x, dy = p.y - c.y;
  const r = Math.hypot(dx, dy);
  if (!isFinite(r)) { ok = false; console.log('non-finite at', s); break; }
  minR = Math.min(minR, r); maxR = Math.max(maxR, r);
  const ang = Math.atan2(dy, dx);
  let d = ang - prevAng;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  totalAngle += d; prevAng = ang;
}
const revolutions = Math.abs(totalAngle) / (2 * Math.PI);
const radiusOk = minR > R * 0.75 && maxR < R * 1.25;
const revOk = revolutions > 0.8 && revolutions < 1.2;
console.log('radius:', minR.toFixed(1), '-', maxR.toFixed(1), '(target 100, band 75-125)', radiusOk ? 'PASS' : 'FAIL');
console.log('revolutions:', revolutions.toFixed(3), '(target ~1.000)', revOk ? 'PASS' : 'FAIL');
console.log('ORBIT TEST:', (radiusOk && revOk && ok) ? 'PASS' : 'FAIL');
process.exit((radiusOk && revOk && ok) ? 0 : 1);
