// Categories page - handles category features

function showCategoryActionMessage(text, type = 'warning') {
  const messageBox = document.getElementById('categoryActionMessage');
  if (!messageBox) return;

  messageBox.className = `alert alert-${type} rounded-3 border-0 shadow-sm`;
  messageBox.textContent = text;

  window.setTimeout(() => {
    messageBox.className = 'alert d-none rounded-3 border-0 shadow-sm';
    messageBox.textContent = '';
  }, 3500);
}

// Show the categories page and set up event listeners
function renderCategoriesPage() {
  renderCategoryTable(); // Show all categories
  updateTopCategory(); // Show top category

  // When user types in search, update table
  document.getElementById('categorySearch').addEventListener('input', renderCategoryTable);
  // When user clicks to add new category, reset form
  document.getElementById('openCategoryModalBtn').addEventListener('click', resetCategoryForm);
  // When user submits category form, save category
  document.getElementById('categoryForm').addEventListener('submit', saveCategory);
}

// Show all categories in a table
function renderCategoryTable() {
  const search = document.getElementById('categorySearch')?.value.toLowerCase() || '';
  const categories = getCategories();
  const totals = getCategoryTotals();
  const body = document.getElementById('categoryTableBody');
  if (!body) return;

  // Filter categories by search
  const filtered = categories.filter(item => item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search));

  // If no categories, show empty state
  if (!filtered.length) {
    body.innerHTML = '<tr><td colspan="5" class="empty-state">No categories found.</td></tr>';
    return;
  }

  // Show each category row
  body.innerHTML = filtered.map(item => {
    const relatedExpenses = getExpenses().filter(expense => expense.category === item.name);
    const totalSpending = totals[item.name] || 0;

    return `
      <tr>
        <td>${item.name}</td>
        <td>${item.description}</td>
        <td>${relatedExpenses.length}</td>
        <td>${formatCurrency(totalSpending)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-2" onclick="editCategory(${item.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${item.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateTopCategory() {
  const chip = document.getElementById('topCategoryChip');
  if (!chip) return;

  const totals = getCategoryTotals();
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  chip.innerHTML = entries.length
    ? `<i class="bi bi-bar-chart-line-fill me-2 text-primary"></i>Top spending category: ${entries[0][0]}`
    : '<i class="bi bi-bar-chart-line-fill me-2 text-primary"></i>Top spending category: -';
}

function resetCategoryForm() {
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryId').value = '';
  document.getElementById('categoryModalTitle').textContent = 'Add Category';
}

async function saveCategory(event) {
  event.preventDefault();

  const id = Number(document.getElementById('categoryId').value);
  const name = document.getElementById('categoryName').value.trim();
  const description = document.getElementById('categoryDescription').value.trim();

  if (!name || !description) {
    alert('Please enter valid category details.');
    return;
  }

  const categories = getCategories();
  const duplicate = categories.find(item => item.name.toLowerCase() === name.toLowerCase() && item.id !== id);
  if (duplicate) {
    alert('Category name already exists.');
    return;
  }

  const categoryData = { id: id || getNextId(categories), name, description };
  const updatedCategories = id
    ? categories.map(item => item.id === id ? categoryData : item)
    : [...categories, categoryData];

  const previousCategories = getCategories();
  const previousNotifications = getNotifications();
  syncRuntimeData(STORAGE_KEYS.categories, updatedCategories);

  try {
    await setData(STORAGE_KEYS.categories, updatedCategories);
    addNotification(id ? 'Category updated successfully.' : 'New category added successfully.');
    hideModalSafely('categoryModal');
    resetCategoryForm();
    renderCategoryTable();
    updateTopCategory();
  } catch (error) {
    rollbackRuntimeData(STORAGE_KEYS.categories, previousCategories);
    rollbackRuntimeData(STORAGE_KEYS.notifications, previousNotifications);
    showSaveError();
  }
}

function editCategory(id) {
  const category = getCategories().find(item => item.id === id);
  if (!category) return;

  document.getElementById('categoryId').value = category.id;
  document.getElementById('categoryName').value = category.name;
  document.getElementById('categoryDescription').value = category.description;
  document.getElementById('categoryModalTitle').textContent = 'Edit Category';

  const modalElement = document.getElementById('categoryModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

async function deleteCategory(id) {
  const category = getCategories().find(item => item.id === id);
  if (!category) return;

  const hasExpenses = getExpenses().some(item => item.category === category.name);
  if (hasExpenses) {
    showCategoryActionMessage('Cannot delete category because it is used in expenses. Delete related expenses first.', 'warning');
    addNotification('Cannot delete category because it is used in expenses. Delete related expenses first.');
    renderNotifications();
    return;
  }

  const confirmed = await showConfirmation('Are you sure you want to delete this category?');
  if (!confirmed) return;

  const previousCategories = getCategories();
  const previousBudgets = getBudgets();
  const previousNotifications = getNotifications();
  const updatedCategories = getCategories().filter(item => item.id !== id);
  const updatedBudgets = getBudgets().filter(item => item.category !== category.name);
  syncRuntimeData(STORAGE_KEYS.categories, updatedCategories);
  syncRuntimeData(STORAGE_KEYS.budgets, updatedBudgets);

  try {
    await setData(STORAGE_KEYS.categories, updatedCategories);
    await setData(STORAGE_KEYS.budgets, updatedBudgets);
    addNotification('Category deleted successfully.');
    renderCategoryTable();
    updateTopCategory();
  } catch (error) {
    rollbackRuntimeData(STORAGE_KEYS.categories, previousCategories);
    rollbackRuntimeData(STORAGE_KEYS.budgets, previousBudgets);
    rollbackRuntimeData(STORAGE_KEYS.notifications, previousNotifications);
    showSaveError();
  }
}
