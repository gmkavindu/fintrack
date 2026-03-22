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
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="css/style.css" />
</head>
<body data-page="contact" data-user-id="<?= isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0 ?>">
  <nav class="navbar navbar-expand-lg sticky-top app-navbar">
    <div class="container">
      <a class="navbar-brand fw-bold" href="dashboard.php"><img src="images/fintrack-favicon.svg" alt="FinTrack" class="app-brand-icon me-2">FinTrack</a>
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

  <main class="container py-5 auth-container">
    <div class="auth-card mx-auto" style="max-width: 760px;">
      <h1 class="h3 mb-2">Contact Us</h1>
      <p class="text-secondary mb-4">Send your question or feedback and we will get back to you.</p>

      <?php if ($errors): ?>
        <div class="alert alert-danger">
          <ul class="mb-0">
            <?php foreach ($errors as $error): ?>
              <li><?= e($error) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      <?php endif; ?>

      <?php if ($success): ?>
        <div class="alert alert-success"><?= e($success) ?></div>
      <?php endif; ?>

      <form method="post" action="contact.php" novalidate>
        <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input id="name" name="name" class="form-control" value="<?= e($name) ?>" required>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input id="email" name="email" type="email" class="form-control" value="<?= e($email) ?>" required>
        </div>
        <div class="mb-3">
          <label for="message" class="form-label">Message</label>
          <textarea id="message" name="message" class="form-control" rows="6" required><?= e($message) ?></textarea>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button type="submit" class="btn btn-primary">Send Message</button>
          <a href="dashboard.php" class="btn btn-outline-secondary">Back to Dashboard</a>
        </div>
      </form>
    </div>
  </main>

  <footer class="app-footer mt-4">
    <div class="container py-3 text-center">
      <small>FinTrack Personal Expense Tracker</small>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/common.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
