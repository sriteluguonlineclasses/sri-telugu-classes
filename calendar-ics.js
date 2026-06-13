/* Sri Telugu Classes — turn STC_DATA into iCalendar (.ics) feeds.
   Works in the browser (window.STC_ICS) and in Node (module.exports). */
(function (root) {
  var DAY_RRULE = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  function pad(n) { return ('0' + n).slice(-2); }
  function hhmmToIcs(t) { return t.replace(':', '') + '00'; }  // "17:00" -> "170000"

  // Fallback: "5:00 PM – 6:00 PM IST" -> ["17:00","18:00"]
  function parseTimeRange(str) {
    var out = [], re = /(\d{1,2}):(\d{2})\s*(AM|PM)/gi, m;
    while ((m = re.exec(str || '')) && out.length < 2) {
      var h = parseInt(m[1], 10) % 12;
      if (m[3].toUpperCase() === 'PM') h += 12;
      out.push(pad(h) + ':' + m[2]);
    }
    return out;
  }

  // Fixed reference week so feeds stay stable (no churn). 2023-12-31 was a Sunday.
  function anchorDate(dow) {
    var ref = new Date(Date.UTC(2023, 11, 31));
    ref.setUTCDate(ref.getUTCDate() + dow);
    return '' + ref.getUTCFullYear() + pad(ref.getUTCMonth() + 1) + pad(ref.getUTCDate());
  }

  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function esc(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;')
      .replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  function buildICS(calName, events) {
    var L = [];
    L.push('BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//Sri Telugu Classes//Schedule//EN', 'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH', 'X-WR-CALNAME:' + esc(calName), 'X-WR-TIMEZONE:Asia/Kolkata',
      'BEGIN:VTIMEZONE', 'TZID:Asia/Kolkata', 'BEGIN:STANDARD',
      'DTSTART:19700101T000000', 'TZOFFSETFROM:+0530', 'TZOFFSETTO:+0530',
      'TZNAME:IST', 'END:STANDARD', 'END:VTIMEZONE');

    events.forEach(function (ev, i) {
      var times = (ev.timeStart && ev.timeEnd) ? [ev.timeStart, ev.timeEnd]
        : parseTimeRange(ev.timeIST);
      if (!times[0]) return;
      var ds = anchorDate(ev.dayOfWeek);
      var uid = slug(calName) + '-' + i + '-' + ev.dayOfWeek + '-' +
        times[0].replace(':', '') + '@sriteluguclasses';
      L.push('BEGIN:VEVENT', 'UID:' + uid, 'DTSTAMP:19700101T000000Z',
        'SUMMARY:' + esc(ev.course || 'Telugu Class'),
        'DTSTART;TZID=Asia/Kolkata:' + ds + 'T' + hhmmToIcs(times[0]));
      if (times[1]) L.push('DTEND;TZID=Asia/Kolkata:' + ds + 'T' + hhmmToIcs(times[1]));
      L.push('RRULE:FREQ=WEEKLY;BYDAY=' + DAY_RRULE[ev.dayOfWeek]);
      if (ev.meetLink) L.push('URL:' + ev.meetLink, 'LOCATION:' + esc(ev.meetLink));
      var desc = [];
      if (ev.teacher) desc.push('Teacher: ' + ev.teacher);
      if (ev.batch) desc.push('Batch: ' + ev.batch);
      if (ev.meetLink) desc.push('Join: ' + ev.meetLink);
      if (desc.length) L.push('DESCRIPTION:' + esc(desc.join('\n')));
      L.push('END:VEVENT');
    });

    L.push('END:VCALENDAR');
    return L.join('\r\n') + '\r\n';  // CRLF per RFC 5545
  }

  function classesForBatch(data, batch) {
    var out = [];
    Object.keys((data && data.teachers) || {}).forEach(function (t) {
      (data.teachers[t].schedule || []).forEach(function (c) {
        if (!batch || c.batch === batch) {
          var e = {}; for (var k in c) e[k] = c[k]; e.teacher = t; out.push(e);
        }
      });
    });
    return out;
  }

  function classesForTeacher(data, t) {
    var sched = (data && data.teachers && data.teachers[t] && data.teachers[t].schedule) || [];
    return sched.map(function (c) { var e = {}; for (var k in c) e[k] = c[k]; e.teacher = t; return e; });
  }

  function allBatches(data) {
    var b = {};
    Object.keys((data && data.teachers) || {}).forEach(function (t) {
      (data.teachers[t].schedule || []).forEach(function (c) { if (c.batch) b[c.batch] = 1; });
    });
    Object.keys((data && data.students) || {}).forEach(function (e) {
      var s = data.students[e]; if (s.batch) b[s.batch] = 1;
    });
    return Object.keys(b);
  }

  var api = { buildICS: buildICS, classesForBatch: classesForBatch,
    classesForTeacher: classesForTeacher, allBatches: allBatches, slug: slug };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.STC_ICS = api;
})(typeof self !== 'undefined' ? self : this);
