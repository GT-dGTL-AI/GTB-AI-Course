/* =========================================================
   GT BHARAT — main.js
   Scroll animations, course sync (card body + button + form
   toggle all stay in sync), coupon logic, form submit to
   Google Apps Script Web App, success modal + confetti.
   NO PRICING SHOWN — interest-only registration.
========================================================= */

// Your deployed Apps Script Web App URL (kept from previous working setup)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIcQB6B99fi_hrk1mLypt6ZyQKoh8TmKvJF_UfuvZgrbr3Z-ZgMNk1dITx8pDXp-wZ/exec";

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initRevealOnScroll();
  initScrollDots();
  initCourseSync();
  initCoupon();
  initFormSubmit();
  initModal();
});

/* ---------------- Fixed header background on scroll ---------------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------- Reveal-on-scroll (IntersectionObserver) ---------------- */
function initRevealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  items.forEach(el => observer.observe(el));
}

/* ---------------- Scroll-spy dots for section navigation ----------------
   Uses a thin horizontal "center band" of the viewport (rootMargin trick)
   instead of a percentage-of-target-height threshold, so a tall section
   like Register still lights up its dot correctly. A bottom-of-page
   fallback force-activates the last dot when scrolled all the way down. */
function initScrollDots() {
  const sections = document.querySelectorAll('main .section');
  const dots = document.querySelectorAll('.dot');
  if (!sections.length || !dots.length) return;

  const activate = (id) => {
    dots.forEach(dot => dot.classList.toggle('active', dot.dataset.target === id));
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activate(entry.target.getAttribute('id'));
      }
    });
  }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(sec => observer.observe(sec));

  window.addEventListener('scroll', () => {
    const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (scrolledToBottom) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) activate(lastSection.getAttribute('id'));
    }
  }, { passive: true });
}

/* ---------------- Course selection sync ----------------
   Three ways a user can pick a course, all kept in sync:
   1) Clicking anywhere on a course card body (.price-card)
   2) Clicking the "Choose ___" button inside a card (also scrolls to form)
   3) Clicking a toggle option directly inside the registration form
   Selecting via #1 or #2 highlights the chosen card with a purple
   outline (like the hover state) and checks the matching radio in the
   compact toggle at the top of the registration form. ---------------- */
function initCourseSync() {
  const cards = document.querySelectorAll('.price-card[data-course]');
  const buttons = document.querySelectorAll('.select-course-btn');

  function selectCourse(courseKey) {
    const radio = document.querySelector(`.course-toggle[data-course-radio="${courseKey}"] input`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    cards.forEach(card => {
      const isMatch = card.dataset.course === courseKey;
      card.classList.toggle('is-selected', isMatch);
      card.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
    const legend = document.querySelector('.course-select-field .field-error');
    if (legend) legend.remove();
  }

  // Card body click/keyboard selection (no auto-scroll — just selects)
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.select-course-btn')) return; // let button handler manage this click
      selectCourse(card.dataset.course);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCourse(card.dataset.course);
      }
    });
  });

  // "Choose ___" button: selects AND scrolls down to the registration form
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectCourse(btn.dataset.selectCourse);
      document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // If the user picks a course directly inside the form toggle, mirror it
  // back onto the course cards above for visual consistency.
  document.querySelectorAll('input[name="selectedPlan"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const label = e.target.closest('.course-toggle');
      const courseKey = label ? label.dataset.courseRadio : null;
      if (courseKey) {
        cards.forEach(card => {
          const isMatch = card.dataset.course === courseKey;
          card.classList.toggle('is-selected', isMatch);
          card.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        });
      }
      const legend = document.querySelector('.course-select-field .field-error');
      if (legend) legend.remove();
    });
  });
}

/* ---------------- Coupon logic ---------------- */
const VALID_COUPON = 'DGTLSAVE';
let couponApplied = false;

function initCoupon() {
  const applyBtn = document.getElementById('applyCouponBtn');
  const input = document.getElementById('couponInput');
  const box = document.querySelector('.coupon-box');

  applyBtn.addEventListener('click', () => {
    const code = input.value.trim().toUpperCase();
    if (!code) {
      showCouponMessage('Please enter a coupon code.', false);
      return;
    }
    if (code === VALID_COUPON) {
      couponApplied = true;
      box.classList.add('applied');
      showCouponMessage('Coupon applied! You saved 50% on your course fee.', true);
      document.getElementById('couponApplied').value = 'Yes';
      applyBtn.textContent = 'Applied';
      applyBtn.disabled = true;
      input.disabled = true;
    } else {
      couponApplied = false;
      box.classList.remove('applied');
      showCouponMessage('Invalid coupon code. Please check and try again.', false);
      document.getElementById('couponApplied').value = 'No';
    }
  });

  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase();
  });
}

function showCouponMessage(text, isSuccess) {
  const message = document.getElementById('couponMessage');
  message.textContent = text;
  message.classList.remove('success', 'error');
  message.classList.add(isSuccess ? 'success' : 'error');
}

/* ---------------- Form validation + submission to Apps Script ---------------- */
function initFormSubmit() {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    const selectedPlanRadio = document.querySelector('input[name="selectedPlan"]:checked');
    const payload = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      city: form.city.value.trim(),
      college: form.college.value.trim(),
      degree: form.degree.value.trim(),
      selectedPlan: selectedPlanRadio ? selectedPlanRadio.value : '',
      couponCode: couponApplied ? VALID_COUPON : '',
      couponApplied: document.getElementById('couponApplied').value,
      submittedAt: new Date().toISOString()
    };

    setSubmitting(true);

    try {
      if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } else {
        console.warn('APPS_SCRIPT_URL not configured. Payload logged instead of sent:', payload);
        await new Promise(res => setTimeout(res, 700));
      }
      setSubmitting(false);
      openSuccessModal();
      form.reset();
      resetCouponUI();
      document.querySelectorAll('.price-card.is-selected').forEach(card => {
        card.classList.remove('is-selected');
        card.setAttribute('aria-pressed', 'false');
      });
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitting(false);
      alert('Something went wrong while registering. Please check your connection and try again.');
    }
  });
}

function resetCouponUI() {
  couponApplied = false;
  const box = document.querySelector('.coupon-box');
  const applyBtn = document.getElementById('applyCouponBtn');
  const input = document.getElementById('couponInput');
  box.classList.remove('applied');
  applyBtn.textContent = 'Apply';
  applyBtn.disabled = false;
  input.disabled = false;
  input.value = '';
  document.getElementById('couponMessage').textContent = '';
  document.getElementById('couponApplied').value = 'No';
}

function setSubmitting(isSubmitting) {
  const submitBtn = document.getElementById('submitBtn');
  const text = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.btn-spinner');
  submitBtn.disabled = isSubmitting;
  spinner.hidden = !isSubmitting;
  text.textContent = isSubmitting ? 'Registering...' : 'Register Now';
}

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    const errorSpan = field.closest('.form-field, .course-select-field')?.querySelector('.field-error');
    field.classList.remove('invalid');

    if (field.type === 'radio') {
      const group = form.querySelectorAll(`[name="${field.name}"]`);
      const checked = Array.from(group).some(r => r.checked);
      if (!checked) {
        isValid = false;
        if (!form.querySelector('.course-select-field .field-error')) {
          const legend = form.querySelector('.course-select-field legend');
          const span = document.createElement('span');
          span.className = 'field-error';
          span.textContent = 'Please select a course.';
          legend.after(span);
        }
      } else {
        form.querySelector('.course-select-field .field-error')?.remove();
      }
      return;
    }

    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('invalid');
      if (errorSpan) errorSpan.textContent = 'This field is required.';
      return;
    }

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      isValid = false;
      field.classList.add('invalid');
      if (errorSpan) errorSpan.textContent = 'Please enter a valid email address.';
      return;
    }

    if (field.type === 'tel' && !/^[0-9+\s]{7,15}$/.test(field.value)) {
      isValid = false;
      field.classList.add('invalid');
      if (errorSpan) errorSpan.textContent = 'Please enter a valid phone number.';
      return;
    }

    if (errorSpan) errorSpan.textContent = '';
  });

  if (!isValid) {
    const firstInvalid = form.querySelector('.invalid, .course-select-field .field-error');
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

/* ---------------- Success modal + confetti celebration ---------------- */
function initModal() {
  const overlay = document.getElementById('successModal');
  const closeBtn = document.getElementById('modalClose');
  const okBtn = document.getElementById('modalOkBtn');

  [closeBtn, okBtn].forEach(btn => btn.addEventListener('click', closeSuccessModal));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSuccessModal();
  });
}

function openSuccessModal() {
  const overlay = document.getElementById('successModal');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  launchConfetti();
}

function closeSuccessModal() {
  const overlay = document.getElementById('successModal');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  stopConfetti();
}

/* Lightweight canvas confetti, no external libraries */
let confettiAnimId = null;

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#7C3AED', '#A855F7', '#C4B5FD', '#5B21B6', '#16A34A'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: -6 + Math.random() * 12
  }));

  let elapsed = 0;
  const duration = 2600;
  let lastTime = performance.now();

  function frame(now) {
    const dt = now - lastTime;
    lastTime = now;
    elapsed += dt;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (elapsed < duration) {
      confettiAnimId = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  confettiAnimId = requestAnimationFrame(frame);
}

function stopConfetti() {
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', () => {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
