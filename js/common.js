// Shared client utilities used across pages.

// Storage keys

const STORAGE_KEYS = {
  expenses: 'expenses',
  categories: 'categories',
  budgets: 'budgets',
  notifications: 'notifications',
  theme: 'theme'
};

const runtimeStore = {
  expenses: [],
  categories: [],
  budgets: [],
  notifications: []
};

// Data loading
function initializeData() {
  runtimeStore.expenses = [];
  runtimeStore.categories = [];
  runtimeStore.budgets = [];
  runtimeStore.notifications = [];

  return fetch('api/app_data.php')
    .then(response => response.ok ? response.json() : null)
    .then(payload => {
      if (!payload || !payload.success) return;
      
      const data = payload.data || {};
      
      runtimeStore.expenses = Array.isArray(data.expenses) ? data.expenses : [];
      runtimeStore.categories = Array.isArray(data.categories) ? data.categories : [];
      runtimeStore.budgets = Array.isArray(data.budgets) ? data.budgets : [];
      runtimeStore.notifications = [];
    })
    .catch(() => {});
}

function getData(key) {
  return Array.isArray(runtimeStore[key]) ? [...runtimeStore[key]] : [];
}

function persistUserData(key, value) {
  return fetch('api/app_data.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key, value })
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      
      if (response.status === 401) {
        window.location.href = 'auth/login.php';
        throw new Error('Session expired.');
      }
      
      if (!response.ok || !payload || !payload.success) {
        throw new Error(payload?.message || 'Failed to save data.');
      }
      
      return payload;
    })
    .catch(() => {
      throw new Error('Failed to save data.');
    });
}

// Modal + accessibility helpers
function hideModalSafely(modalId) {
  const modalElement = document.getElementById(modalId);
  if (!modalElement) return;

  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement && modalElement.contains(activeElement)) {
    activeElement.blur();
    const trigger = modalElement.__returnFocusElement || document.querySelector(`[data-bs-target="#${modalId}"]`);
    if (trigger instanceof HTMLElement && !trigger.hasAttribute('disabled')) {
      trigger.focus();
    }
  }

  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.hide();
}

function bindModalAccessibilityGuards() {
  const modals = document.querySelectorAll('.modal');

  modals.forEach((modalElement) => {
    const moveFocusOutOfModal = () => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && modalElement.contains(activeElement)) {
        activeElement.blur();
      }

      const fallbackTrigger = modalElement.id
        ? document.querySelector(`[data-bs-target="#${modalElement.id}"]`)
        : null;
      const returnTarget = modalElement.__returnFocusElement || fallbackTrigger;

      if (returnTarget instanceof HTMLElement && !returnTarget.hasAttribute('disabled')) {
        returnTarget.focus();
      }
    };

    const prepareDismissFocus = (event) => {
      const dismissButton = event.target instanceof Element
        ? event.target.closest('[data-bs-dismiss="modal"]')
        : null;

      if (!(dismissButton instanceof HTMLElement) || !modalElement.contains(dismissButton)) {
        return;
      }

      dismissButton.blur();
      moveFocusOutOfModal();
    };

    modalElement.addEventListener('pointerdown', prepareDismissFocus, true);
    modalElement.addEventListener('click', prepareDismissFocus, true);
    modalElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        prepareDismissFocus(event);
      }
    }, true);

    modalElement.addEventListener('show.bs.modal', (event) => {
      const trigger = event.relatedTarget;
      if (trigger instanceof HTMLElement) {
        modalElement.__returnFocusElement = trigger;
      }
    });

    modalElement.addEventListener('hide.bs.modal', () => {
      moveFocusOutOfModal();

      const returnTarget = modalElement.__returnFocusElement
        || (modalElement.id ? document.querySelector(`[data-bs-target="#${modalElement.id}"]`) : null);
      if (returnTarget instanceof HTMLElement && !returnTarget.hasAttribute('disabled')) return;

      const safeTarget = document.querySelector('.navbar-brand, main h1');
      if (safeTarget instanceof HTMLElement) {
        safeTarget.setAttribute('tabindex', '-1');
        safeTarget.focus();
      }
    });
  });
}

function showConfirmation(message) {
  return new Promise((resolve) => {
    const confirmText = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmModal = document.getElementById('confirmationModal');

    if (!confirmText || !confirmBtn || !cancelBtn || !confirmModal) {
      resolve(false);
      return;
    }

    confirmText.textContent = message;

    const modal = bootstrap.Modal.getInstance(confirmModal) || new bootstrap.Modal(confirmModal);
    let resolved = false;

    const cleanup = () => {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      confirmModal.removeEventListener('hidden.bs.modal', onHidden);
    };

    const finish = (result) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    };

    const onConfirm = () => {
      hideModalSafely('confirmationModal');
      finish(true);
    };

    const onCancel = () => {
      hideModalSafely('confirmationModal');
      finish(false);
    };

    const onHidden = () => {
      finish(false);
    };

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    confirmModal.addEventListener('hidden.bs.modal', onHidden);

    modal.show();
  });
}

function showSaveError() {
  alert('Unable to save changes to the database. Please login again and retry.');
}

// Data updates
function setData(key, value) {
  runtimeStore[key] = Array.isArray(value) ? [...value] : [];
  
  // Notifications/theme stay local.
  if (key !== STORAGE_KEYS.theme && key !== STORAGE_KEYS.notifications) {
    return persistUserData(key, runtimeStore[key]);
  }
  return Promise.resolve();
}

function syncRuntimeData(key, value) {
  runtimeStore[key] = Array.isArray(value) ? [...value] : [];
}

function rollbackRuntimeData(key, previousValue) {
  runtimeStore[key] = Array.isArray(previousValue) ? [...previousValue] : [];
}

function clearNotificationsData() {
  syncRuntimeData(STORAGE_KEYS.notifications, []);
  return Promise.resolve();
}

function getNextId(items) {
  return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

// Global events
function bindGlobalEvents() {
  bindModalAccessibilityGuards();

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener('click', async () => {
      try {
        await clearNotificationsData();
        renderNotifications();
      } catch (error) {
        showSaveError();
      }
    });
  }
}

// Page transitions
function ensurePageTransitionOverlay() {
  if (document.getElementById('pageTransitionOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'pageTransitionOverlay';
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);
}

function triggerPageLeaveTransition() {
  ensurePageTransitionOverlay();
  document.body.classList.add('page-leaving');
}

function bindPageTransitions() {
  ensurePageTransitionOverlay();

  const navLinks = Array.from(document.querySelectorAll('a[href]'));
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;
      if (link.target && link.target !== '_self') return;

      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.href === window.location.href) return;

      event.preventDefault();
      triggerPageLeaveTransition();

      window.setTimeout(() => {
        window.location.href = destination.href;
      }, 240);
    });
  });
}

// Theme
function updateThemeToggleIcon() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (!themeToggleBtn) return;

  const isDark = document.body.classList.contains('dark-mode');
  const icon = themeToggleBtn.querySelector('i');

  if (icon) {
    icon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    return;
  }

  themeToggleBtn.innerHTML = `<i class="${isDark ? 'bi bi-sun' : 'bi bi-moon-stars'}"></i>`;
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.cookie = `fintrack_theme=${isDark ? 'dark' : 'light'};path=/;max-age=31536000`;
  updateThemeToggleIcon();
}

function applySavedTheme() {
  const themeCookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('fintrack_theme='));
  const theme = themeCookie ? themeCookie.split('=')[1] : null;
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  updateThemeToggleIcon();
}

// Formatting
function formatCurrency(value) {
  return `LKR ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Getters
function getExpenses() {
  return getData(STORAGE_KEYS.expenses);
}

function getCategories() {
  return getData(STORAGE_KEYS.categories);
}

function getBudgets() {
  return getData(STORAGE_KEYS.budgets);
}

function getNotifications() {
  return getData(STORAGE_KEYS.notifications);
}

// Notifications
function addNotification(text) {
  const notifications = getNotifications();

  notifications.unshift({
    id: getNextId(notifications),
    text,
    time: new Date().toLocaleString()
  });

  setData(STORAGE_KEYS.notifications, notifications.slice(0, 20));
  renderNotifications();
}

function renderNotifications() {
  const notificationList = document.getElementById('notificationList');
  const badge = document.getElementById('notificationBadge');
  if (!notificationList || !badge) return;

  const notifications = getNotifications();

  badge.textContent = notifications.length;
  badge.style.display = notifications.length ? 'inline-block' : 'none';

  if (!notifications.length) {
    notificationList.innerHTML = '<div class="empty-state">No notifications available.</div>';
    return;
  }

  notificationList.innerHTML = notifications.map(item => `
    <div class="notification-item">
      <div class="fw-semibold mb-1">${item.text}</div>
      <small class="text-secondary">${item.time}</small>
    </div>
  `).join('');
}

// Track notified budgets for this session to avoid duplicates.
const notifiedBudgets = new Set();

function checkAndNotifyBudgetExceeded() {
  const budgets = getBudgets();
  const expenses = getExpenses();

  if (!Array.isArray(budgets) || !Array.isArray(expenses) || !budgets.length || !expenses.length) {
    return;
  }

  const spentByCategory = expenses.reduce((totals, item) => {
    if (!item || !item.category) return totals;
    totals[item.category] = (totals[item.category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});

  budgets.forEach((budget) => {
    if (!budget || !budget.category || budget.limit === undefined) return;

    const spent = spentByCategory[budget.category] || 0;
    const limit = Number(budget.limit || 0);

    if (spent <= limit) return;

    const budgetKey = `budget_exceeded_${budget.id}`;
    if (notifiedBudgets.has(budgetKey)) return;

    addNotification(`⚠️ Budget exceeded for ${budget.category}! Spent ${formatCurrency(spent)} of ${formatCurrency(limit)}.`);
    notifiedBudgets.add(budgetKey);
  });
}

// Calculations
function getCategoryTotals() {
  const expenses = getExpenses();
  const totals = {};

  expenses.forEach(expense => {
    totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount);
  });

  return totals;
}

function getMonthlyTotals() {
  const expenses = getExpenses();
  const totals = {};

  expenses.forEach(expense => {
    const month = new Date(expense.date).toLocaleString('en-US', { month: 'short' });
    totals[month] = (totals[month] || 0) + Number(expense.amount);
  });

  return totals;
}

function getSummaryData() {
  const expenses = getExpenses();
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const count = expenses.length;
  const average = count ? total / count : 0;

  return { total, count, average };
}

// Form helpers
function populateCategoryOptions() {
  const categories = getCategories();
  const expenseCategory = document.getElementById('expenseCategory');
  const expenseCategoryFilter = document.getElementById('expenseCategoryFilter');
  const budgetCategory = document.getElementById('budgetCategory');

  if (expenseCategory) {
    expenseCategory.innerHTML = '<option value="">Select Category</option>' +
      categories.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
  }

  if (expenseCategoryFilter) {
    expenseCategoryFilter.innerHTML = '<option value="all">All Categories</option>' +
      categories.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
  }

  if (budgetCategory) {
    budgetCategory.innerHTML = '<option value="">Select Category</option>' +
      categories.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
  }
}
