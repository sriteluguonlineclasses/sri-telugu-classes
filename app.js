// ============================================
//   SRI TELUGU CLASSES — app.js
//   Student data · Auth · Schedule · Dashboard
// ============================================

// Student records live in students-data.js (window.STUDENTS), which is
// managed from admin.html — edit them there, not here.
var STUDENTS = window.STUDENTS || {};

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

function loginStudent(email, password) {
  const student = STUDENTS[email.toLowerCase()];
  if (!student) return { success: false, message: "No account found with this email address." };
  if (student.password !== password) return { success: false, message: "Incorrect password. Please try again." };

  // Store session without the password
  const session = Object.assign({}, student);
  delete session.password;
  localStorage.setItem("stc_student", JSON.stringify(session));
  return { success: true, student: session };
}

function logoutStudent() {
  localStorage.removeItem("stc_student");
  // Fade out before redirecting
  if (document.body && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    document.body.classList.add('page-leaving');
    setTimeout(function() { window.location.href = "login.html"; }, 260);
  } else {
    window.location.href = "login.html";
  }
}

function getSession() {
  try {
    const raw = localStorage.getItem("stc_student");
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

// ─────────────────────────────────────────────
//  SCHEDULE HELPERS
// ─────────────────────────────────────────────

function sessionStatus(dayOfWeek) {
  const today = new Date().getDay();          // 0–6
  if (dayOfWeek === today)  return "today";
  if (dayOfWeek < today)    return "completed";
  return "upcoming";
}

// Returns the Date object for "dayOfWeek" in the current week
function dateForDay(dayOfWeek) {
  const now  = new Date();
  const diff = dayOfWeek - now.getDay();
  const d    = new Date(now);
  d.setDate(now.getDate() + diff);
  return d;
}

// ─────────────────────────────────────────────
//  SCHEDULE RENDERER
// ─────────────────────────────────────────────

function buildSchedule(schedule) {
  const container = document.getElementById("scheduleList");
  if (!container) return;
  container.innerHTML = "";

  schedule.forEach(function(sess) {
    const status = sessionStatus(sess.dayOfWeek);
    const d      = dateForDay(sess.dayOfWeek);
    const dayNum  = d.getDate();
    const month   = d.toLocaleDateString("en-IN", { month: "short" });
    const dayAbbr = sess.dayName.substring(0, 3).toUpperCase();

    const itemClass  = status === "today" ? "is-today" : status === "completed" ? "is-done" : "";
    const badgeClass = status === "today" ? "badge-today" : status === "completed" ? "badge-completed" : "badge-upcoming";
    const badgeText  = status === "today" ? "Today" : status === "completed" ? "Completed" : "Upcoming";

    const meetHtml = status === "today"
      ? '<a href="' + sess.meetLink + '" target="_blank" rel="noopener" class="meet-btn meet-btn-active">🎥 Join Class</a>'
      : '<button class="meet-btn meet-btn-inactive" disabled>🎥 Join Class</button>';

    container.innerHTML += [
      '<div class="schedule-item ' + itemClass + '">',
        '<div class="sched-date">',
          '<div class="sched-dayname">' + dayAbbr + '</div>',
          '<div class="sched-daynum">'  + dayNum  + '</div>',
          '<div class="sched-month">'   + month   + '</div>',
        '</div>',
        '<div class="sched-divider"></div>',
        '<div class="sched-info">',
          '<div class="sched-course">'  + sess.course  + '</div>',
          '<div class="sched-time">⏰ ' + sess.timeIST + '</div>',
          '<div class="sched-teacher">👩‍🏫 ' + sess.teacher + '</div>',
        '</div>',
        '<span class="status-badge ' + badgeClass + '">' + badgeText + '</span>',
        meetHtml,
      '</div>'
    ].join("");
  });
}

// ─────────────────────────────────────────────
//  NOTICE BOARD RENDERER
// ─────────────────────────────────────────────

function buildNotices(notices) {
  const container = document.getElementById("noticesList");
  if (!container) return;
  container.innerHTML = "";

  if (!notices || notices.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:.88rem;">No notices at the moment.</p>';
    return;
  }

  notices.forEach(function(n) {
    const typeClass = n.type === "urgent" ? "urgent" : n.type === "info" ? "info" : "";
    container.innerHTML += [
      '<div class="notice-item ' + typeClass + '">',
        '<div class="notice-title">' + n.title + '</div>',
        '<div class="notice-body">'  + n.body  + '</div>',
        '<div class="notice-date">'  + n.date  + '</div>',
      '</div>'
    ].join("");
  });
}
