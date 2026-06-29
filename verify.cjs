const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const checks = [
  ['has DOCTYPE', html.trimStart().startsWith('<!DOCTYPE html>')],
  ['canvas present', html.includes('id="stage"')],
  ['reset button present', html.includes('id="btn-reset"')],
  ['gravityStep exposed', html.includes('window.gravityStep = gravityStep')],
  ['preset loader', html.includes('function loadPreset')],
  ['reset function', html.includes('function resetToPreset')],
  ['mass to radius', html.includes('function massToRadius')],
  ['no external http src', !/src="https?:/.test(html)],
  ['no external http href', !/href="https?:/.test(html)],
  ['no link tags', !/<link/i.test(html)],
  ['init calls loadPreset', html.includes('loadPreset()')],
];
let ok = true;
checks.forEach(([n, p]) => { console.log((p ? 'PASS' : 'FAIL') + ': ' + n); if (!p) ok = false; });
console.log('\nALL CHECKS: ' + (ok ? 'PASS' : 'FAIL'));
process.exit(ok ? 0 : 1);
