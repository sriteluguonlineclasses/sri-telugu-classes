# Admin Timezone Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an IST/PST timezone selector per teacher in the admin schedule editor so class time labels store the correct timezone instead of always hardcoding "IST".

**Architecture:** All changes are in `admin.html`. A `<select id="tzSelect">` is added to the teacher editor card. `openTeacherEditor()` pre-populates it from the teacher's stored `timezone` field. `saveTeacher()` reads it, writes `timezone` to the teacher object, and uses it in the `timeIST` display label. `addClassRow()` reads the current selector value to label the time inputs dynamically.

**Tech Stack:** Vanilla JS, HTML — no build step, no test framework. Manual browser verification used in place of automated tests.

---

### Task 1: Add timezone selector to the teacher editor card

**Files:**
- Modify: `admin.html` (teacher editor section, lines 104–112)

- [ ] **Step 1: Locate the teacher editor card HTML**

  In `admin.html` find this block (around line 104):

  ```html
  <!-- ── Teacher editor ── -->
  <div class="card" id="teacherEditor" style="display:none;">
    <h2 id="teacherEditorTitle">Teacher Schedule</h2>
    <div id="tScheduleRows"></div>
  ```

- [ ] **Step 2: Add the timezone selector between the `<h2>` and `<div id="tScheduleRows">`**

  Replace the block above with:

  ```html
  <!-- ── Teacher editor ── -->
  <div class="card" id="teacherEditor" style="display:none;">
    <h2 id="teacherEditorTitle">Teacher Schedule</h2>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <label style="margin:0;white-space:nowrap;">Timezone</label>
      <select id="tzSelect" style="width:auto;" onchange="updateTimezoneLabels()">
        <option value="IST">IST (India)</option>
        <option value="PST">PST (US Pacific)</option>
      </select>
    </div>
    <div id="tScheduleRows"></div>
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add admin.html
  git commit -m "feat: add IST/PST timezone selector to teacher schedule editor"
  ```

---

### Task 2: Add `updateTimezoneLabels()` function and update `addClassRow()` labels

**Files:**
- Modify: `admin.html` (JS section — `addClassRow` function, around line 333)

- [ ] **Step 1: Add classes to the time input labels inside `addClassRow()`**

  In `addClassRow()`, the `div.innerHTML` string currently has:

  ```javascript
  '<div><label>Starts (IST)</label><input type="time" class="rStart"></div>' +
  '<div><label>Ends (IST)</label><input type="time" class="rEnd"></div>' +
  ```

  Replace those two lines with:

  ```javascript
  '<div><label class="rTzLabel">Starts (IST)</label><input type="time" class="rStart"></div>' +
  '<div><label class="rTzLabel">Ends (IST)</label><input type="time" class="rEnd"></div>' +
  ```

  Then, immediately after `document.getElementById('tScheduleRows').appendChild(div);` (line 351), add one line to stamp the current timezone onto the newly added labels:

  ```javascript
  document.getElementById('tScheduleRows').appendChild(div);
  var _tz = (document.getElementById('tzSelect') && document.getElementById('tzSelect').value) || 'IST';
  div.querySelectorAll('.rTzLabel').forEach(function(el) {
    el.textContent = el.textContent.replace(/\(IST\)|\(PST\)/, '(' + _tz + ')');
  });
  ```

- [ ] **Step 2: Add `updateTimezoneLabels()` function after `addClassRow()`**

  After the closing `}` of `addClassRow()` (around line 359), insert:

  ```javascript
  function updateTimezoneLabels() {
    var tz = document.getElementById('tzSelect').value;
    document.querySelectorAll('.rTzLabel').forEach(function(el) {
      el.textContent = el.textContent.replace(/\(IST\)|\(PST\)/, '(' + tz + ')');
    });
  }
  ```

- [ ] **Step 3: Verify manually**

  Open `admin.html` in a browser (or via the dev server), sign in, open a teacher's schedule editor, and switch the timezone dropdown between IST and PST. All "Starts" and "Ends" labels on existing and newly added rows should update immediately.

- [ ] **Step 4: Commit**

  ```bash
  git add admin.html
  git commit -m "feat: timezone labels on class rows update when selector changes"
  ```

---

### Task 3: Pre-populate timezone selector when opening a teacher editor

**Files:**
- Modify: `admin.html` (JS section — `openTeacherEditor` function, around line 299)

- [ ] **Step 1: Locate `openTeacherEditor()`**

  Current code (around line 299):

  ```javascript
  function openTeacherEditor(name) {
    editingTeacher = name;
    closeEditor();
    document.getElementById('teacherEditorTitle').textContent = '📅 ' + name + ' — Weekly Schedule';
    document.getElementById('tScheduleRows').innerHTML = '';
    ((data.teachers[name] || {}).schedule || []).forEach(addClassRow);
    document.getElementById('teacherEditor').style.display = 'block';
    document.getElementById('teacherEditor').scrollIntoView({ behavior: 'smooth' });
  }
  ```

- [ ] **Step 2: Set timezone selector BEFORE populating rows**

  Replace the body with:

  ```javascript
  function openTeacherEditor(name) {
    editingTeacher = name;
    closeEditor();
    document.getElementById('teacherEditorTitle').textContent = '📅 ' + name + ' — Weekly Schedule';
    document.getElementById('tScheduleRows').innerHTML = '';
    document.getElementById('tzSelect').value = (data.teachers[name] || {}).timezone || 'IST';
    ((data.teachers[name] || {}).schedule || []).forEach(addClassRow);
    document.getElementById('teacherEditor').style.display = 'block';
    document.getElementById('teacherEditor').scrollIntoView({ behavior: 'smooth' });
  }
  ```

  Setting `tzSelect.value` before `addClassRow` calls ensures the labels render with the right timezone immediately on open.

- [ ] **Step 3: Verify manually**

  - Open Vijaya's editor (currently has no `timezone` field) → selector should default to IST.
  - Manually set Vijaya's timezone in `students-data.js` to `"PST"` temporarily, reload, open Vijaya's editor → selector should show PST.
  - Remove the manual change after verifying.

- [ ] **Step 4: Commit**

  ```bash
  git add admin.html
  git commit -m "feat: pre-populate timezone selector from saved teacher data"
  ```

---

### Task 4: Persist timezone in `saveTeacher()` and use it in the label

**Files:**
- Modify: `admin.html` (JS section — `saveTeacher` function, around line 361)

- [ ] **Step 1: Locate `saveTeacher()`**

  Current code (around line 361):

  ```javascript
  function saveTeacher() {
    if (!editingTeacher) return;
    var schedule = [].map.call(document.querySelectorAll('.class-row'), function(div) {
      var dow = parseInt(div.querySelector('.rDay').value, 10);
      var start = div.querySelector('.rStart').value;
      var end = div.querySelector('.rEnd').value;
      var label = start ? (to12h(start) + (end ? ' – ' + to12h(end) : '') + ' IST') : '';
      return {
        dayOfWeek: dow, dayName: DAYS[dow],
        timeStart: start, timeEnd: end,
        timeIST: label,
        course: div.querySelector('.rCourse').value.trim(),
        batch: div.querySelector('.rBatch').value.trim(),
        meetLink: div.querySelector('.rMeet').value.trim()
      };
    }).filter(function(c) { return c.course || c.timeIST; });
    if (!data.teachers[editingTeacher]) data.teachers[editingTeacher] = {};
    data.teachers[editingTeacher].schedule = schedule;
    setDirty(true);
  ```

- [ ] **Step 2: Read the timezone selector and use it in the label and teacher object**

  Replace with:

  ```javascript
  function saveTeacher() {
    if (!editingTeacher) return;
    var tz = document.getElementById('tzSelect').value;
    var schedule = [].map.call(document.querySelectorAll('.class-row'), function(div) {
      var dow = parseInt(div.querySelector('.rDay').value, 10);
      var start = div.querySelector('.rStart').value;
      var end = div.querySelector('.rEnd').value;
      var label = start ? (to12h(start) + (end ? ' – ' + to12h(end) : '') + ' ' + tz) : '';
      return {
        dayOfWeek: dow, dayName: DAYS[dow],
        timeStart: start, timeEnd: end,
        timeIST: label,
        course: div.querySelector('.rCourse').value.trim(),
        batch: div.querySelector('.rBatch').value.trim(),
        meetLink: div.querySelector('.rMeet').value.trim()
      };
    }).filter(function(c) { return c.course || c.timeIST; });
    if (!data.teachers[editingTeacher]) data.teachers[editingTeacher] = {};
    data.teachers[editingTeacher].schedule = schedule;
    data.teachers[editingTeacher].timezone = tz;
    setDirty(true);
  ```

  Two changes:
  1. `var tz = document.getElementById('tzSelect').value;`
  2. `+ ' IST'` → `+ ' ' + tz`
  3. `data.teachers[editingTeacher].timezone = tz;` added after setting schedule

- [ ] **Step 3: Verify end-to-end manually**

  1. Sign in to admin console.
  2. Open Vijaya's schedule editor.
  3. Switch the timezone selector to **PST**.
  4. Add or edit a class with a start time of 5:00 PM and end time 6:00 PM.
  5. Click **Save Schedule**.
  6. Click **Publish Changes**.
  7. After ~1 minute, reload `students-data.js` directly and verify:
     - `data.teachers["Vijaya"].timezone === "PST"`
     - The saved class has `timeIST: "5:00 PM – 6:00 PM PST"`
  8. Open Vijaya's editor again — selector should show PST and labels should read "Starts (PST)" / "Ends (PST)".
  9. Open Jyothi's editor — selector should show IST (default).

- [ ] **Step 4: Commit**

  ```bash
  git add admin.html
  git commit -m "feat: save teacher timezone and use it in class time labels"
  ```

---

### Task 5: Push to GitHub Pages

- [ ] **Step 1: Push**

  ```bash
  git push origin main
  ```

- [ ] **Step 2: Verify live site**

  After ~1 minute, open `https://sriteluguonlineclasses.github.io/sri-telugu-classes/admin.html`, sign in, and open a teacher editor to confirm the timezone selector appears and persists correctly.
