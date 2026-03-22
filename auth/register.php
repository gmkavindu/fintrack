<?php
// Registration handler + form.

declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/db.php';

$errors = [];
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = clean_input($_POST['username'] ?? '');
    $email = clean_input($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '') {
        $errors[] = 'Username is required.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email is required.';
    }

    if (strlen($password) < 6) {
        $errors[] = 'Password must be at least 6 characters.';
    }

    if (!$errors) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);

        if ($stmt->fetch()) {
            $errors[] = 'Email already registered.';
        } else {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            $insert = $pdo->prepare('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)');
            $insert->execute([
                'username' => $username,
                'email' => $email,
                'password' => $hashedPassword,
            ]);

            $success = 'Registration successful. You can login now.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register | FinTrack</title>
  <link rel="icon" type="image/svg+xml" href="../images/fintrack-favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body class="auth-page d-flex flex-column">
  <nav class="navbar navbar-expand-lg sticky-top app-navbar shadow-sm">
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="../dashboard.php">
        <img src="../images/fintrack-favicon.svg" alt="" class="app-brand-icon" width="28" height="28">FinTrack
      </a>
      <div class="ms-auto d-flex flex-wrap gap-2">
        <a href="login.php" class="btn btn-outline-primary btn-sm rounded-pill px-3">Login</a>
        <a href="../contact.php" class="btn btn-outline-secondary btn-sm rounded-pill px-3">Contact</a>
      </div>
    </div>
  </nav>

  <main class="container py-4 py-lg-5 flex-grow-1 d-flex align-items-center auth-container">
    <div class="card auth-card mx-auto w-100 rounded-4 overflow-hidden border-0">
      <div class="row g-0 align-items-stretch">
        <div class="col-12 col-md-6 auth-sidebar-brand bg-primary d-none d-md-flex flex-column justify-content-center p-4 p-xl-5 text-md-start text-center">
          <div class="mb-4">
            <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25 p-4 shadow-sm" style="width: 5rem; height: 5rem;">
              <img src="../images/fintrack-favicon.svg" alt="FinTrack logo" class="auth-panel-logo">
            </span>
          </div>
          <h2 class="display-6 fw-bold text-white mb-3 lh-sm auth-single-line">Join FinTrack</h2>
          <p class="mb-0 text-white opacity-75 fs-6 lh-lg">Create a free account and start organizing your spending today.</p>
        </div>

        <div class="col-12 col-md-6 auth-form-panel p-4 p-lg-5 d-flex flex-column justify-content-center">
          <div class="d-md-none auth-mobile-banner text-center mb-4 rounded-4 bg-primary text-white p-4 shadow-sm">
            <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25 p-3 mb-3" style="width: 4rem; height: 4rem;">
              <img src="../images/fintrack-favicon.svg" alt="FinTrack logo" class="auth-panel-logo auth-panel-logo-sm">
            </span>
            <div class="h5 fw-bold mb-1 auth-single-line">Join FinTrack</div>
            <p class="small mb-0 opacity-75">Create your account to get started.</p>
          </div>

          <div class="d-none d-md-block mb-4">
            <h1 class="h3 fw-bold page-title-auth mb-2">Create account</h1>
            <p class="text-secondary mb-0">Fill in your details to get started.</p>
          </div>

          <?php if ($errors): ?>
            <div class="alert alert-danger d-flex align-items-start gap-2 rounded-4 border-0 mb-4" role="alert">
              <i class="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1"></i>
              <ul class="mb-0 ps-3 small">
                <?php foreach ($errors as $error): ?>
                  <li><?= e($error) ?></li>
                <?php endforeach; ?>
              </ul>
            </div>
          <?php endif; ?>

          <?php if ($success): ?>
            <div class="alert alert-success d-flex align-items-start gap-2 rounded-4 border-0 mb-4" role="alert">
              <i class="bi bi-check-circle-fill flex-shrink-0 mt-1"></i>
              <span class="small"><?= e($success) ?></span>
            </div>
          <?php endif; ?>

          <form method="post" action="register.php" novalidate>
            <div class="mb-3">
              <label for="username" class="form-label small fw-semibold mb-2">Username</label>
              <div class="input-group auth-input-group">
                <span class="input-group-text ps-3"><i class="bi bi-person text-secondary"></i></span>
                <input id="username" name="username" class="form-control py-3 pe-3" placeholder="Your name" value="<?= e($username ?? '') ?>" required autocomplete="username">
              </div>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label small fw-semibold mb-2">Email</label>
              <div class="input-group auth-input-group">
                <span class="input-group-text ps-3"><i class="bi bi-envelope text-secondary"></i></span>
                <input id="email" name="email" type="email" class="form-control py-3 pe-3" placeholder="you@example.com" value="<?= e($email ?? '') ?>" required autocomplete="email">
              </div>
            </div>
            <div class="mb-4">
              <label for="password" class="form-label small fw-semibold mb-2">Password</label>
              <div class="input-group auth-input-group">
                <span class="input-group-text ps-3"><i class="bi bi-lock text-secondary"></i></span>
                <input id="password" name="password" type="password" class="form-control py-3 pe-3" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password">
              </div>
              <div class="form-text mt-2">Use at least 6 characters.</div>
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-auth-cta btn-lg rounded-pill py-3">
                <i class="bi bi-person-check me-2"></i>Register
              </button>
            </div>
            <p class="text-center text-secondary small mb-0 mt-4">Already registered? <a href="login.php" class="fw-semibold text-primary text-decoration-none">Sign in</a></p>
          </form>
        </div>
      </div>
    </div>
  </main>

  <footer class="app-footer mt-auto">
    <div class="container py-3 text-center">
      <small class="text-secondary">FinTrack Personal Expense Tracker</small>
    </div>
  </footer>
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script defer src="../js/common.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      bindPageTransitions();
    });
  </script>
</body>
</html>
