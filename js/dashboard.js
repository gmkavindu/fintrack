// Dashboard page - shows summary and charts

let expenseTrendChartInstance;
let dashboardCategoryChartInstance;

// Show dashboard summary and charts
function renderDashboardPage() {
  const summary = getSummaryData();
  const currentDate = document.getElementById('currentDate');
  if (currentDate) currentDate.textContent = new Date().toDateString();

  // Show summary values
  document.getElementById('dashboardTotalExpenses').textContent = formatCurrency(summary.total);
  document.getElementById('dashboardTransactionCount').textContent = summary.count;
  document.getElementById('dashboardAverageExpense').textContent = formatCurrency(summary.average);

  // Check for exceeded budgets and add notifications
  checkAndNotifyBudgetExceeded();

  // Show charts and recent activity
  renderDashboardCharts();
  renderRecentActivity();
}

// Show dashboard charts
function renderDashboardCharts() {
  const monthlyTotals = getMonthlyTotals();
  const categoryTotals = getCategoryTotals();

  const trendCtx = document.getElementById('expenseTrendChart');
  const categoryCtx = document.getElementById('categoryChart');

  // Remove old charts if present
  if (expenseTrendChartInstance) expenseTrendChartInstance.destroy();
  if (dashboardCategoryChartInstance) dashboardCategoryChartInstance.destroy();

  // Show expense trend chart
  if (trendCtx) {
    expenseTrendChartInstance = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: Object.keys(monthlyTotals),
        datasets: [{
          label: 'Expenses',
          data: Object.values(monthlyTotals),
          tension: 0.3,
          fill: false
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  if (categoryCtx) {
    dashboardCategoryChartInstance = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{ data: Object.values(categoryTotals) }]
      },
      options: { responsive: true }
    });
  }
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivityList');
  if (!container) return;

  const expenses = [...getExpenses()]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (!expenses.length) {
    container.innerHTML = `
      <div class="empty-state py-5 px-3">
        <i class="bi bi-clock-history display-4 text-secondary mb-3 d-block opacity-50"></i>
        <p class="mb-0 text-secondary">No recent activity available.</p>
      </div>`;
    return;
  }

  container.innerHTML = expenses.map(item => `
    <div class="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-start-0 border-end-0">
      <div class="me-2">
        <div class="fw-semibold">${item.title}</div>
        <small class="text-secondary">${item.category} • ${item.date}</small>
      </div>
      <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">${formatCurrency(item.amount)}</span>
    </div>
  `).join('');
}
