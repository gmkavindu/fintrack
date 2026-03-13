// Data definitions and storage keys

// Keys used to store data in localStorage
const STORAGE_KEYS = {
  expenses: 'fintrack_expenses',
  categories: 'fintrack_categories',
  budgets: 'fintrack_budgets',
  notifications: 'fintrack_notifications',
  theme: 'fintrack_theme'
};

// Default categories for new users
const defaultCategories = [
  { id: 1, name: 'Food', description: 'Meals, groceries, and snacks' },
  { id: 2, name: 'Transport', description: 'Bus, train, fuel, and travel costs' },
  { id: 3, name: 'Bills', description: 'Utility and service payments' },
  { id: 4, name: 'Shopping', description: 'Personal and household purchases' }
];

// Default expenses for demo
const defaultExpenses = [
  { id: 1, title: 'Grocery Shopping', amount: 4500, category: 'Food', date: '2026-02-18', note: 'Weekly groceries' },
  { id: 2, title: 'Bus Pass', amount: 1200, category: 'Transport', date: '2026-02-19', note: 'Campus travel' },
  { id: 3, title: 'Electricity Bill', amount: 3800, category: 'Bills', date: '2026-02-20', note: 'Monthly bill' },
  { id: 4, title: 'Stationery', amount: 950, category: 'Shopping', date: '2026-02-21', note: 'Notebook and pens' },
  { id: 5, title: 'Lunch', amount: 850, category: 'Food', date: '2026-02-22', note: 'Cafe meal' }
];

// Default budgets for demo
const defaultBudgets = [
  { id: 1, category: 'Food', limit: 12000, period: 'Monthly' },
  { id: 2, category: 'Transport', limit: 5000, period: 'Monthly' },
  { id: 3, category: 'Bills', limit: 8000, period: 'Monthly' }
];

// Default notifications for demo
const defaultNotifications = [
  { id: 1, text: 'Welcome to FinTrack.', time: 'Now' },
  { id: 2, text: 'Food budget is being tracked.', time: 'Now' }
];

// Set up initial data in localStorage if not already present
function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.categories)) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(defaultCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.expenses)) {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(defaultExpenses));
  }
  if (!localStorage.getItem(STORAGE_KEYS.budgets)) {
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(defaultBudgets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.notifications)) {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(defaultNotifications));
  }
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getNextId(items) {
  return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
}
