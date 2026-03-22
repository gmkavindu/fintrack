// Report page - shows summary and charts for all data

let reportCategoryChartInstance;
let reportTrendChartInstance;

function getHighestCategory(categoryTotals) {
  return Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
}

function getReportCards() {
  const expenses = getExpenses();
  const budgets = getBudgets();
  const categoryTotals = getCategoryTotals();
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalBudget = budgets.reduce((sum, item) => sum + Number(item.limit), 0);

  return [
    { label: 'Total Expenses', value: formatCurrency(totalExpenses) },
    { label: 'Remaining', value: formatCurrency(totalBudget - totalExpenses) },
    { label: 'Average Spending', value: formatCurrency(expenses.length ? totalExpenses / expenses.length : 0) },
    { label: 'Budget', value: formatCurrency(totalBudget) },
    { label: 'Transactions', value: expenses.length },
    { label: 'Highest Category', value: getHighestCategory(categoryTotals) }
  ];
}

function getReportStatus(spending, budgetValue) {
  if (!budgetValue) return { status: 'No Budget', badgeClass: 'text-bg-secondary' };
  if (spending >= budgetValue) return { status: 'Exceeded', badgeClass: 'text-bg-danger' };
  if (spending >= budgetValue * 0.8) return { status: 'Warning', badgeClass: 'text-bg-warning' };
  return { status: 'On Track', badgeClass: 'text-bg-success' };
}

// Show the report page and set up event listeners
function renderReportPage() {
  renderReportSummaryCards();
  renderReportCharts();
  renderReportTable();
}

// Show summary cards for report
function renderReportSummaryCards() {
  const container = document.getElementById('reportSummaryCards');
  if (!container) return;

  container.innerHTML = getReportCards().map(card => `
    <div class="col-md-4">
      <div class="card app-card h-100">
        <div class="card-body">
          <p class="text-secondary mb-2">${card.label}</p>
          <h5 class="mb-0">${card.value}</h5>
        </div>
      </div>
    </div>
  `).join('');
}

function renderReportCharts() {
  const categoryTotals = getCategoryTotals();
  const monthlyTotals = getMonthlyTotals();
  const categoryCtx = document.getElementById('reportCategoryChart');
  const trendCtx = document.getElementById('reportTrendChart');

  if (reportCategoryChartInstance) reportCategoryChartInstance.destroy();
  if (reportTrendChartInstance) reportTrendChartInstance.destroy();

  if (categoryCtx) {
    reportCategoryChartInstance = new Chart(categoryCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{ label: 'Amount', data: Object.values(categoryTotals) }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  if (trendCtx) {
    reportTrendChartInstance = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: Object.keys(monthlyTotals),
        datasets: [{ label: 'Monthly Expenses', data: Object.values(monthlyTotals), tension: 0.3 }]
      },
      options: { responsive: true }
    });
  }
}

function renderReportTable() {
  const body = document.getElementById('reportTableBody');
  if (!body) return;

  const categories = getCategories();
  const budgets = getBudgets();

  body.innerHTML = categories.map(category => {
    const spending = getBudgetSpent(category.name);
    const budget = budgets.find(item => item.category === category.name);
    const budgetValue = budget ? Number(budget.limit) : 0;
    const remaining = budgetValue - spending;
    const { status, badgeClass } = getReportStatus(spending, budgetValue);

    return `
      <tr>
        <td>${category.name}</td>
        <td>${formatCurrency(spending)}</td>
        <td>${budget ? formatCurrency(budgetValue) : '-'}</td>
        <td>${budget ? formatCurrency(remaining) : '-'}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
      </tr>
    `;
  }).join('');
}
