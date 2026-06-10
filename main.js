// ============================================
//   SRI TELUGU CLASSES - main.js (extracted from index.html inline scripts)
// ============================================

  // ── Page Transitions ──
  (function() {
    // Trigger fade-in on page load
    document.body.classList.add('page-entering');
    // Remove class after animation completes (keeps it clean for in-page scroll)
    document.body.addEventListener('animationend', function onEnter(e) {
      if (e.animationName === 'page-fade-in') {
        document.body.classList.remove('page-entering');
        document.body.removeEventListener('animationend', onEnter);
      }
    });

    // Intercept internal link clicks for fade-out before navigation
    document.addEventListener('click', function(e) {
      var target = e.target.closest('a[href]');
      if (!target) return;
      var href = target.getAttribute('href');
      if (!href) return;

      // Skip: external links, new-tab links, hash-only anchors (#something on same page),
      //       javascript: links, and mailto:/tel: links
      var isExternal   = target.hostname && target.hostname !== window.location.hostname;
      var isHashOnly   = href.charAt(0) === '#';
      var isSpecial    = /^(mailto:|tel:|javascript:)/i.test(href);
      var opensNewTab  = target.target === '_blank';

      if (isExternal || isHashOnly || isSpecial || opensNewTab) return;

      // It's an internal page navigation — do the fade-out
      e.preventDefault();
      var dest = target.href; // resolved absolute URL

      document.body.classList.add('page-leaving');
      setTimeout(function() {
        window.location.href = dest;
      }, 260);
    });
  })();

  // Hamburger menu
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');
  hamburger.addEventListener('click', function() {
    var open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', function(e) {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // ── Inline form validation helpers ──
  var emailInput = document.getElementById('enrollEmail');
  var phoneInput = document.getElementById('enrollPhone');
  var emailError = document.getElementById('emailError');
  var phoneError = document.getElementById('phoneError');

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }
  function isValidPhone(v) {
    // allow empty (optional field), or digits/spaces/+/-/() with min 6 digits
    if (!v) return true;
    return /^[\d\s\+\-\(\)]{6,}$/.test(v);
  }

  function setFieldState(input, errorEl, valid, dirty) {
    if (!dirty) {
      input.classList.remove('field-error', 'field-ok');
      errorEl.classList.remove('visible');
      return;
    }
    if (valid) {
      input.classList.remove('field-error');
      input.classList.add('field-ok');
      errorEl.classList.remove('visible');
    } else {
      input.classList.remove('field-ok');
      input.classList.add('field-error');
      errorEl.classList.add('visible');
    }
  }

  emailInput.addEventListener('input', function() {
    var v = emailInput.value.trim();
    setFieldState(emailInput, emailError, isValidEmail(v), v.length > 0);
  });
  emailInput.addEventListener('blur', function() {
    var v = emailInput.value.trim();
    if (v.length === 0) {
      // show error only after blur if field was left empty but required
      setFieldState(emailInput, emailError, false, true);
      emailError.textContent = 'Email is required.';
    } else {
      emailError.textContent = 'Please enter a valid email address.';
      setFieldState(emailInput, emailError, isValidEmail(v), true);
    }
  });

  phoneInput.addEventListener('input', function() {
    var v = phoneInput.value.trim();
    setFieldState(phoneInput, phoneError, isValidPhone(v), v.length > 0);
  });
  phoneInput.addEventListener('blur', function() {
    var v = phoneInput.value.trim();
    setFieldState(phoneInput, phoneError, isValidPhone(v), v.length > 0);
  });

  // ── CountUp Animation for Stats Bar ──
  (function() {
    var countupEls = document.querySelectorAll('[data-countup]');
    if (!countupEls.length) return;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateCount(el) {
      var target   = parseFloat(el.getAttribute('data-countup'));
      var suffix   = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var duration = 1800; // ms
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed  = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easedProgress = easeOutQuart(progress);
        var current  = easedProgress * target;
        el.textContent = current.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      countupEls.forEach(function(el) {
        observer.observe(el);
      });
    }
    // Fallback: no animation if IntersectionObserver unsupported — native values remain
  })();

  // ── FAQ Accordion ──
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answerId = btn.getAttribute('aria-controls');
      var answer   = document.getElementById(answerId);

      // Close all other items
      document.querySelectorAll('.faq-question').forEach(function(other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.closest('.faq-item').classList.remove('faq-open');
          var otherId = other.getAttribute('aria-controls');
          var otherAns = document.getElementById(otherId);
          otherAns.hidden = true;
          otherAns.style.maxHeight = '0';
        }
      });

      // Toggle this item
      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        btn.closest('.faq-item').classList.remove('faq-open');
        answer.style.maxHeight = '0';
        setTimeout(function() { answer.hidden = true; }, 320);
      } else {
        answer.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        btn.closest('.faq-item').classList.add('faq-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ── Scroll-reveal animations ──
  (function() {
    // Bail out if browser doesn't support IntersectionObserver or prefers reduced motion
    if (!('IntersectionObserver' in window)) {
      // Fallback: immediately reveal everything
      document.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('revealed');
      });
      return;
    }

    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target); // animate once
        }
      });
    }, {
      threshold: 0.12,      // trigger when 12% of element is visible
      rootMargin: '0px 0px -32px 0px'  // small bottom offset so elements reveal just before reaching viewport edge
    });

    document.querySelectorAll('.reveal').forEach(function(el) {
      revealObserver.observe(el);
    });
  })();

  // ── Urgency Banner — dismiss with sessionStorage ──
  (function() {
    var banner = document.getElementById('urgencyBanner');
    var closeBtn = document.getElementById('urgencyClose');
    if (!banner || !closeBtn) return;

    // If already dismissed this session, hide immediately
    if (sessionStorage.getItem('urgencyBannerDismissed') === '1') {
      banner.style.display = 'none';
      return;
    }

    closeBtn.addEventListener('click', function() {
      banner.classList.add('urgency-banner--hiding');
      // Wait for animation then hide
      setTimeout(function() {
        banner.style.display = 'none';
      }, 340);
      sessionStorage.setItem('urgencyBannerDismissed', '1');
    });
  })();

  // ── Batch Countdown Strip ──
  (function() {
    // Target: July 7, 2026 at 09:00 AM UTC
    var TARGET = new Date('2026-07-07T09:00:00Z').getTime();

    var wrap   = document.getElementById('batchCountdown');
    var elDays = document.getElementById('cdDays');
    var elHrs  = document.getElementById('cdHours');
    var elMins = document.getElementById('cdMins');
    var elSecs = document.getElementById('cdSecs');
    if (!wrap || !elDays) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    // Flash the number briefly to signal a tick
    function tick(el, newVal) {
      var cur = el.textContent;
      if (cur === newVal) return;
      el.textContent = newVal;
      el.classList.remove('cd-tick');
      // Force reflow then re-add class
      void el.offsetWidth;
      el.classList.add('cd-tick');
      setTimeout(function() { el.classList.remove('cd-tick'); }, 250);
    }

    function update() {
      var diff = TARGET - Date.now();
      if (diff <= 0) {
        // Batch has started — swap text
        wrap.classList.add('cd-expired');
        var label = wrap.querySelector('.batch-countdown-label');
        if (label) label.textContent = 'New batch is now open — join today!';
        clearInterval(timer);
        return;
      }

      var totalSecs  = Math.floor(diff / 1000);
      var secs       = totalSecs % 60;
      var totalMins  = Math.floor(totalSecs / 60);
      var mins       = totalMins % 60;
      var totalHours = Math.floor(totalMins / 60);
      var hours      = totalHours % 24;
      var days       = Math.floor(totalHours / 24);

      tick(elDays, pad(days));
      tick(elHrs,  pad(hours));
      tick(elMins, pad(mins));
      tick(elSecs, pad(secs));
    }

    update(); // immediate first render
    var timer = setInterval(update, 1000);
  })();

  // ── Navbar: scroll-shadow + active link highlighting ──
  (function() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    // --- Scroll shadow ---
    function onScroll() {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // --- Active link highlighting via IntersectionObserver ---
    // Map each section id to its nav anchor
    var sectionIds = ['main', 'courses', 'teachers', 'testimonials', 'faq', 'enroll'];
    var navMap = {};
    sectionIds.forEach(function(id) {
      var anchor = navbar.querySelector('a[href="#' + id + '"]');
      if (anchor) navMap[id] = anchor;
    });

    if (!('IntersectionObserver' in window)) return;

    var activeId = null;

    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      Object.values(navMap).forEach(function(a) {
        a.classList.remove('nav-active');
      });
      if (id && navMap[id]) {
        navMap[id].classList.add('nav-active');
      }
    }

    var sectionObserver = new IntersectionObserver(function(entries) {
      // Find the entry with the largest intersection ratio that is intersecting
      var best = null;
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
      });
      if (best) {
        setActive(best.target.id);
      } else {
        // If nothing is intersecting from this batch, check all observed targets
        // to see which one is currently visible (handles fast scrolling)
      }
    }, {
      // Use a tall rootMargin so sections trigger well before they fully enter
      rootMargin: '-10% 0px -60% 0px',
      threshold: [0, 0.1, 0.25, 0.5]
    });

    sectionIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  })();

  // ── Enroll form — email notification via Web3Forms ──
  document.getElementById('enrollForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var email = emailInput.value.trim();
    var phone = phoneInput.value.trim();

    // Validate on submit
    var emailOk = email.length > 0 && isValidEmail(email);
    var phoneOk = isValidPhone(phone);

    if (!emailOk) {
      emailError.textContent = email.length === 0 ? 'Email is required.' : 'Please enter a valid email address.';
      setFieldState(emailInput, emailError, false, true);
      emailInput.focus();
    }
    if (!phoneOk) {
      setFieldState(phoneInput, phoneError, false, true);
    }
    if (!emailOk || !phoneOk) return;

    // Honeypot tripped — pretend success, send nothing
    var honeypot = document.getElementById('enrollCompany');
    if (honeypot && honeypot.value) {
      document.getElementById('enrollSuccess').style.display = 'block';
      document.getElementById('enrollForm').reset();
      return;
    }

    var btn = this.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    var emailPromise = fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: '9f5b7aa0-f795-4602-80e6-aeee26c3082c',
        subject:    'New Enrollment Request — Sri Telugu Classes',
        from_name:  'Sri Telugu Classes Website',
        email:      email,
        phone:      phone || 'Not provided',
        message:    'New enrollment:\nEmail: ' + email + '\nPhone: ' + (phone || 'Not provided')
      })
    });

    emailPromise
      .then(function() {
        document.getElementById('enrollSuccess').style.display = 'block';
        document.getElementById('enrollForm').reset();
        setFieldState(emailInput, emailError, false, false);
        setFieldState(phoneInput, phoneError, false, false);
        btn.textContent = 'Get Free Trial →';
        btn.disabled = false;
      })
      .catch(function() {
        btn.textContent = 'Get Free Trial →';
        btn.disabled = false;
        // Inline error — no alert()
        var errP = document.getElementById('enrollSuccess');
        errP.style.display = 'block';
        errP.style.color = '#FCA5A5';
        errP.textContent = 'Something went wrong. Please email sriteluguonlineclasses@gmail.com';
      });
  });

  // ── Mobile sticky bottom CTA bar ──
  (function() {
    var bar      = document.getElementById('mobileCta');
    var closeBtn = document.getElementById('mobileCtaClose');
    var ctaBtn   = document.getElementById('mobileCtaBtn');
    if (!bar || !closeBtn) return;

    // If already dismissed this session, never show
    if (sessionStorage.getItem('mobileCtaDismissed') === '1') {
      bar.style.display = 'none';
      return;
    }

    var shown = false;

    function showBar() {
      if (shown) return;
      shown = true;
      bar.classList.add('mobile-cta-bar--visible');
    }

    function onScroll() {
      if (window.scrollY > 300) showBar();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // in case page loads already scrolled

    closeBtn.addEventListener('click', function() {
      bar.classList.remove('mobile-cta-bar--visible');
      bar.classList.add('mobile-cta-bar--hiding');
      sessionStorage.setItem('mobileCtaDismissed', '1');
      setTimeout(function() { bar.style.display = 'none'; }, 320);
    });

    // Hide the bar once user reaches enroll section
    if ('IntersectionObserver' in window) {
      var enrollSection = document.getElementById('enroll');
      if (enrollSection) {
        var enrollObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              bar.classList.remove('mobile-cta-bar--visible');
            } else if (shown) {
              bar.classList.add('mobile-cta-bar--visible');
            }
          });
        }, { threshold: 0.1 });
        enrollObs.observe(enrollSection);
      }
    }
  })();

  // ── Floating Telugu Word of the Day ──
  (function() {
    var card     = document.getElementById('wotdCard');
    var closeBtn = document.getElementById('wotdClose');
    var elTelugu = document.getElementById('wotdTelugu');
    var elRoman  = document.getElementById('wotdRomanized');
    var elTrans  = document.getElementById('wotdTranslation');
    if (!card || !closeBtn) return;

    // 30 curated Telugu words with pronunciation & translation
    var words = [
      { t: 'నీళ్ళు',    r: 'Nīḷḷu',       e: 'Water'        },
      { t: 'నమస్కారం', r: 'Namaskāram',   e: 'Greetings'    },
      { t: 'ప్రేమ',     r: 'Prēma',        e: 'Love'         },
      { t: 'మనసు',      r: 'Manasu',       e: 'Heart / Mind' },
      { t: 'ఆకాశం',    r: 'Ākāśam',       e: 'Sky'          },
      { t: 'పువ్వు',    r: 'Puvvu',        e: 'Flower'       },
      { t: 'చందమామ',   r: 'Chandamāma',   e: 'Moon'         },
      { t: 'ఆనందం',    r: 'Ānandaṁ',      e: 'Happiness'    },
      { t: 'స్నేహం',    r: 'Snēham',       e: 'Friendship'   },
      { t: 'అమ్మ',      r: 'Amma',         e: 'Mother'       },
      { t: 'నేను',      r: 'Nēnu',         e: 'I / Me'       },
      { t: 'తెలుగు',    r: 'Telugu',       e: 'Telugu'       },
      { t: 'పాట',       r: 'Pāṭa',         e: 'Song'         },
      { t: 'పుస్తకం',  r: 'Pustakam',     e: 'Book'         },
      { t: 'ఇల్లు',     r: 'Illu',         e: 'House / Home' },
      { t: 'విద్య',     r: 'Vidya',        e: 'Education'    },
      { t: 'శాంతి',     r: 'Śānti',        e: 'Peace'        },
      { t: 'కల',        r: 'Kala',         e: 'Dream'        },
      { t: 'సముద్రం',  r: 'Samudrāṁ',    e: 'Ocean'        },
      { t: 'వెలుతురు', r: 'Veluṯuru',     e: 'Light'        },
      { t: 'రాత్రి',   r: 'Rātri',        e: 'Night'        },
      { t: 'నక్షత్రం', r: 'Nakṣatram',    e: 'Star'         },
      { t: 'చెట్టు',   r: 'Cheṭṭu',       e: 'Tree'         },
      { t: 'పిల్ల',     r: 'Pilla',        e: 'Child'        },
      { t: 'గుండె',    r: 'Guṇḍe',        e: 'Heart (organ)'},
      { t: 'ఊరు',      r: 'Ūru',           e: 'Village'      },
      { t: 'నవ్వు',    r: 'Navvu',         e: 'Smile / Laugh'},
      { t: 'వర్షం',    r: 'Varṣam',        e: 'Rain'         },
      { t: 'బంగారు',   r: 'Baṅgāru',      e: 'Gold / Dear'  },
      { t: 'కథ',        r: 'Katha',        e: 'Story'        }
    ];

    // Pick word deterministically by day-of-year (changes daily, same for all users)
    var now = new Date();
    var dayOfYear = Math.floor(
      (now - new Date(now.getFullYear(), 0, 0)) / 86400000
    );
    var todayWord = words[dayOfYear % words.length];

    // Check localStorage — dismissed today? Use date string as key
    var todayKey = 'wotd_dismissed_' + now.getFullYear() + '_' + (now.getMonth()+1) + '_' + now.getDate();
    if (localStorage.getItem(todayKey) === '1') return;

    // Populate content
    elTelugu.textContent = todayWord.t;
    elRoman.textContent  = todayWord.r;
    elTrans.textContent  = todayWord.e;

    // Show card after 5 seconds
    var showTimer = setTimeout(function() {
      card.classList.add('wotd-visible');
    }, 5000);

    // Dismiss handler
    function dismiss() {
      card.classList.remove('wotd-visible');
      card.classList.add('wotd-hiding');
      localStorage.setItem(todayKey, '1');
      setTimeout(function() {
        card.style.display = 'none';
      }, 320);
    }

    closeBtn.addEventListener('click', dismiss);

    // Also dismiss when user reaches enroll section (not intrusive)
    if ('IntersectionObserver' in window) {
      var enrollEl = document.getElementById('enroll');
      if (enrollEl) {
        var wotdObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              dismiss();
              wotdObs.disconnect();
            }
          });
        }, { threshold: 0.3 });
        wotdObs.observe(enrollEl);
      }
    }
  })();

  // ── Back to Top Button ──
  (function() {
    var btt = document.getElementById('backToTop');
    if (!btt) return;

    var SCROLL_THRESHOLD = 400; // px from top before button appears
    var ticking = false;

    function updateBtt() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        btt.classList.add('btt-visible');
      } else {
        btt.classList.remove('btt-visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateBtt);
        ticking = true;
      }
    }, { passive: true });

    // Run once on load in case the page is already scrolled
    updateBtt();

    btt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Move focus to the top of the page for keyboard/AT users
      var topTarget = document.getElementById('main') || document.body;
      if (topTarget) {
        topTarget.setAttribute('tabindex', '-1');
        topTarget.focus({ preventScroll: true });
      }
    });
  })();

  // ── Dark Mode Toggle ──
  (function() {
    var btn = document.getElementById('darkToggle');
    if (!btn) return;

    function getTheme() {
      try { return localStorage.getItem('stc-theme') || 'light'; } catch(e) { return 'light'; }
    }
    function setTheme(theme) {
      try { localStorage.setItem('stc-theme', theme); } catch(e) {}
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title',      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Set initial aria-label
    setTheme(getTheme());

    btn.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  })();

  // ── Scroll Progress Bar ──
  (function() {
    var bar = document.getElementById('scrollProgressBar');
    if (!bar) return;

    var rafPending = false;

    function updateBar() {
      var scrollTop  = window.scrollY || window.pageYOffset;
      var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        bar.style.width = '0%';
        bar.setAttribute('aria-valuenow', '0');
        bar.classList.add('spb-hidden');
        rafPending = false;
        return;
      }

      var pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      bar.style.width = pct.toFixed(2) + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));

      // Hide bar when at the very top (not useful to show 0% line)
      if (pct < 0.5) {
        bar.classList.add('spb-hidden');
      } else {
        bar.classList.remove('spb-hidden');
      }

      rafPending = false;
    }

    window.addEventListener('scroll', function() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateBar);
      }
    }, { passive: true });

    // Initial state
    updateBar();
  })();

  // ── Cookie Consent Banner ──
  (function() {
    var banner    = document.getElementById('cookieBanner');
    var acceptBtn = document.getElementById('cookieAccept');
    var declineBtn= document.getElementById('cookieDecline');
    if (!banner || !acceptBtn || !declineBtn) return;

    var STORAGE_KEY = 'stc-cookies';

    // If already decided, never show
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch(e) {}

    function hideBanner() {
      banner.classList.remove('cookie-banner--visible');
      banner.classList.add('cookie-banner--hiding');
      setTimeout(function() {
        banner.style.display = 'none';
      }, 340);
    }

    function decide(choice) {
      try { localStorage.setItem(STORAGE_KEY, choice); } catch(e) {}
      hideBanner();
    }

    acceptBtn.addEventListener('click',  function() { decide('accepted'); });
    declineBtn.addEventListener('click', function() { decide('declined'); });

    // Show after 1.2 s so it doesn't compete with page-entrance animation
    setTimeout(function() {
      banner.classList.add('cookie-banner--visible');
    }, 1200);
  })();

// ============================================
//  PWA: service worker + install prompts
// ============================================
(function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js');
    });
  }

  var DISMISS_KEY = 'stc-install-dismissed';
  var dismissed = false;
  try { dismissed = !!localStorage.getItem(DISMISS_KEY); } catch (e) {}
  var standalone = window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone === true;
  if (dismissed || standalone) return;

  function makeBar(html) {
    var bar = document.createElement('div');
    bar.className = 'install-tip';
    bar.innerHTML = html + '<button class="install-tip-close" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(bar);
    bar.querySelector('.install-tip-close').addEventListener('click', function() {
      bar.remove();
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
    });
    return bar;
  }

  // Android / desktop Chrome: real install prompt
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    var bar = makeBar('<span>📲 Get the Sri Telugu Classes app</span><button class="install-tip-btn">Install</button>');
    bar.querySelector('.install-tip-btn').addEventListener('click', function() {
      bar.remove();
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function() { deferredPrompt = null; });
    });
  });

  // iPhone/iPad Safari: manual hint (no beforeinstallprompt on iOS)
  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIos) {
    setTimeout(function() {
      makeBar('<span>📲 Install this app: tap <strong>Share</strong> <span style="font-size:1.1em;">⎙</span> then <strong>“Add to Home Screen”</strong></span>');
    }, 4000);
  }
})();