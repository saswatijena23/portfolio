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
  initTaskManager();
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

/* ==========================================================================
   TASK MANAGER — "My Task Manager" section on the Home page
   ==========================================================================
   Self-contained CRUD to-do app: state lives in one array, localStorage
   persists it, and the DOM is always re-rendered from that state rather
   than hand-edited in place. All row-level interactions (complete, edit,
   delete) use event delegation on the single <ul>, so no listeners are
   attached per-task.
   ========================================================================== */

const TASKS_STORAGE_KEY = "maya-chen-portfolio-tasks";

function initTaskManager() {
  const form = document.getElementById("task-form");
  const list = document.getElementById("task-list");
  if (!form || !list) return; // Section only exists on the Home page.

  const input = document.getElementById("task-input");
  const inputError = document.getElementById("task-input-error");
  const searchInput = document.getElementById("task-search-input");
  const sortSelect = document.getElementById("task-sort-select");
  const filterButtons = document.querySelectorAll(".task-filter-btn");
  const clearCompletedBtn = document.getElementById("clear-completed-btn");
  const emptyState = document.getElementById("task-empty-state");
  const statTotal = document.getElementById("stat-total");
  const statCompleted = document.getElementById("stat-completed");
  const statRemaining = document.getElementById("stat-remaining");

  /* ---- State ---- */
  let tasks = loadTasks();
  let currentFilter = "all";       // "all" | "active" | "completed"
  let currentSort = "newest";      // "newest" | "oldest" | "alphabetical"
  let currentSearch = "";
  let editingTaskId = null;        // id of the task currently in edit mode

  /* ------------------------------------------------------------------
     LOCAL STORAGE
     ------------------------------------------------------------------ */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Corrupted or inaccessible storage — start from an empty list
      // rather than letting the whole page fail to load.
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      // Storage full or unavailable (e.g. private browsing) — the app
      // still works for the current session, it just won't persist.
    }
  }

  /* ------------------------------------------------------------------
     CREATE
     ------------------------------------------------------------------ */
  function addTask(rawText) {
    const text = rawText.trim();

    if (!text) {
      showInputError("Enter a task before adding it.");
      return;
    }

    const isDuplicateActive = tasks.some(
      (task) => !task.completed && task.text.toLowerCase() === text.toLowerCase()
    );
    if (isDuplicateActive) {
      showInputError("That task is already on your list.");
      return;
    }

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };

    tasks.push(newTask);
    clearInputError();
    input.value = "";
    persistAndRender();
  }

  function showInputError(message) {
    inputError.textContent = message;
    input.classList.add("has-error");
  }

  function clearInputError() {
    inputError.textContent = "";
    input.classList.remove("has-error");
  }

  /* ------------------------------------------------------------------
     UPDATE
     ------------------------------------------------------------------ */
  function toggleTaskCompleted(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) task.completed = !task.completed;
    persistAndRender();
  }

  function updateTaskText(id, rawText) {
    const text = rawText.trim();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // An edit that's emptied out is treated as "cancel", not "delete" —
    // the original text is kept rather than silently losing the task.
    if (text) {
      task.text = text;
    }
    editingTaskId = null;
    persistAndRender();
  }

  function cancelEditing() {
    editingTaskId = null;
    renderTasks();
  }

  /* ------------------------------------------------------------------
     DELETE
     ------------------------------------------------------------------ */
  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    persistAndRender();
  }

  function clearCompletedTasks() {
    tasks = tasks.filter((t) => !t.completed);
    persistAndRender();
  }

  /* ------------------------------------------------------------------
     READ / DERIVE — filtering, search, sort are all computed from state
     at render time rather than mutating the stored task list.
     ------------------------------------------------------------------ */
  function getVisibleTasks() {
    let result = tasks;

    if (currentFilter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (currentFilter === "completed") {
      result = result.filter((t) => t.completed);
    }

    if (currentSearch) {
      const query = currentSearch.toLowerCase();
      result = result.filter((t) => t.text.toLowerCase().includes(query));
    }

    result = [...result].sort((a, b) => {
      if (currentSort === "newest") return b.createdAt - a.createdAt;
      if (currentSort === "oldest") return a.createdAt - b.createdAt;
      if (currentSort === "alphabetical") return a.text.localeCompare(b.text);
      return 0;
    });

    return result;
  }

  /* ------------------------------------------------------------------
     RENDER — the DOM is fully rebuilt from state on every change using
     createElement()/append(), never innerHTML string-building, so task
     text is always safely escaped by the DOM API rather than concatenated
     into markup.
     ------------------------------------------------------------------ */
  function renderTasks() {
    const visibleTasks = getVisibleTasks();

    const fragment = document.createDocumentFragment();
    visibleTasks.forEach((task) => {
      fragment.appendChild(
        task.id === editingTaskId ? buildEditingTaskElement(task) : buildTaskElement(task)
      );
    });

    list.replaceChildren(fragment);

    const hasAnyTasks = tasks.length > 0;
    const hasVisibleTasks = visibleTasks.length > 0;
    emptyState.textContent = !hasAnyTasks
      ? "No tasks yet — add one above to get started."
      : "No tasks match the current filter or search.";
    emptyState.hidden = hasVisibleTasks;

    renderStats();
  }

  function buildTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-item" + (task.completed ? " is-completed" : "");
    item.dataset.taskId = task.id;

    // Checkbox
    const checkboxWrapper = document.createElement("span");
    checkboxWrapper.className = "task-item-checkbox";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.id = `checkbox-${task.id}`;
    checkbox.dataset.action = "toggle";
    checkboxWrapper.appendChild(checkbox);

    // Label (also the visible task text)
    const label = document.createElement("label");
    label.className = "task-item-text";
    label.setAttribute("for", `checkbox-${task.id}`);
    label.textContent = task.text;

    // Date
    const date = document.createElement("span");
    date.className = "task-item-date";
    date.textContent = formatTaskDate(task.createdAt);

    // Actions
    const actions = document.createElement("div");
    actions.className = "task-item-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "task-item-action-btn task-edit-btn";
    editBtn.dataset.action = "edit";
    editBtn.setAttribute("aria-label", `Edit task: ${task.text}`);
    editBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path></svg>';

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "task-item-action-btn task-delete-btn";
    deleteBtn.dataset.action = "delete";
    deleteBtn.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>';

    actions.append(editBtn, deleteBtn);
    item.append(checkboxWrapper, label, date, actions);
    return item;
  }

  function buildEditingTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.taskId = task.id;

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-item-edit-input";
    editInput.value = task.text;
    editInput.setAttribute("aria-label", `Editing task: ${task.text}`);
    editInput.dataset.action = "edit-input";

    item.appendChild(editInput);
    // Focus is set after the element lands in the DOM.
    queueMicrotask(() => editInput.focus());
    return item;
  }

  function formatTaskDate(timestamp) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  function renderStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    statTotal.textContent = String(total);
    statCompleted.textContent = String(completed);
    statRemaining.textContent = String(total - completed);
  }

  function persistAndRender() {
    saveTasks();
    renderTasks();
  }

  /* ------------------------------------------------------------------
     EVENT HANDLING
     ------------------------------------------------------------------ */

  // Create — form submit covers both button click and Enter key natively.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(input.value);
  });

  input.addEventListener("input", () => {
    if (inputError.textContent) clearInputError();
  });

  // Event delegation: one listener on the list handles toggle/edit/delete
  // for every task, current and future, instead of per-item listeners.
  list.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;
    const taskItem = event.target.closest(".task-item");
    const taskId = taskItem && taskItem.dataset.taskId;
    if (!taskId) return;

    const action = actionEl.dataset.action;
    if (action === "toggle") {
      toggleTaskCompleted(taskId);
    } else if (action === "edit") {
      editingTaskId = taskId;
      renderTasks();
    } else if (action === "delete") {
      deleteTask(taskId);
    }
  });

  // Checkbox "change" also needs delegation (click alone won't fire for
  // keyboard-toggled checkboxes reliably across all browsers).
  list.addEventListener("change", (event) => {
    if (event.target.matches('input[type="checkbox"][data-action="toggle"]')) {
      const taskItem = event.target.closest(".task-item");
      if (taskItem) toggleTaskCompleted(taskItem.dataset.taskId);
    }
  });

  // Edit-mode keyboard handling: Enter commits, Escape cancels.
  list.addEventListener("keydown", (event) => {
    if (!event.target.matches('[data-action="edit-input"]')) return;
    const taskItem = event.target.closest(".task-item");
    const taskId = taskItem && taskItem.dataset.taskId;
    if (!taskId) return;

    if (event.key === "Enter") {
      event.preventDefault();
      updateTaskText(taskId, event.target.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  });

  // Committing an edit on blur too, so clicking away doesn't discard it.
  list.addEventListener(
    "blur",
    (event) => {
      if (!event.target.matches('[data-action="edit-input"]')) return;
      const taskItem = event.target.closest(".task-item");
      const taskId = taskItem && taskItem.dataset.taskId;
      if (taskId && taskId === editingTaskId) {
        updateTaskText(taskId, event.target.value);
      }
    },
    true // capture phase, since "blur" doesn't bubble
  );

  // Filters
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      renderTasks();
    });
  });

  // Live search
  searchInput.addEventListener("input", (event) => {
    currentSearch = event.target.value.trim();
    renderTasks();
  });

  // Sort
  sortSelect.addEventListener("change", (event) => {
    currentSort = event.target.value;
    renderTasks();
  });

  // Bulk delete
  clearCompletedBtn.addEventListener("click", clearCompletedTasks);

  // Initial paint from whatever was loaded out of localStorage.
  renderTasks();
}