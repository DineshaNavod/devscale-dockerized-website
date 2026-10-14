#!/usr/bin/env node
/**
 * Static project check. No dependencies.
 *   - every local href/src in index.html exists
 *   - every #anchor points to an existing id
 *   - ids are unique
 *   - aria-controls / aria-labelledby / aria-describedby targets exist
 *   - every JS file parses
 * It does NOT replace testing in a real browser.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const errors = [];
const fail = (m) => errors.push(m);

// 1. local files
const refRe = /\b(?:href|src)\s*=\s*"([^"]+)"/g;
let m;
while ((m = refRe.exec(html))) {
  const ref = m[1];
  if (/^(https?:|mailto:|tel:|data:|#)/i.test(ref)) continue;
  const file = path.join(root, ref.split('#')[0].split('?')[0]);
  if (!fs.existsSync(file)) fail('Missing file: ' + ref);
}

// 2 + 3. ids
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
const seen = new Set();
ids.forEach((id) => { if (seen.has(id)) fail('Duplicate id: ' + id); seen.add(id); });

[...html.matchAll(/\shref="#([^"]+)"/g)].forEach((x) => { if (!seen.has(x[1])) fail('Anchor target missing: #' + x[1]); });

['aria-controls', 'aria-labelledby', 'aria-describedby'].forEach((attr) => {
  [...html.matchAll(new RegExp('\\s' + attr + '="([^"]+)"', 'g'))].forEach((x) => {
    x[1].split(/\s+/).forEach((id) => { if (!seen.has(id)) fail(attr + ' target missing: #' + id); });
  });
});

// label/for
[...html.matchAll(/<label[^>]*\sfor="([^"]+)"/g)].forEach((x) => { if (!seen.has(x[1])) fail('label for= target missing: #' + x[1]); });

// 4. JS syntax
const jsDir = path.join(root, 'js');
fs.readdirSync(jsDir).filter((f) => f.endsWith('.js')).forEach((f) => {
  try { new vm.Script(fs.readFileSync(path.join(jsDir, f), 'utf8'), { filename: f }); }
  catch (e) { fail('Syntax error in js/' + f + ': ' + e.message); }
});

// 5. forbidden placeholders
if (/href="#"/.test(html)) fail('Found placeholder href="#"');

if (errors.length) {
  console.error('Validation failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log('OK — ' + ids.length + ' ids, all local files, anchors, ARIA references and JS syntax check out.');
