// ============================================
//   SRI TELUGU CLASSES — app.js
//   Student data · Auth · Schedule · Dashboard
// ============================================

// To add a new student: copy the "student@example.com" block,
// change the key to their email, and update all fields below.
const STUDENTS = {
  "student@example.com": {
    password:  "telugu123",
    name:      "Arjun Reddy",
    batch:     "Batch B",
    level:     "Intermediate",
    email:     "student@example.com",
    avatar:    "AR",   // initials shown in the sidebar avatar
    attendance: {
      total:    24,
      attended: 21,
      upcoming:  3
    },
    // dayOfWeek: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
    schedule: [
      {
        dayOfWeek: 1,
        dayName:   "Monday",
        timeIST:   "5:00 PM – 6:00 PM IST",
        course:    "Telugu Basics",
        teacher:   "Mrs. Lakshmi Devi",
        meetLink:  "https://meet.google.com/abc-defg-hij"
      },
      {
        dayOfWeek: 3,
        dayName:   "Wednesday",
        timeIST:   "6:00 PM – 7:00 PM IST",
        course:    "Spoken Telugu",
        teacher:   "Mr. Ravi Kumar",
        meetLink:  "https://meet.google.com/xyz-uvwx-yzp"
      },
      {
        dayOfWeek: 5,
        dayName:   "Friday",
        timeIST:   "4:30 PM – 5:30 PM IST",
        course:    "Culture & Stories",
        teacher:   "Mrs. Padma Rao",
        meetLink:  "https://meet.google.com/def-ghij-klm"
      }
    ],
    notices: [
      {
        type:  "info",
        title: "This Week's Google Meet Links Sent",
        body:  "Meet links for all three classes this week have been shared on the WhatsApp group. Please join 5 minutes early to avoid disruption.",
        date:  "Jun 8, 2026"
      },
      {
        type:  "default",
        title: "Mid-term Assessment — Next Monday",
        body:  "A short reading and speaking assessment will be held during Monday's Telugu Basics class. Revision notes shared on the group.",
        date:  "Jun 6, 2026"
      },
      {
        type:  "urgent",
        title: "Holiday Notice — No Class June 15",
        body:  "There will be no classes on June 15 (public holiday). Classes resume on June 16 as usual.",
        date:  "Jun 5, 2026"
      }
    ]
  }
  // Add more students here:
  // "another@email.com": { password: "pass123", name: "...", ... }
};

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
  window.location.href = "login.html";
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
