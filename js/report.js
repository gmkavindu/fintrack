// Report page - shows summary and charts for all data

let reportCategoryChartInstance;
let reportTrendChartInstance;

// Show the report page and set up event listeners
function renderReportPage() {
  renderReportSummaryCards(); // Show summary cards
  renderReportCharts(); // Show charts
  renderReportTable(); // Show table
}

// Show summary cards for report
function renderReportSummaryCards() {
  const container = document.getElementById('reportSummaryCards');
  if (!container) return;

  const expenses = getExpenses();
  const budgets = getBudgets();
  const totals = getCategoryTotals();
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalBudget = budgets.reduce((sum, item) => sum + Number(item.limit), 0);
  const remaining = totalBudget - totalExpenses;
  const averageDaily = expenses.length ? totalExpenses / expenses.length : 0;
  const highestCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Cards to show
  const cards = [
    { label: 'Total Expenses', value: formatCurrency(totalExpenses) },
    { label: 'Remaining', value: formatCurrency(remaining) },
    { label: 'Average Spending', value: formatCurrency(averageDaily) },
    { label: 'Budget', value: formatCurrency(totalBudget) },
    { label: 'Transactions', value: expenses.length },
    { label: 'Highest Category', value: highestCategory }
  ];

  // Show each card
  container.innerHTML = cards.map(card => `
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
    let status = 'No Budget';
    let badgeClass = 'text-bg-secondary';

    if (budget) {
      if (spending >= budgetValue) {
        status = 'Exceeded';
        badgeClass = 'text-bg-danger';
      } else if (spending >= budgetValue * 0.8) {
        status = 'Warning';
        badgeClass = 'text-bg-warning';
      } else {
        status = 'On Track';
        badgeClass = 'text-bg-success';
      }
    }

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
