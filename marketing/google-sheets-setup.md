# Auto-log leads to Google Sheets (free, ~10 minutes)

Goal: every "Get Free Trial" submission **emails you** (already working) **and appends a row to
a Google Sheet** automatically — no Zapier, no paid plan.

How it works: the form POSTs the lead to a tiny Google Apps Script "web app" bound to your
Sheet. The script appends a row.

---

## Step 1 — Create the Sheet

1. Go to https://sheets.google.com → **Blank spreadsheet**.
2. Name it e.g. **Sri Telugu Classes — Leads**.
3. Leave it empty (the script adds the header row on the first submission).

## Step 2 — Add the Apps Script

1. In that Sheet: **Extensions ▸ Apps Script**.
2. Delete any sample code and paste this:

```javascript
// Appends each website lead as a new row. Returns plain text (no CORS headers needed
// because the site posts with mode:'no-cors').
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // avoid two submissions colliding
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data  = JSON.parse(e.postData.contents);

    // Create the header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Submitted At', 'Name', 'Email', 'Phone/WhatsApp',
        'Location', 'Who\'s Learning', 'Age', 'Course', 'Status'
      ]);
    }

    sheet.appendRow([
      data.submitted_at || new Date().toISOString(),
      data.name     || '',
      data.email    || '',
      data.phone    || '',
      data.location || '',
      data.learner  || '',
      data.age      || '',
      data.course   || '',
      'New'
    ]);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  } finally {
    lock.releaseLock();
  }
}
```

3. Click **Save** (💾).

## Step 3 — Deploy as a Web App

1. Top right: **Deploy ▸ New deployment**.
2. Click the gear ⚙ next to "Select type" → choose **Web app**.
3. Set:
   - **Description:** Leads endpoint
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**  ← required so the website can post
4. Click **Deploy**, then **Authorize access** and approve the Google permission prompt
   (it's your own script writing to your own sheet).
5. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfy...long.../exec`

## Step 4 — Paste the URL into the site

In `main.js`, find:

```javascript
var SHEETS_ENDPOINT = '';
```

and paste your URL between the quotes:

```javascript
var SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```

Then commit & push (or ask Claude to). Once it deploys, every new lead lands in both your
**Gmail inbox** and the **Google Sheet**.

## Step 5 — Test

Submit a test lead on the live site. Within a few seconds a new row should appear in the Sheet,
and the email should arrive in `sriteluguonlineclasses@gmail.com`.

---

### Notes
- **Changing the script later?** You must **Deploy ▸ Manage deployments ▸ Edit ▸ Version: New**
  for changes to take effect (a fresh save alone won't update the live web app).
- The Sheet is your editable CRM now — you can sort, add a "Follow-up Date" column, colour-code
  the Status, etc. (This replaces manually copying from `leads-tracker.csv`.)
- The email remains the reliable channel; the Sheet write is best-effort, so a rare Google
  hiccup never blocks a submission.
