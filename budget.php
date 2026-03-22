<?php
require_once __DIR__ . '/includes/functions.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinTrack - Budget</title>
  <link rel="icon" type="image/svg+xml" href="images/fintrack-favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="css/style.css" />
</head>
<body data-page="budget" data-user-id="<?= (int)$_SESSION['user_id'] ?>">
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
          <li class="nav-item"><a class="nav-link active" href="budget.php">Budget</a></li>
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
          <h1 class="page-title mb-2">Budget</h1>
          <p class="text-secondary mb-0">Track category budgets and monitor spending progress.</p>
        </div>
        <button class="btn btn-primary rounded-pill px-4 shadow-sm" data-bs-toggle="modal" data-bs-target="#budgetModal" id="openBudgetModalBtn">
          <i class="bi bi-plus-lg me-2"></i>Add Budget
        </button>
      </div>
    </div>

    <div class="card app-card mb-4 border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <label class="form-label small text-secondary mb-1">Search budgets</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-secondary"></i></span>
          <input type="text" id="budgetSearch" class="form-control border-start-0" placeholder="Search by category name">
        </div>
      </div>
    </div>

    <div class="row g-4" id="budgetCardContainer"></div>
  </main>

  <div class="modal fade" id="budgetModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 border-0 shadow">
        <form id="budgetForm">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-semibold" id="budgetModalTitle">Add Budget</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="budgetId">
            <div class="mb-3">
              <label class="form-label">Category</label>
              <select id="budgetCategory" class="form-select" required></select>
            </div>
            <div class="mb-3">
              <label class="form-label">Budget Limit</label>
              <input type="number" id="budgetLimit" class="form-control" min="1" step="0.01" required>
            </div>
            <div>
              <label class="form-label">Period</label>
              <select id="budgetPeriod" class="form-select" required>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary rounded-pill px-4">Save Budget</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="modal fade" id="confirmationModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 border-0 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-semibold">Confirm Delete</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p id="confirmMessage">Are you sure?</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-outline-secondary rounded-pill" id="cancelBtn" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger rounded-pill px-4" id="confirmBtn">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <footer class="app-footer mt-4">
    <div class="container py-3 text-center">
      <small>FinTrack Personal Expense Tracker</small>
    </div>
  </footer>

  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script defer src="js/common.js"></script>
  <script defer src="js/budget.js"></script>
  <script defer src="js/app.js"></script>
</body>
</html>

