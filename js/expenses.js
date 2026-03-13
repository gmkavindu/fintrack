// Expenses page - handles expense features

// Show the expenses page and set up event listeners
function renderExpensesPage() {
  populateCategoryOptions(); // Fill category dropdown
  renderExpenseTable(); // Show all expenses

  // When user types in search, update table
  document.getElementById('expenseSearch').addEventListener('input', renderExpenseTable);
  // When user changes category filter, update table
  document.getElementById('expenseCategoryFilter').addEventListener('change', renderExpenseTable);
  // When user changes sort option, update table
  document.getElementById('expenseSort').addEventListener('change', renderExpenseTable);
  // When user clicks to add new expense, reset form
  document.getElementById('openExpenseModalBtn').addEventListener('click', resetExpenseForm);
  // When user submits expense form, save expense
  document.getElementById('expenseForm').addEventListener('submit', saveExpense);
}

// Get expenses filtered by search, category, and sort
function getFilteredExpenses() {
  const search = document.getElementById('expenseSearch')?.value.toLowerCase() || '';
  const category = document.getElementById('expenseCategoryFilter')?.value || 'all';
  const sort = document.getElementById('expenseSort')?.value || 'newest';

  let expenses = [...getExpenses()].filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search) || item.note.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  // Sort expenses
  if (sort === 'newest') expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sort === 'oldest') expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sort === 'amountHigh') expenses.sort((a, b) => b.amount - a.amount);
  if (sort === 'amountLow') expenses.sort((a, b) => a.amount - b.amount);

  return expenses;
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

function saveExpense(event) {
  event.preventDefault();

  const id = Number(document.getElementById('expenseId').value);
  const title = document.getElementById('expenseTitle').value.trim();
  const amount = Number(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const date = document.getElementById('expenseDate').value;
  const note = document.getElementById('expenseNote').value.trim();

  if (!title || !amount || amount <= 0 || !category || !date) {
    alert('Please enter valid expense details.');
    return;
  }

  const expenses = getExpenses();
  const expenseData = { id: id || getNextId(expenses), title, amount, category, date, note };

  const updatedExpenses = id
    ? expenses.map(item => item.id === id ? expenseData : item)
    : [...expenses, expenseData];

  setData(STORAGE_KEYS.expenses, updatedExpenses);
  addNotification(id ? 'Expense updated successfully.' : 'New expense added successfully.');
  bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
  resetExpenseForm();
  renderExpenseTable();
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

  const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
  modal.show();
}

function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;

  const updatedExpenses = getExpenses().filter(item => item.id !== id);
  setData(STORAGE_KEYS.expenses, updatedExpenses);
  addNotification('Expense deleted successfully.');
  renderExpenseTable();
}
