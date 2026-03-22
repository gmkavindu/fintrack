<?php
require_once __DIR__ . '/includes/functions.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinTrack - Report</title>
  <link rel="icon" type="image/svg+xml" href="images/fintrack-favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="css/style.css" />
</head>
<body data-page="report" data-user-id="<?= (int)$_SESSION['user_id'] ?>">
  <nav class="navbar navbar-expand-lg sticky-top app-navbar shadow-sm">
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="dashboard.php"><img src="images/fintrack-favicon.svg" alt="" class="app-brand-icon" width="28" height="28">FinTrack</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          <li class="nav-item"><a class="nav-link" href="dashboard.php">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" href="expenses.php">Expenses</a></li>
          <li class="nav-item"><a class="nav-link" href="categories.php">Categories</a></li>
          <li class="nav-item"><a class="nav-link" href="budget.php">Budget</a></li>
          <li class="nav-item"><a class="nav-link active" href="report.php">Report</a></li>
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
      <h1 class="page-title mb-2">Report</h1>
      <p class="text-secondary mb-0">Summary view of expenses, budgets, and category performance.</p>
    </div>

    <div class="row g-4 mb-4" id="reportSummaryCards"></div>

    <div class="row g-4 mb-4">
      <div class="col-lg-6">
        <div class="card app-card h-100 border-0 shadow-sm rounded-4">
          <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center gap-2">
            <span class="icon-circle bg-primary bg-opacity-10 text-primary"><i class="bi bi-bar-chart-line"></i></span>
            <h5 class="mb-0 fw-semibold">Spending by Category</h5>
          </div>
          <div class="card-body pt-3 pb-4 px-4">
            <canvas id="reportCategoryChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card app-card h-100 border-0 shadow-sm rounded-4">
          <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center gap-2">
            <span class="icon-circle bg-primary bg-opacity-10 text-primary"><i class="bi bi-graph-up"></i></span>
            <h5 class="mb-0 fw-semibold">Monthly Expense Trend</h5>
          </div>
          <div class="card-body pt-3 pb-4 px-4">
            <canvas id="reportTrendChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card app-card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center gap-2">
        <span class="icon-circle bg-primary bg-opacity-10 text-primary"><i class="bi bi-table"></i></span>
        <h5 class="mb-0 fw-semibold">Category Summary</h5>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Spending</th>
              <th>Budget</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="reportTableBody"></tbody>
        </table>
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
  <script defer src="js/report.js"></script>
  <script defer src="js/app.js"></script>
</body>
</html>

