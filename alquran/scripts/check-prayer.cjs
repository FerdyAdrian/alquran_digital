const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { qiblaBearing, prayerInstant, localDate } = require('../src/utils/prayer.ts');
assert.ok(Math.abs(qiblaBearing(-6.2, 106.8) - 295.15) < 0.2);
assert.ok(Math.abs(qiblaBearing(51.5, -0.12) - 119) < 1);
assert.throws(() => qiblaBearing(NaN, 0));
assert.throws(() => qiblaBearing(91, 0));
for (const [timezone, expected] of [['Asia/Jakarta', '2026-10-29T21:30:00.000Z'], ['Asia/Makassar', '2026-10-29T20:30:00.000Z'], ['Asia/Jayapura', '2026-10-29T19:30:00.000Z']]) {
  assert.equal(prayerInstant({ date: '2026-10-30', timezone }, '04:30').toISOString(), expected);
}
assert.equal(localDate(new Date('2026-10-29T18:00:00Z'), 'Asia/Jakarta'), '2026-10-30');
console.log('8 pemeriksaan arah kiblat dan zona waktu lulus.');
