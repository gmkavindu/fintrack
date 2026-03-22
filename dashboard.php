<?php
require_once __DIR__ . '/includes/functions.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinTrack - Dashboard</title>
  <link rel="icon" type="image/svg+xml" href="images/fintrack-favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="css/style.css" />
</head>
<body data-page="dashboard" data-user-id="<?= (int)$_SESSION['user_id'] ?>">
  <nav class="navbar navbar-expand-lg sticky-top app-navbar shadow-sm">
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="dashboard.php"><img src="images/fintrack-favicon.svg" alt="" class="app-brand-icon" width="28" height="28">FinTrack</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          <li class="nav-item"><a class="nav-link active" href="dashboard.php">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" href="expenses.php">Expenses</a></li>
          <li class="nav-item"><a class="nav-link" href="categories.php">Categories</a></li>
          <li class="nav-item"><a class="nav-link" href="budget.php">Budget</a></li>
          <li class="nav-item"><a class="nav-link" href="report.php">Report</a></li>
          <li class="nav-item"><a class="nav-link" href="contact.php">Contact</a></li>
          <li class="nav-item"><a class="nav-link" href="auth/logout.php">Logout</a></li>
          <li class="nav-item dropdown">
            <button class="btn btn-icon position-relative" data-bs-toggle="dropdown" type="button">
              <i class="bi bi-bell"></i>
              <span id="notificationBadge" class="badge rounded-pill text-bg-danger notification-badge">0</span>
            </button>
            <div class="dropdown-menu dropdown-menu-end notification-menu p-0">
              <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h6 class="mb-0">Notifications</h6>
                <button class="btn btn-sm btn-outline-secondary" id="clearNotificationsBtn">Clear All</button>
              </div>
              <div id="notificationList" class="notification-list"></div>
            </div>
          </li>
          <li class="nav-item">
            <button class="btn btn-icon" id="themeToggleBtn" type="button"><i class="bi bi-moon-stars"></i></button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container py-4">
    <div class="border-bottom border-secondary-subtle pb-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h1 class="page-title mb-2">Dashboard</h1>
          <p class="text-secondary mb-0">Overview of your personal expenses and spending activity.</p>
        </div>
        <div class="date-box align-self-center" id="currentDate"></div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card stat-card h-100 border-0 rounded-4 shadow-sm">
          <div class="card-body p-4">
            <p class="stat-label d-flex align-items-center gap-2 mb-2"><i class="bi bi-cash-stack"></i> Total Expenses</p>
            <h3 class="mb-0 fs-2 fw-bold" id="dashboardTotalExpenses">LKR 0.00</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stat-card h-100 border-0 rounded-4 shadow-sm">
          <div class="card-body p-4">
            <p class="stat-label d-flex align-items-center gap-2 mb-2"><i class="bi bi-receipt"></i> Transactions</p>
            <h3 class="mb-0 fs-2 fw-bold" id="dashboardTransactionCount">0</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stat-card h-100 border-0 rounded-4 shadow-sm">
          <div class="card-body p-4">
            <p class="stat-label d-flex align-items-center gap-2 mb-2"><i class="bi bi-graph-up-arrow"></i> Average Expense</p>
            <h3 class="mb-0 fs-2 fw-bold" id="dashboardAverageExpense">LKR 0.00</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card app-card h-100 border-0 shadow-sm rounded-4">
          <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center gap-2">
            <span class="icon-circle bg-primary bg-opacity-10 text-primary"><i class="bi bi-activity"></i></span>
            <h5 class="mb-0 fw-semibold">Expense Trend</h5>
          </div>
          <div class="card-body pt-3 pb-4 px-4">
            <canvas id="expenseTrendChart" height="120"></canvas>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card app-card h-100 border-0 shadow-sm rounded-4">
          <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center gap-2">
            <span class="icon-circle bg-primary bg-opacity-10 text-primary"><i class="bi bi-pie-chart"></i></span>
            <h5 class="mb-0 fw-semibold">Category Distribution</h5>
          </div>
          <div class="card-body pt-3 pb-4 px-4">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card app-card mt-4 border-0 shadow-sm rounded-4">
      <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center gap-2">
        <span class="icon-circle bg-primary bg-opacity-10 text-primary"><i class="bi bi-clock-history"></i></span>
        <h5 class="mb-0 fw-semibold">Recent Activity</h5>
      </div>
      <div class="card-body pt-2 px-0 pb-0">
        <div id="recentActivityList" class="list-group list-group-flush rounded-bottom"></div>
      </div>
    </div>
  </main>

  <footer class="app-footer mt-4">
    <div class="container py-3 text-center">
      <small>FinTrack Personal Expense Tracker</small>
    </div>
  </footer>

  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script defer src="js/common.js"></script>
  <script defer src="js/dashboard.js"></script>
  <script defer src="js/app.js"></script>
</body>
</html>

