<?php
/**
 * LOGIN PAGE (auth/login.php)
 * 
 * Purpose: Allow existing users to log into their account
 * 
 * Features:
 * - User enters: email and password
 * - Validates inputs (email format, password not empty)
 * - Searches database for matching email
 * - Verifies password using password_verify() (secure comparison)
 * - Creates session with user_id and username
 * - Redirects to dashboard on success
 * - Shows error message on failure (security: doesn't reveal if email exists)
 */

declare(strict_types=1);

// Load helper functions and database connection
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/db.php';

// Initialize error array
$errors = [];

// Check if form was submitted via POST (user clicked "Login" button)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form inputs
    $email = clean_input($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';  // Don't clean password
    
    // VALIDATION 1: Check if email is valid format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email is required.';
    }
    
    // VALIDATION 2: Check if password was provided
    if ($password === '') {
        $errors[] = 'Password is required.';
    }

    // If validations pass, continue with login
    if (!$errors) {
        // STEP 1: Query database for user with matching email
        $stmt = $pdo->prepare('SELECT id, username, password FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();  // Returns user array or false if not found

        // STEP 2: Verify credentials
        // Check two things:
        // 1. User exists ($user not false)
        // 2. Password matches using password_verify (secure comparison)
        if ($user && password_verify($password, $user['password'])) {
            // LOGIN SUCCESS - Create session variables
            $_SESSION['user_id'] = (int)$user['id'];        // Store user ID in session
            $_SESSION['username'] = $user['username'];      // Store username in session
            
            // Redirect to dashboard
            redirect_to('/fintrack/dashboard.php');
        }

        // LOGIN FAILED - Show error (generic: doesn't reveal if email exists)
        $errors[] = 'Invalid email or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | FinTrack</title>
  <link rel="icon" type="image/svg+xml" href="../images/fintrack-favicon.svg">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body class="auth-page">
  <nav class="navbar navbar-expand-lg sticky-top app-navbar">
    <div class="container">
      <a class="navbar-brand fw-bold" href="../dashboard.php"><img src="../images/fintrack-favicon.svg" alt="FinTrack" class="app-brand-icon me-2">FinTrack</a>
      <div class="ms-auto d-flex gap-2">
        <a href="register.php" class="btn btn-outline-primary btn-sm">Register</a>
        <a href="../contact.php" class="btn btn-outline-secondary btn-sm">Contact</a>
      </div>
    </div>
  </nav>

  <main class="container py-5 auth-container">
    <div class="auth-card mx-auto">
      <h1 class="h3 mb-2">Welcome Back</h1>
      <p class="text-secondary mb-4">Login to continue managing your FinTrack dashboard.</p>

      <!-- Show validation/login errors if any -->
    <?php if ($errors): ?>
      <div class="alert alert-danger">
        <ul class="mb-0">
          <?php foreach ($errors as $error): ?>
            <li><?= e($error) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>

      <!-- Login form that submits to this page (login.php) -->
    <form method="post" action="login.php" novalidate>
      <!-- Email field -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" name="email" type="email" class="form-control" value="<?= e($email ?? '') ?>" required>
      </div>
      
      <!-- Password field -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" name="password" type="password" class="form-control" required>
      </div>
      
      <!-- Submit button -->
      <div class="d-grid mb-2">
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
      
      <!-- Link to registration page for new users -->
      <p class="mb-0 text-secondary">Don't have an account? <a href="register.php">Create one</a></p>
    </form>
    </div>
  </main>

  <footer class="app-footer mt-4">
    <div class="container py-3 text-center">
      <small>FinTrack Personal Expense Tracker</small>
    </div>
  </footer>
  <script src="../js/common.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      bindPageTransitions();
    });
  </script>
</body>
</html>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | FinTrack</title>
  <link rel="icon" type="image/svg+xml" href="../images/fintrack-favicon.svg">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body class="auth-page">
  <nav class="navbar navbar-expand-lg sticky-top app-navbar">
    <div class="container">
      <a class="navbar-brand fw-bold" href="../dashboard.php"><img src="../images/fintrack-favicon.svg" alt="FinTrack" class="app-brand-icon me-2">FinTrack</a>
      <div class="ms-auto d-flex gap-2">
        <a href="register.php" class="btn btn-outline-primary btn-sm">Register</a>
        <a href="../contact.php" class="btn btn-outline-secondary btn-sm">Contact</a>
      </div>
    </div>
  </nav>

  <main class="container py-5 auth-container">
    <div class="auth-card mx-auto">
      <h1 class="h3 mb-2">Welcome Back</h1>
      <p class="text-secondary mb-4">Login to continue managing your FinTrack dashboard.</p>

    <?php if ($errors): ?>
      <div class="alert alert-danger">
        <ul class="mb-0">
          <?php foreach ($errors as $error): ?>
            <li><?= e($error) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>

    <form method="post" action="login.php" novalidate>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" name="email" type="email" class="form-control" value="<?= e($email ?? '') ?>" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" name="password" type="password" class="form-control" required>
      </div>
      <div class="d-grid mb-2">
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
      <p class="mb-0 text-secondary">Don't have an account? <a href="register.php">Create one</a></p>
    </form>
    </div>
  </main>

  <footer class="app-footer mt-4">
    <div class="container py-3 text-center">
      <small>FinTrack Personal Expense Tracker</small>
    </div>
  </footer>
  <script src="../js/common.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      bindPageTransitions();
    });
  </script>
</body>
</html>
