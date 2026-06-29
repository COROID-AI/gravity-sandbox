const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const checks = [
  ['No PHYS.G references', html.indexOf('PHYS.G') === -1],
  ['Built by Coroid present', html.indexOf('Built by Coroid') !== -1],
  ['No external http src', html.indexOf('src="http') === -1],
  ['No external http href', html.indexOf('href="http') === -1],
  ['No link tags', html.indexOf('<link') === -1],
  ['No console.error calls', html.indexOf('console.error') === -1],
  ['No console.warn calls', html.indexOf('console.warn') === -1],
  ['gravityStep exposed', html.indexOf('window.gravityStep = gravityStep') !== -1],
  ['Space shortcut', html.indexOf("e.key === ' '") !== -1],
  ['R reset shortcut', html.indexOf("e.key === 'r'") !== -1],
  ['Reset view button', html.indexOf('btn-reset-view') !== -1],
  ['Pinch zoom mobile', html.indexOf('pinchStartDist') !== -1],
];
let ok = true;
checks.forEach(function (c) {
  console.log((c[1] ? 'PASS' : 'FAIL') + ': ' + c[0]);
  if (!c[1]) ok = false;
});
console.log('\nFINAL: ' + (ok ? 'ALL PASS' : 'FAILURES'));
process.exit(ok ? 0 : 1);
