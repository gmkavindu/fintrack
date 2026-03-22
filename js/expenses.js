// Expenses page - handles expense features

const EXPENSE_SORTERS = {
  newest: (a, b) => new Date(b.date) - new Date(a.date),
  oldest: (a, b) => new Date(a.date) - new Date(b.date),
  amountHigh: (a, b) => b.amount - a.amount,
  amountLow: (a, b) => a.amount - b.amount
};

// Show the expenses page and set up event listeners
function renderExpensesPage() {
  populateCategoryOptions();
  renderExpenseTable();

  document.getElementById('expenseSearch')?.addEventListener('input', renderExpenseTable);
  document.getElementById('expenseCategoryFilter')?.addEventListener('change', renderExpenseTable);
  document.getElementById('expenseSort')?.addEventListener('change', renderExpenseTable);
  document.getElementById('openExpenseModalBtn')?.addEventListener('click', resetExpenseForm);
  document.getElementById('expenseForm')?.addEventListener('submit', saveExpense);
  document.getElementById('expenseCloseTopBtn')?.addEventListener('click', () => hideModalSafely('expenseModal'));
  document.getElementById('expenseCloseFooterBtn')?.addEventListener('click', () => hideModalSafely('expenseModal'));
}

function getExpenseFormData() {
  return {
    id: Number(document.getElementById('expenseId').value),
    title: document.getElementById('expenseTitle').value.trim(),
    amount: Number(document.getElementById('expenseAmount').value),
    category: document.getElementById('expenseCategory').value,
    date: document.getElementById('expenseDate').value,
    note: document.getElementById('expenseNote').value.trim()
  };
}

function isValidExpenseData(expense) {
  return Boolean(expense.title && expense.amount > 0 && expense.category && expense.date);
}

// Get expenses filtered by search, category, and sort
function getFilteredExpenses() {
  const search = document.getElementById('expenseSearch')?.value.toLowerCase() || '';
  const category = document.getElementById('expenseCategoryFilter')?.value || 'all';
  const sort = document.getElementById('expenseSort')?.value || 'newest';

  const expenses = getExpenses().filter(item => {
    const note = (item.note || '').toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(search) || note.includes(search);
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return expenses.sort(EXPENSE_SORTERS[sort] || EXPENSE_SORTERS.newest);
}

// Show all expenses in a table
function renderExpenseTable() {
  const body = document.getElementById('expenseTableBody');
  if (!body) return;

  const expenses = getFilteredExpenses();

  // If no expenses, show empty state
  if (!expenses.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state">No expenses found.</td></tr>';
    return;
  }

  body.innerHTML = expenses.map(item => `
    <tr>
      <td>${item.title}</td>
      <td>${item.category}</td>
      <td>${formatCurrency(item.amount)}</td>
      <td>${item.date}</td>
      <td>${item.note || '-'}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-2" onclick="editExpense(${item.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${item.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function resetExpenseForm() {
  document.getElementById('expenseForm').reset();
  document.getElementById('expenseId').value = '';
  document.getElementById('expenseModalTitle').textContent = 'Add Expense';
}

async function saveExpense(event) {
  event.preventDefault();

  const expenseData = getExpenseFormData();

  if (!isValidExpenseData(expenseData)) {
    alert('Please enter valid expense details.');
    return;
  }

  const expenses = getExpenses();
  const nextExpense = { ...expenseData, id: expenseData.id || getNextId(expenses) };

  const updatedExpenses = expenseData.id
    ? expenses.map(item => item.id === expenseData.id ? nextExpense : item)
    : [...expenses, nextExpense];

  const previousExpenses = getExpenses();
  const previousNotifications = getNotifications();
  syncRuntimeData(STORAGE_KEYS.expenses, updatedExpenses);

  try {
    await setData(STORAGE_KEYS.expenses, updatedExpenses);
    addNotification(expenseData.id ? 'Expense updated successfully.' : 'New expense added successfully.');

    await initializeData();
    checkAndNotifyBudgetExceeded();

    hideModalSafely('expenseModal');
    resetExpenseForm();
    renderExpenseTable();
  } catch {
    rollbackRuntimeData(STORAGE_KEYS.expenses, previousExpenses);
    rollbackRuntimeData(STORAGE_KEYS.notifications, previousNotifications);
    showSaveError();
  }
}

function editExpense(id) {
  const expense = getExpenses().find(item => item.id === id);
  if (!expense) return;

  document.getElementById('expenseId').value = expense.id;
  document.getElementById('expenseTitle').value = expense.title;
  document.getElementById('expenseAmount').value = expense.amount;
  document.getElementById('expenseCategory').value = expense.category;
  document.getElementById('expenseDate').value = expense.date;
  document.getElementById('expenseNote').value = expense.note;
  document.getElementById('expenseModalTitle').textContent = 'Edit Expense';

  const modalElement = document.getElementById('expenseModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

async function deleteExpense(id) {
  const confirmed = await showConfirmation('Are you sure you want to delete this expense?');
  if (!confirmed) return;

  const previousExpenses = getExpenses();
  const previousNotifications = getNotifications();
  const updatedExpenses = getExpenses().filter(item => item.id !== id);
  syncRuntimeData(STORAGE_KEYS.expenses, updatedExpenses);

  try {
    await setData(STORAGE_KEYS.expenses, updatedExpenses);
    addNotification('Expense deleted successfully.');
    checkAndNotifyBudgetExceeded();
    renderExpenseTable();
  } catch {
    rollbackRuntimeData(STORAGE_KEYS.expenses, previousExpenses);
    rollbackRuntimeData(STORAGE_KEYS.notifications, previousNotifications);
    showSaveError();
  }
}
