/* ==========================================================================
   MAYA CHEN — PORTFOLIO SCRIPT
   ==========================================================================
   Vanilla JavaScript, no external libraries. Every feature here is
   progressive enhancement: the site's HTML and CSS work fully without
   JS (nav links still navigate, the contact form still POSTs natively —
   see the note in initContactForm — and the footer year is only
   cosmetic). Nothing here is required for core functionality.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initNavToggle();
  initSkipLinkFocus();
  initContactForm();
  initBackToTop();
});

/* --------------------------------------------------------------------------
   FOOTER YEAR
   Keeps the copyright year current without hand-editing four HTML files
   every January.
   -------------------------------------------------------------------------- */
function initYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* --------------------------------------------------------------------------
   RESPONSIVE NAVIGATION MENU
   Toggles the mobile menu open/closed, keeps aria-expanded in sync so
   screen readers announce the button's state correctly, closes on
   Escape (returning focus to the toggle button so keyboard users don't
   lose their place), closes on outside click, and resets itself if the
   viewport is resized past the tablet breakpoint where the menu is
   always visible.
   -------------------------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  const MOBILE_BREAKPOINT = 640;

  function openMenu() {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function isOpen() {
    return nav.classList.contains("is-open");
  }

  toggle.addEventListener("click", () => {
    if (isOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = nav.contains(event.target) || toggle.contains(event.target);
    if (!clickedInsideNav && isOpen()) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT && isOpen()) {
      closeMenu();
    }
  });
}

/* --------------------------------------------------------------------------
   SMOOTH SCROLLING WITH FOCUS MANAGEMENT
   CSS `scroll-behavior: smooth` handles the visual motion (and is
   automatically disabled for prefers-reduced-motion users via the
   stylesheet). This handler adds the accessibility piece CSS can't:
   after an in-page jump, keyboard focus is moved to the target so
   screen-reader and keyboard users land where sighted users land,
   instead of focus staying on the link they just activated.
   -------------------------------------------------------------------------- */
function initSkipLinkFocus() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      // Let the browser perform the native smooth scroll first.
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // Make the target programmatically focusable just long enough
      // to receive focus, then let it fall back out of the tab order.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
    });
  });
}

/* --------------------------------------------------------------------------
   CONTACT FORM VALIDATION
   Runs on submit and re-validates a field on blur once the user has
   attempted a submission. Errors are written into the <span
   class="field-error"> that each input's aria-describedby already
   points to, so screen readers announce the message in context of the
   field, and a role="status" summary announces the overall result.

   Note: there is no backend in this deliverable, so a real submit
   handler (e.g. fetch() to an API endpoint, or leaving the form's
   native action/method in place for a server to handle) should replace
   the "simulate a successful submission" block marked below.
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");

  const fields = {
    "full-name": {
      validate: (value) => value.trim().length > 0,
      message: "Enter your full name.",
    },
    email: {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: "Enter a valid email address, like name@example.com.",
    },
    subject: {
      validate: (value) => value.trim().length > 0,
      message: "Enter a subject line.",
    },
    message: {
      validate: (value) => value.trim().length >= 10,
      message: "Enter a message of at least 10 characters.",
    },
  };

  function validateField(name) {
    const input = form.elements.namedItem(name);
    const errorEl = document.getElementById(`${name}-error`);
    const fieldWrapper = input.closest(".form-field");
    const rule = fields[name];

    const isValid = rule.validate(input.value);

    if (isValid) {
      errorEl.textContent = "";
      fieldWrapper.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
    } else {
      errorEl.textContent = rule.message;
      fieldWrapper.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
    }

    return isValid;
  }

  // Re-validate a field as soon as the user leaves it, so errors clear
  // promptly rather than only at the next full-form submit attempt.
  Object.keys(fields).forEach((name) => {
    const input = form.elements.namedItem(name);
    if (input) {
      input.addEventListener("blur", () => validateField(name));
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = Object.keys(fields).map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      status.textContent = "Please fix the highlighted fields and try again.";
      // Move focus to the first invalid field so keyboard and
      // screen-reader users are taken directly to the problem.
      const firstInvalidName = Object.keys(fields).find((name) => {
        return document.getElementById(`${name}-error`).textContent !== "";
      });
      if (firstInvalidName) {
        form.elements.namedItem(firstInvalidName).focus();
      }
      return;
    }

    // --- Simulate a successful submission -------------------------------
    // Replace this block with a real request, e.g.:
    //   fetch("/api/contact", { method: "POST", body: new FormData(form) })
    status.textContent = "Thanks — your message has been sent. I'll reply within two business days.";
    form.reset();
    Object.keys(fields).forEach((name) => {
      document.getElementById(`${name}-error`).textContent = "";
      form.elements.namedItem(name).closest(".form-field").classList.remove("has-error");
    });
  });
}

/* --------------------------------------------------------------------------
   BACK-TO-TOP BUTTON
   Appears once the reader has scrolled past one viewport height and
   scrolls smoothly back to the top on click. The button exists in the
   DOM on every page load (see markup) so it degrades gracefully — with
   JS disabled it simply never becomes visible, which is the correct
   fallback since it has no keyboard-accessible purpose without script.
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  const SHOW_AFTER_PX = window.innerHeight;

  function toggleVisibility() {
    if (window.scrollY > SHOW_AFTER_PX) {
      button.classList.add("is-visible");
    } else {
      button.classList.remove("is-visible");
    }
  }

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Return focus to the top of the page's tab order after the jump.
    document.body.setAttribute("tabindex", "-1");
    document.body.focus({ preventScroll: true });
    document.body.addEventListener("blur", () => document.body.removeAttribute("tabindex"), { once: true });
  });
}