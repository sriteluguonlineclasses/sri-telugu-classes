const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const ics = require('../calendar-ics.js');

// load window.STC_DATA from the real data file
const code = fs.readFileSync(__dirname + '/../students-data.js', 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const data = sandbox.window.STC_DATA;

assert.ok(data && data.teachers, 'STC_DATA loaded');
const batches = ics.allBatches(data);
assert.ok(batches.length >= 1, 'at least one batch');

batches.forEach(function (b) {
  const cal = ics.buildICS(b, ics.classesForBatch(data, b));
  assert.ok(cal.includes('BEGIN:VCALENDAR') && cal.includes('END:VCALENDAR'), b + ' valid');
});
Object.keys(data.teachers).forEach(function (t) {
  const cal = ics.buildICS(t, ics.classesForTeacher(data, t));
  assert.ok(cal.includes('BEGIN:VCALENDAR'), t + ' feed valid');
});
console.log('REAL-DATA FEED CHECK PASSED — batches:', batches.join(', '),
  '| teachers:', Object.keys(data.teachers).join(', '));
