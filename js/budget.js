// Budget page - handles budget features

// Show the budget page and set up event listeners
function renderBudgetPage() {
  // Fill category dropdown
  populateCategoryOptions();
  // Show budget cards
  renderBudgetCards();

  // When user types in search, update cards
  document.getElementById('budgetSearch').addEventListener('input', renderBudgetCards);
  // When user clicks to add new budget, reset form
  document.getElementById('openBudgetModalBtn').addEventListener('click', resetBudgetForm);
  // When user submits budget form, save budget
  document.getElementById('budgetForm').addEventListener('submit', saveBudget);
}

// Calculate how much is spent for a category
function getBudgetSpent(categoryName) {
  return getExpenses()
    .filter(item => item.category === categoryName)
    .reduce((sum, item) => sum + Number(item.amount), 0);
}

// Show all budget cards
function renderBudgetCards() {
  const container = document.getElementById('budgetCardContainer');
  if (!container) return;

  // Get search text
  const search = document.getElementById('budgetSearch')?.value.toLowerCase() || '';
  // Filter budgets by search
  const budgets = getBudgets().filter(item => item.category.toLowerCase().includes(search));

  // If no budgets, show empty state
  if (!budgets.length) {
    container.innerHTML = '<div class="col-12"><div class="card app-card"><div class="empty-state">No budgets found.</div></div></div>';
    return;
  }

  // Show each budget card
  container.innerHTML = budgets.map(item => {
    const spent = getBudgetSpent(item.category);
    const remaining = item.limit - spent;
    const percentage = Math.min((spent / item.limit) * 100, 100);
    let status = 'On Track';
    let progressClass = 'bg-success';

    // If spent more than limit, show warning
    if (spent >= item.limit) {
      status = 'Exceeded';
      progressClass = 'bg-danger';
    } else if (percentage >= 80) {
      status = 'Warning';
      progressClass = 'bg-warning';
    }

    return `
      <div class="col-lg-6">
        <div class="card app-card h-100">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">${item.category}</h5>
                <small class="text-secondary">${item.period} Budget</small>
              </div>
              <div>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editBudget(${item.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBudget(${item.id})"><i class="bi bi-trash"></i></button>
              </div>
            </div>
            <div class="mb-2">Budget: <strong>${formatCurrency(item.limit)}</strong></div>
            <div class="mb-2">Spent: <strong>${formatCurrency(spent)}</strong></div>
            <div class="mb-3">Remaining: <strong>${formatCurrency(remaining)}</strong></div>
            <div class="progress mb-3"><div class="progress-bar ${progressClass}" style="width:${percentage}%"></div></div>
            <span class="badge ${status === 'Exceeded' ? 'text-bg-danger' : status === 'Warning' ? 'text-bg-warning' : 'text-bg-success'}">${status}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetBudgetForm() {
  document.getElementById('budgetForm').reset();
  document.getElementById('budgetId').value = '';
  document.getElementById('budgetModalTitle').textContent = 'Add Budget';
}

function saveBudget(event) {
  event.preventDefault();

  const id = Number(document.getElementById('budgetId').value);
  const category = document.getElementById('budgetCategory').value;
  const limit = Number(document.getElementById('budgetLimit').value);
  const period = document.getElementById('budgetPeriod').value;

  if (!category || !limit || limit <= 0 || !period) {
    alert('Please enter valid budget details.');
    return;
  }

  const budgets = getBudgets();
  const duplicate = budgets.find(item => item.category === category && item.id !== id);
  if (duplicate) {
    alert('Budget for this category already exists.');
    return;
  }

  const budgetData = { id: id || getNextId(budgets), category, limit, period };
  const updatedBudgets = id
    ? budgets.map(item => item.id === id ? budgetData : item)
    : [...budgets, budgetData];

  setData(STORAGE_KEYS.budgets, updatedBudgets);
  addNotification(id ? 'Budget updated successfully.' : `Budget added for ${category}.`);
  bootstrap.Modal.getInstance(document.getElementById('budgetModal')).hide();
  resetBudgetForm();
  renderBudgetCards();
}

function editBudget(id) {
  const budget = getBudgets().find(item => item.id === id);
  if (!budget) return;

  document.getElementById('budgetId').value = budget.id;
  document.getElementById('budgetCategory').value = budget.category;
  document.getElementById('budgetLimit').value = budget.limit;
  document.getElementById('budgetPeriod').value = budget.period;
  document.getElementById('budgetModalTitle').textContent = 'Edit Budget';

  const modal = new bootstrap.Modal(document.getElementById('budgetModal'));
  modal.show();
}

function deleteBudget(id) {
  if (!confirm('Delete this budget?')) return;
  const updatedBudgets = getBudgets().filter(item => item.id !== id);
  setData(STORAGE_KEYS.budgets, updatedBudgets);
  addNotification('Budget deleted successfully.');
  renderBudgetCards();
}
