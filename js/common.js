// Common functions for UI and helpers

// Set up global event listeners (theme toggle, notifications)
function bindGlobalEvents() {
  // Theme toggle button
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Clear notifications button
  const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener('click', () => {
      setData(STORAGE_KEYS.notifications, []);
      renderNotifications();
    });
  }
}

// Switch between dark and light mode
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
}

// Apply saved theme on page load
function applySavedTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

// Format a number as currency (LKR)
function formatCurrency(value) {
  return `LKR ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Get all expenses from storage
function getExpenses() {
  return getData(STORAGE_KEYS.expenses);
}

// Get all categories from storage
function getCategories() {
  return getData(STORAGE_KEYS.categories);
}

function getBudgets() {
  return getData(STORAGE_KEYS.budgets);
}

function getNotifications() {
  return getData(STORAGE_KEYS.notifications);
}

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
