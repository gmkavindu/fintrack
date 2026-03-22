/**
 * COMMON JAVASCRIPT FILE (js/common.js)
 * 
 * Purpose: Central hub for all shared UI and data functions used across the app
 * 
 * Key Features:
 * - Data synchronization with backend API (categories, expenses, budgets)
 * - Session management and user authentication
 * - Notifications system (budget warnings, user feedback)
 * - Theme toggling (dark/light mode)
 * - Modal accessibility and focus management
 * - Page transitions and navigation
 * 
 * Usage: Load this file on every page: <script src="common.js"></script>
 * Then call: initializeData() on page load
 */

// ==================== STORAGE CONFIGURATION ====================

/**
 * STORAGE_KEYS
 * Constants that define keys for runtime storage
 * These are used to organize data in memory
 */
const STORAGE_KEYS = {
  expenses: 'expenses',         // User's expense records
  categories: 'categories',     // User's spending categories
  budgets: 'budgets',           // User's budget limits
  notifications: 'notifications', // Alert notifications (session-only, not stored in DB)
  theme: 'theme'                // User's theme preference (stored in cookie)
};

/**
 * runtimeStore
 * In-memory storage for app data
 * All app data is loaded here from the backend when page loads
 * Changes are synced back to the backend database
 */
const runtimeStore = {
  expenses: [],         // Array of expense objects
  categories: [],       // Array of category objects
  budgets: [],          // Array of budget objects
  notifications: []     // Array of notification objects (NOT stored in DB)
};

// ==================== INITIALIZATION & DATA LOADING ====================

/**
 * FUNCTION: initializeData()
 * 
 * Purpose: Load all user data from backend API on page load
 * 
 * Process:
 * 1. Clear all runtime storage
 * 2. Fetch data from api/app_data.php (GET request)
 * 3. Populate runtimeStore with fresh data
 * 4. If user session expired, will be redirected to login
 * 
 * Usage: Call once on DOMContentLoaded:
 *   document.addEventListener('DOMContentLoaded', () => {
 *     initializeData();
 *   });
 * 
 * @returns {Promise} - Resolves when data is loaded
 */
function initializeData() {
  // Clear all storage to start fresh
  runtimeStore.expenses = [];
  runtimeStore.categories = [];
  runtimeStore.budgets = [];
  runtimeStore.notifications = [];

  // Fetch data from backend API
  return fetch('api/app_data.php')
    .then(response => response.ok ? response.json() : null)
    .then(payload => {
      // Check if request was successful
      if (!payload || !payload.success) return;
      
      const data = payload.data || {};
      
      // Populate runtime storage with backend data
      runtimeStore.expenses = Array.isArray(data.expenses) ? data.expenses : [];
      runtimeStore.categories = Array.isArray(data.categories) ? data.categories : [];
      runtimeStore.budgets = Array.isArray(data.budgets) ? data.budgets : [];
      runtimeStore.notifications = [];  // Always start with empty notifications
    })
    .catch(() => {
      // If network error, continue with empty data
    });
}

/**
 * FUNCTION: getData()
 * Get a copy of data from runtime storage
 * 
 * Why a copy? To prevent accidental external modifications
 * 
 * @param {string} key - Storage key (e.g., 'expenses', 'categories')
 * @returns {array} - Copy of the data array
 */
function getData(key) {
  return Array.isArray(runtimeStore[key]) ? [...runtimeStore[key]] : [];
}

/**
 * FUNCTION: persistUserData()
 * Save user data to backend database
 * 
 * Process:
 * 1. POST data to api/app_data.php
 * 2. Verify response was successful
 * 3. If session expired (401 status), redirect to login
 * 4. Throw error if save failed
 * 
 * @param {string} key - Data type ('categories', 'expenses', 'budgets')
 * @param {array} value - Array of data to save
 * @returns {Promise} - Resolves if save successful, rejects on error
 */
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
      
      // If session expired, redirect to login
      if (response.status === 401) {
        window.location.href = 'auth/login.php';
        throw new Error('Session expired.');
      }
      
      // Check if save was successful
      if (!response.ok || !payload || !payload.success) {
        throw new Error(payload?.message || 'Failed to save data.');
      }
      
      return payload;
    })
    .catch(() => {
      throw new Error('Failed to save data.');
    });
}

// ==================== MODAL & ACCESSIBILITY ====================

/**
 * FUNCTION: hideModalSafely()
 * Safely close a Bootstrap modal with proper focus management
 * 
 * Accessibility: Ensures focus returns to the button that opened the modal
 * 
 * @param {string} modalId - ID of modal element to close
 * @returns {void}
 */
function hideModalSafely(modalId) {
  const modalElement = document.getElementById(modalId);
  if (!modalElement) return;

  // Move focus away from modal before closing
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement && modalElement.contains(activeElement)) {
    activeElement.blur();
    const trigger = modalElement.__returnFocusElement || document.querySelector(`[data-bs-target="#${modalId}"]`);
    if (trigger instanceof HTMLElement && !trigger.hasAttribute('disabled')) {
      trigger.focus();
    }
  }

  // Close the modal using Bootstrap API
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.hide();
}

/**
 * FUNCTION: bindModalAccessibilityGuards()
 * Setup accessibility listeners on all modals
 * 
 * Fixes: Prevents "aria-hidden on descendant with retained focus" warnings
 * 
 * How it works:
 * 1. Blurs focused elements before dismissing modal
 * 2. Returns focus to trigger button after modal closes
 * 3. Handles keyboard (Enter/Space) and mouse interactions
 * 
 * @returns {void}
 */
function bindModalAccessibilityGuards() {
  const modals = document.querySelectorAll('.modal');

  modals.forEach((modalElement) => {
    // Helper: Move focus out of modal to a safe location
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

    // Helper: Blur dismiss button before modal closes
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

    // Listen for click, touch, and keyboard interactions on dismiss buttons
    modalElement.addEventListener('pointerdown', prepareDismissFocus, true);
    modalElement.addEventListener('click', prepareDismissFocus, true);
    modalElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        prepareDismissFocus(event);
      }
    }, true);

    // Store the element that opened the modal
    modalElement.addEventListener('show.bs.modal', (event) => {
      const trigger = event.relatedTarget;
      if (trigger instanceof HTMLElement) {
        modalElement.__returnFocusElement = trigger;
      }
    });

    // Restore focus when modal closes
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

/**
 * FUNCTION: showConfirmation()
 * Show a confirmation dialog and wait for user response
 * 
 * Usage: 
 *   const confirmed = await showConfirmation('Delete this expense?');
 *   if (confirmed) { ... }
 * 
 * @param {string} message - Question to ask user
 * @returns {Promise<boolean>} - true if user clicked confirm, false if cancel/closed
 */
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

    // Show the confirmation message
    confirmText.textContent = message;

    const modal = bootstrap.Modal.getInstance(confirmModal) || new bootstrap.Modal(confirmModal);
    let resolved = false;

    // Cleanup event listeners
    const cleanup = () => {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      confirmModal.removeEventListener('hidden.bs.modal', onHidden);
    };

    // Resolve promise and cleanup
    const finish = (result) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    };

    // User clicked confirm button
    const onConfirm = () => {
      hideModalSafely('confirmationModal');
      finish(true);
    };

    // User clicked cancel button
    const onCancel = () => {
      hideModalSafely('confirmationModal');
      finish(false);
    };

    // User closed modal without choosing
    const onHidden = () => {
      finish(false);
    };

    // Bind event handlers
    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    confirmModal.addEventListener('hidden.bs.modal', onHidden);

    // Show the modal
    modal.show();
  });
}

/**
 * FUNCTION: showSaveError()
 * Show error alert when database save fails
 * @returns {void}
 */
function showSaveError() {
  alert('Unable to save changes to the database. Please login again and retry.');
}

// ==================== DATA MANAGEMENT ====================

/**
 * FUNCTION: setData()
 * Update data in runtime storage and sync to backend if applicable
 * 
 * Logic:
 * - Stores data in memory immediately
 * - Persists to database (if not theme/notifications)
 * - Notifications stay session-only (not stored in DB)
 * 
 * @param {string} key - Data type to update
 * @param {array} value - New data array
 * @returns {Promise} - Resolves when persist is complete
 */
function setData(key, value) {
  runtimeStore[key] = Array.isArray(value) ? [...value] : [];
  
  // Only persist tables to backend (not theme or notifications)
  if (key !== STORAGE_KEYS.theme && key !== STORAGE_KEYS.notifications) {
    return persistUserData(key, runtimeStore[key]);
  }
  return Promise.resolve();
}

/**
 * FUNCTION: syncRuntimeData()
 * Update runtime storage without syncing to backend
 * Used for temporary UI state changes
 * 
 * @param {string} key - Data key to update
 * @param {array} value - New value
 * @returns {void}
 */
function syncRuntimeData(key, value) {
  runtimeStore[key] = Array.isArray(value) ? [...value] : [];
}

/**
 * FUNCTION: rollbackRuntimeData()
 * Revert data to a previous state (used on save failure)
 * 
 * @param {string} key - Data key to rollback
 * @param {array} previousValue - Previous data to restore
 * @returns {void}
 */
function rollbackRuntimeData(key, previousValue) {
  runtimeStore[key] = Array.isArray(previousValue) ? [...previousValue] : [];
}

/**
 * FUNCTION: clearNotificationsData()
 * Clear all notifications (doesn't touch database, only session memory)
 * 
 * @returns {Promise<void>}
 */
function clearNotificationsData() {
  syncRuntimeData(STORAGE_KEYS.notifications, []);
  return Promise.resolve();
}

/**
 * FUNCTION: getNextId()
 * Generate next ID for new item (finds max ID + 1)
 * 
 * @param {array} items - Array of objects with 'id' property
 * @returns {number} - Next available ID
 */
function getNextId(items) {
  return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

// ==================== GLOBAL EVENT SETUP ====================

/**
 * FUNCTION: bindGlobalEvents()
 * Setup global event listeners (theme toggle, notifications, modals)
 * Call this once on page load
 * 
 * @returns {void}
 */
function bindGlobalEvents() {
  // Setup modal accessibility
  bindModalAccessibilityGuards();

  // Theme toggle button (moon/sun icon)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Clear all notifications button
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

// ==================== PAGE TRANSITIONS ====================

/**
 * FUNCTION: ensurePageTransitionOverlay()
 * Create page transition overlay if it doesn't exist
 * This invisible div fades in/out during page navigation
 * 
 * @returns {void}
 */
function ensurePageTransitionOverlay() {
  if (document.getElementById('pageTransitionOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'pageTransitionOverlay';
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);
}

/**
 * FUNCTION: triggerPageLeaveTransition()
 * Activate page transition animation before navigation
 * 
 * @returns {void}
 */
function triggerPageLeaveTransition() {
  ensurePageTransitionOverlay();
  document.body.classList.add('page-leaving');
}

/**
 * FUNCTION: bindPageTransitions()
 * Setup smooth page transitions on navigation
 * 
 * How it works:
 * 1. Listens for clicks on all navigation links
 * 2. Shows transition animation (240ms)
 * 3. Then navigates to new page
 * 
 * @returns {void}
 */
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
      
      // Wait for animation before navigating
      window.setTimeout(() => {
        window.location.href = destination.href;
      }, 240);
    });
  });
}

// ==================== THEME MANAGEMENT ====================

/**
 * FUNCTION: toggleTheme()
 * Switch between dark and light mode
 * Saves preference in cookie so it persists
 * 
 * @returns {void}
 */
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.cookie = `fintrack_theme=${isDark ? 'dark' : 'light'};path=/;max-age=31536000`;
}

/**
 * FUNCTION: applySavedTheme()
 * Read theme cookie and apply saved theme on page load
 * 
 * @returns {void}
 */
function applySavedTheme() {
  const themeCookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('fintrack_theme='));
  const theme = themeCookie ? themeCookie.split('=')[1] : null;
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

// ==================== CURRENCY & FORMATTING ====================

/**
 * FUNCTION: formatCurrency()
 * Format a number as LKR currency
 * 
 * Example:
 *   formatCurrency(1234.50) returns "LKR 1,234.50"
 * 
 * @param {number|string} value - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
  return `LKR ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ==================== DATA GETTERS (CONVENIENCE FUNCTIONS) ====================

/**
 * FUNCTION: getExpenses()
 * Get all expenses from runtime storage
 * 
 * @returns {array} - Copy of expenses array
 */
function getExpenses() {
  return getData(STORAGE_KEYS.expenses);
}

/**
 * FUNCTION: getCategories()
 * Get all categories from runtime storage
 * 
 * @returns {array} - Copy of categories array
 */
function getCategories() {
  return getData(STORAGE_KEYS.categories);
}

/**
 * FUNCTION: getBudgets()
 * Get all budgets from runtime storage
 * 
 * @returns {array} - Copy of budgets array
 */
function getBudgets() {
  return getData(STORAGE_KEYS.budgets);
}

/**
 * FUNCTION: getNotifications()
 * Get all notifications from runtime storage (session-only, not in DB)
 * 
 * @returns {array} - Copy of notifications array
 */
function getNotifications() {
  return getData(STORAGE_KEYS.notifications);
}

// ==================== NOTIFICATIONS SYSTEM ====================

/**
 * FUNCTION: addNotification()
 * Add a new notification message (session-only, not stored in DB)
 * 
 * Features:
 * - Shows up in notification dropdown
 * - Updates badge counter
 * - Keeps max 20 most recent notifications
 * - Never persisted to database
 * 
 * Example:
 *   addNotification('⚠️ Budget exceeded for Food!');
 * 
 * @param {string} text - Notification message
 * @returns {void}
 */
function addNotification(text) {
  const notifications = getNotifications();

  // Add to front of array (newest first)
  notifications.unshift({
    id: getNextId(notifications),
    text,
    time: new Date().toLocaleString()
  });

  // Keep only 20 most recent notifications
  setData(STORAGE_KEYS.notifications, notifications.slice(0, 20));
  renderNotifications();
}

/**
 * FUNCTION: renderNotifications()
 * Update notification UI in dropdown
 * 
 * Updates:
 * - Notification list (shows all notifications)
 * - Badge counter (shows count)
 * 
 * @returns {void}
 */
function renderNotifications() {
  const notificationList = document.getElementById('notificationList');
  const badge = document.getElementById('notificationBadge');
  if (!notificationList || !badge) return;

  const notifications = getNotifications();

  // Update badge count
  badge.textContent = notifications.length;
  badge.style.display = notifications.length ? 'inline-block' : 'none';

  // Show message if no notifications
  if (!notifications.length) {
    notificationList.innerHTML = '<div class="empty-state">No notifications available.</div>';
    return;
  }

  // Render list of notifications
  notificationList.innerHTML = notifications.map(item => `
    <div class="notification-item">
      <div class="fw-semibold mb-1">${item.text}</div>
      <small class="text-secondary">${item.time}</small>
    </div>
  `).join('');
}

/**
 * FUNCTION: checkAndNotifyBudgetExceeded()
 * Check all budgets and notify if any exceeded
 * 
 * Logic:
 * 1. Calculate total spent per category
 * 2. Compare against budget limits
 * 3. Show warning notification only once per budget
 * 4. Use Set to avoid duplicate notifications
 * 
 * @returns {void}
 */
// Track which budgets have been notified in this session to avoid duplicates
const notifiedBudgets = new Set();

function checkAndNotifyBudgetExceeded() {
  const budgets = getBudgets();
  const expenses = getExpenses();

  // Exit if missing data
  if (!Array.isArray(budgets) || !Array.isArray(expenses) || !budgets.length || !expenses.length) {
    return;
  }

  // Calculate total spent per category
  const spentByCategory = expenses.reduce((totals, item) => {
    if (!item || !item.category) return totals;
    totals[item.category] = (totals[item.category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});

  // Check each budget
  budgets.forEach((budget) => {
    if (!budget || !budget.category || budget.limit === undefined) return;

    const spent = spentByCategory[budget.category] || 0;
    const limit = Number(budget.limit || 0);
    
    // Skip if under budget
    if (spent <= limit) return;

    // Skip if already notified about this budget
    const budgetKey = `budget_exceeded_${budget.id}`;
    if (notifiedBudgets.has(budgetKey)) return;

    // Show notification and mark as notified
    addNotification(`⚠️ Budget exceeded for ${budget.category}! Spent ${formatCurrency(spent)} of ${formatCurrency(limit)}.`);
    notifiedBudgets.add(budgetKey);
  });
}

// ==================== ANALYSIS & CALCULATIONS ====================

/**
 * FUNCTION: getCategoryTotals()
 * Calculate total spent per category
 * 
 * Example:
 *   { Food: 2500, Transport: 800, Entertainment: 1200 }
 * 
 * @returns {object} - Object with category names as keys, totals as values
 */
function getCategoryTotals() {
  const expenses = getExpenses();
  const totals = {};

  expenses.forEach(expense => {
    totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount);
  });

  return totals;
}

/**
 * FUNCTION: getMonthlyTotals()
 * Calculate total spent per month
 * 
 * Example:
 *   { Jan: 5000, Feb: 4200, Mar: 6100 }
 * 
 * @returns {object} - Object with month names as keys, totals as values
 */
function getMonthlyTotals() {
  const expenses = getExpenses();
  const totals = {};

  expenses.forEach(expense => {
    const month = new Date(expense.date).toLocaleString('en-US', { month: 'short' });
    totals[month] = (totals[month] || 0) + Number(expense.amount);
  });

  return totals;
}

/**
 * FUNCTION: getSummaryData()
 * Get overview statistics for dashboard
 * 
 * Returns:
 * - total: Sum of all expenses
 * - count: Number of expenses
 * - average: Average expense amount
 * 
 * @returns {object} - { total, count, average }
 */
function getSummaryData() {
  const expenses = getExpenses();
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const count = expenses.length;
  const average = count ? total / count : 0;

  return { total, count, average };
}

// ==================== FORM HELPERS ====================

/**
 * FUNCTION: populateCategoryOptions()
 * Fill category dropdown select elements with available categories
 * 
 * Updates:
 * - expenseCategory dropdown (in add expense form)
 * - expenseCategoryFilter dropdown (in expense list filter)
 * - budgetCategory dropdown (in add budget form)
 * 
 * Call this whenever categories change:
 *   updateCategories -> populateCategoryOptions()
 * 
 * @returns {void}
 */
function populateCategoryOptions() {
  const categories = getCategories();
  const expenseCategory = document.getElementById('expenseCategory');
  const expenseCategoryFilter = document.getElementById('expenseCategoryFilter');
  const budgetCategory = document.getElementById('budgetCategory');

  // Update expense category dropdown
  if (expenseCategory) {
    expenseCategory.innerHTML = '<option value="">Select Category</option>' +
      categories.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
  }

  // Update filter dropdown (includes "All Categories" option)
  if (expenseCategoryFilter) {
    expenseCategoryFilter.innerHTML = '<option value="all">All Categories</option>' +
      categories.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
  }

  // Update budget category dropdown
  if (budgetCategory) {
    budgetCategory.innerHTML = '<option value="">Select Category</option>' +
      categories.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
  }
}
