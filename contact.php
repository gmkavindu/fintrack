<?php
// Contact form handler + page.

declare(strict_types=1);

require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/db.php';

$name = '';
$email = '';
$message = '';
$errors = [];
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = clean_input($_POST['name'] ?? '');
    $email = clean_input($_POST['email'] ?? '');
    $message = clean_input($_POST['message'] ?? '');

    if ($name === '') {
        $errors[] = 'Name is required.';
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email is required.';
    }
    
    if ($message === '') {
        $errors[] = 'Message is required.';
    }

    if (!$errors) {
        $stmt = $pdo->prepare('INSERT INTO messages (name, email, message) VALUES (:name, :email, :message)');
        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'message' => $message,
        ]);

        $success = 'Your message has been sent successfully.';
        $name = '';
        $email = '';
        $message = '';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contact | FinTrack</title>
  <link rel="icon" type="image/svg+xml" href="images/fintrack-favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="css/style.css" />
</head>
<body data-page="contact" data-user-id="<?= isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0 ?>">
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
          <li class="nav-item"><a class="nav-link" href="report.php">Report</a></li>
          <li class="nav-item"><a class="nav-link active" href="contact.php">Contact</a></li>
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
          <?php if (is_logged_in()): ?>
            <li class="nav-item"><a class="nav-link" href="auth/logout.php">Logout</a></li>
          <?php else: ?>
            <li class="nav-item"><a class="nav-link" href="auth/login.php">Login</a></li>
          <?php endif; ?>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container py-4 py-lg-5 auth-container">
    <div class="border-bottom border-secondary-subtle pb-4 mb-4 text-center text-lg-start">
      <h1 class="page-title mb-2">Contact</h1>
      <p class="text-secondary mb-0">Send a message — we will get back to you as soon as we can.</p>
    </div>

    <div class="card auth-card mx-auto border-0 rounded-4 overflow-hidden" style="max-width: 960px;">
      <div class="row g-0 align-items-stretch">
        <div class="col-12 col-lg-5 auth-sidebar-brand bg-primary d-flex flex-column justify-content-center p-4 p-xl-5 text-white order-lg-0 order-1">
          <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25 p-4 mb-4 shadow-sm" style="width: 5rem; height: 5rem;">
            <i class="bi bi-chat-dots fs-1 text-white"></i>
          </span>
          <h2 class="display-6 fw-bold text-white mb-3 lh-sm">We are here to help</h2>
          <ul class="list-unstyled mb-0 small text-white opacity-90 lh-lg">
            <li class="d-flex align-items-start gap-2 mb-2"><i class="bi bi-check-circle mt-1 flex-shrink-0"></i> Questions about FinTrack</li>
            <li class="d-flex align-items-start gap-2 mb-2"><i class="bi bi-check-circle mt-1"></i> Feedback and suggestions</li>
            <li class="d-flex align-items-start gap-2"><i class="bi bi-check-circle mt-1"></i> General inquiries</li>
          </ul>
        </div>
        <div class="col-12 col-lg-7 auth-form-panel p-4 p-lg-5 order-lg-1 order-0">
          <?php if ($errors): ?>
            <div class="alert alert-danger d-flex align-items-start gap-2 rounded-3 border-0" role="alert">
              <i class="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1"></i>
              <ul class="mb-0 ps-3 small">
                <?php foreach ($errors as $error): ?>
                  <li><?= e($error) ?></li>
                <?php endforeach; ?>
              </ul>
            </div>
          <?php endif; ?>

          <?php if ($success): ?>
            <div class="alert alert-success d-flex align-items-start gap-2 rounded-3 border-0" role="alert">
              <i class="bi bi-check-circle-fill flex-shrink-0 mt-1"></i>
              <span class="small"><?= e($success) ?></span>
            </div>
          <?php endif; ?>

          <form method="post" action="contact.php" novalidate>
            <div class="mb-3">
              <label for="name" class="form-label small fw-semibold mb-2">Name</label>
              <div class="input-group auth-input-group">
                <span class="input-group-text ps-3"><i class="bi bi-person text-secondary"></i></span>
                <input id="name" name="name" class="form-control py-3 pe-3" placeholder="Your name" value="<?= e($name) ?>" required autocomplete="name">
              </div>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label small fw-semibold mb-2">Email</label>
              <div class="input-group auth-input-group">
                <span class="input-group-text ps-3"><i class="bi bi-envelope text-secondary"></i></span>
                <input id="email" name="email" type="email" class="form-control py-3 pe-3" placeholder="you@example.com" value="<?= e($email) ?>" required autocomplete="email">
              </div>
            </div>
            <div class="mb-4">
              <label for="message" class="form-label small fw-semibold mb-2">Message</label>
              <textarea id="message" name="message" class="form-control rounded-4 py-3 px-3" rows="5" placeholder="How can we help?" required><?= e($message) ?></textarea>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button type="submit" class="btn btn-auth-cta rounded-pill px-4 py-2"><i class="bi bi-send me-2"></i>Send message</button>
              <a href="dashboard.php" class="btn btn-outline-secondary rounded-pill">Back to dashboard</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>

  <footer class="app-footer mt-4">
    <div class="container py-3 text-center">
      <small>FinTrack Personal Expense Tracker</small>
    </div>
  </footer>

  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script defer src="js/common.js"></script>
  <script defer src="js/app.js"></script>
</body>
</html>
