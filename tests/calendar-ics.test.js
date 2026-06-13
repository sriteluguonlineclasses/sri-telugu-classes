const assert = require('assert');
const ics = require('../calendar-ics.js');

const DATA = {
  teachers: {
    Jyothi: { schedule: [
      { dayOfWeek: 1, dayName: 'Monday', timeStart: '17:00', timeEnd: '18:00',
        timeIST: '5:00 PM – 6:00 PM IST', course: 'Telugu Basics', batch: 'Batch B',
        meetLink: 'https://meet.google.com/abc-defg-hij' }
    ]},
    Vijaya: { schedule: [
      { dayOfWeek: 5, dayName: 'Friday', timeStart: '16:30', timeEnd: '17:30',
        timeIST: '4:30 PM – 5:30 PM IST', course: 'Culture & Stories', batch: 'Batch B',
        meetLink: 'https://meet.google.com/def-ghij-klm' },
      // legacy entry: no timeStart/timeEnd, only display string -> must be parsed
      { dayOfWeek: 3, dayName: 'Wednesday', timeIST: '6:00 PM – 7:00 PM IST',
        course: 'Spoken Telugu', batch: 'Batch A',
        meetLink: 'https://meet.google.com/xyz-uvwx-yzp' }
    ]}
  },
  students: { 'a@b.com': { batch: 'Batch B' } }
};

// classesForBatch pulls matching classes across all teachers, tags teacher name
const batchB = ics.classesForBatch(DATA, 'Batch B');
assert.strictEqual(batchB.length, 2, 'Batch B has 2 classes');
assert.ok(batchB.every(c => c.teacher), 'each class tagged with teacher');

// buildICS output is valid iCalendar
const cal = ics.buildICS('Batch B — Sri Telugu Classes', batchB);
assert.ok(cal.startsWith('BEGIN:VCALENDAR\r\n'), 'starts with VCALENDAR + CRLF');
assert.ok(cal.trim().endsWith('END:VCALENDAR'), 'ends with VCALENDAR');
assert.ok(cal.includes('BEGIN:VTIMEZONE') && cal.includes('TZID:Asia/Kolkata'), 'has India VTIMEZONE');
assert.strictEqual((cal.match(/BEGIN:VEVENT/g) || []).length, 2, '2 VEVENTs');
// Monday class: anchor weekday date 20240101 (a Monday), 17:00 IST, weekly on Monday
assert.ok(cal.includes('DTSTART;TZID=Asia/Kolkata:20240101T170000'), 'Monday DTSTART correct');
assert.ok(cal.includes('RRULE:FREQ=WEEKLY;BYDAY=MO'), 'weekly Monday recurrence');
assert.ok(cal.includes('SUMMARY:Telugu Basics'), 'summary is course name');
assert.ok(cal.includes('URL:https://meet.google.com/abc-defg-hij'), 'meet link present');

// legacy time-string parsing works for the Batch A class
const batchA = ics.classesForBatch(DATA, 'Batch A');
const calA = ics.buildICS('Batch A', batchA);
assert.ok(calA.includes('DTSTART;TZID=Asia/Kolkata:20240103T180000'), 'parsed legacy Wed 18:00');
assert.ok(calA.includes('RRULE:FREQ=WEEKLY;BYDAY=WE'), 'weekly Wednesday');

// per-teacher selection
assert.strictEqual(ics.classesForTeacher(DATA, 'Vijaya').length, 2, 'Vijaya has 2 classes');

// slug helper
assert.strictEqual(ics.slug('Batch B'), 'batch-b');

console.log('ALL CALENDAR-ICS TESTS PASSED');
