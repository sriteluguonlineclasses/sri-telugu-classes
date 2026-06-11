# Admin Console: Per-Teacher Timezone Selector

**Date:** 2026-06-10  
**Status:** Approved

## Problem

Class times in the admin console are always labeled "IST" (Indian Standard Time), but Vijaya teaches from the US (Pacific time). The stored label on each class — `timeIST` — always reads e.g. `"5:00 PM – 6:00 PM IST"`, which is wrong for US-based teachers. There is no way to mark a class as PST.

## Design

### Scope

Admin console only (`admin.html`). No changes to `dashboard.html` or `app.js`. Students see the stored label as-is.

### UI Change — Teacher Schedule Editor

When the admin opens a teacher's schedule editor, a timezone selector appears at the top of the editor, above the class rows:

```
Timezone  ○ IST (India)   ● PST (US Pacific)
```

Implemented as a `<select>` with two options (`IST`, `PST`). Defaults to `IST`.

The two class-row input labels that currently read **"Starts (IST)"** and **"Ends (IST)"** update dynamically (via a `change` listener on the selector) to reflect the selected timezone.

### Data Change — `students-data.js`

`saveTeacher()` adds one field to the teacher object:

```json
{
  "timezone": "PST"
}
```

The `timeIST` field (kept as-is for dashboard compatibility) now uses the selected timezone in its label:

```
"5:00 PM – 6:00 PM PST"   ← was always "IST"
```

### Loading Existing Data

`openTeacherEditor()` reads `data.teachers[name].timezone` when opening. If absent (old data), defaults to `"IST"` — no migration needed.

### No Changes To

- `dashboard.html` — shows `timeIST` label as stored
- `app.js` — passes `timeIST` through unchanged
- Data field names — `timeIST` stays `timeIST`

## Implementation Checklist

1. Add timezone `<select>` to the teacher editor HTML (in `addClassRow` template area, above the rows)
2. Add a `change` listener that updates the "(IST)"/"(PST)" label text in all class rows
3. Pre-populate timezone selector from `data.teachers[name].timezone` in `openTeacherEditor()`
4. Update `saveTeacher()` to read the selector and store `timezone` on teacher + use it in the `timeIST` label
5. Update `addClassRow()` label text to be dynamic (read from current timezone selector value)
