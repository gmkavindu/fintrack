// Budget page - handles budget features

function getBudgetStatus(spent, limit) {
  const percentage = Math.min((spent / limit) * 100, 100);
  if (spent >= limit) return { status: 'Exceeded', progressClass: 'bg-danger', badgeClass: 'text-bg-danger', percentage };
  if (percentage >= 80) return { status: 'Warning', progressClass: 'bg-warning', badgeClass: 'text-bg-warning', percentage };
  return { status: 'On Track', progressClass: 'bg-success', badgeClass: 'text-bg-success', percentage };
}

// Show the budget page and set up event listeners
function renderBudgetPage() {
  populateCategoryOptions();
  renderBudgetCards();
  checkAndNotifyBudgetExceeded();

  document.getElementById('budgetSearch')?.addEventListener('input', renderBudgetCards);
  document.getElementById('openBudgetModalBtn')?.addEventListener('click', resetBudgetForm);
  document.getElementById('budgetForm')?.addEventListener('submit', saveBudget);
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

  const search = document.getElementById('budgetSearch')?.value.toLowerCase() || '';
  const budgets = getBudgets().filter(item => item.category.toLowerCase().includes(search));

  if (!budgets.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="card app-card border-0 shadow-sm rounded-4">
          <div class="empty-state py-5">
            <i class="bi bi-piggy-bank display-4 text-secondary mb-3 d-block opacity-50"></i>
            <p class="mb-0 text-secondary">No budgets found. Add one to track spending limits.</p>
          </div>
        </div>
      </div>`;
    return;
  }

  const spentByCategory = getExpenses().reduce((totals, item) => {
    totals[item.category] = (totals[item.category] || 0) + Number(item.amount);
    return totals;
  }, {});

  container.innerHTML = budgets.map(item => {
    const spent = spentByCategory[item.category] || 0;
    const remaining = item.limit - spent;
    const { status, progressClass, badgeClass, percentage } = getBudgetStatus(spent, item.limit);

    return `
      <div class="col-lg-6">
        <div class="card app-card h-100 border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1 fw-semibold">${item.category}</h5>
                <span class="badge rounded-pill border border-secondary-subtle text-secondary fw-normal">${item.period} budget</span>
              </div>
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm btn-outline-primary rounded-start-pill" onclick="editBudget(${item.id})" title="Edit"><i class="bi bi-pencil"></i></button>
                <button type="button" class="btn btn-sm btn-outline-danger rounded-end-pill" onclick="deleteBudget(${item.id})" title="Delete"><i class="bi bi-trash"></i></button>
              </div>
            </div>
            <div class="mb-2">Budget: <strong>${formatCurrency(item.limit)}</strong></div>
            <div class="mb-2">Spent: <strong>${formatCurrency(spent)}</strong></div>
            <div class="mb-3">Remaining: <strong>${formatCurrency(remaining)}</strong></div>
            <div class="progress mb-3"><div class="progress-bar ${progressClass}" style="width:${percentage}%"></div></div>
            <span class="badge ${badgeClass}">${status}</span>
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

async function saveBudget(event) {
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

  const previousBudgets = getBudgets();
  const previousNotifications = getNotifications();
  syncRuntimeData(STORAGE_KEYS.budgets, updatedBudgets);

  try {
    await setData(STORAGE_KEYS.budgets, updatedBudgets);
    addNotification(id ? 'Budget updated successfully.' : `Budget added for ${category}.`);
    hideModalSafely('budgetModal');
    resetBudgetForm();
    renderBudgetCards();
  } catch {
    rollbackRuntimeData(STORAGE_KEYS.budgets, previousBudgets);
    rollbackRuntimeData(STORAGE_KEYS.notifications, previousNotifications);
    showSaveError();
  }
}

function editBudget(id) {
  const budget = getBudgets().find(item => item.id === id);
  if (!budget) return;

  document.getElementById('budgetId').value = budget.id;
  document.getElementById('budgetCategory').value = budget.category;
  document.getElementById('budgetLimit').value = budget.limit;
  document.getElementById('budgetPeriod').value = budget.period;
  document.getElementById('budgetModalTitle').textContent = 'Edit Budget';

  const modalElement = document.getElementById('budgetModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

async function deleteBudget(id) {
  const confirmed = await showConfirmation('Are you sure you want to delete this budget?');
  if (!confirmed) return;
  
  const previousBudgets = getBudgets();
  const previousNotifications = getNotifications();
  const updatedBudgets = getBudgets().filter(item => item.id !== id);
  syncRuntimeData(STORAGE_KEYS.budgets, updatedBudgets);

  try {
    await setData(STORAGE_KEYS.budgets, updatedBudgets);
    addNotification('Budget deleted successfully.');
    renderBudgetCards();
  } catch {
    rollbackRuntimeData(STORAGE_KEYS.budgets, previousBudgets);
    rollbackRuntimeData(STORAGE_KEYS.notifications, previousNotifications);
    showSaveError();
  }
}
