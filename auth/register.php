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
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body class="auth-page">
  <nav class="navbar navbar-expand-lg sticky-top app-navbar">
    <div class="container">
      <a class="navbar-brand fw-bold" href="../dashboard.php"><img src="../images/fintrack-favicon.svg" alt="FinTrack" class="app-brand-icon me-2">FinTrack</a>
      <div class="ms-auto d-flex gap-2">
        <a href="login.php" class="btn btn-outline-primary btn-sm">Login</a>
        <a href="../contact.php" class="btn btn-outline-secondary btn-sm">Contact</a>
      </div>
    </div>
  </nav>

  <main class="container py-5 auth-container">
    <div class="auth-card mx-auto">
      <h1 class="h3 mb-2">Create Account</h1>
      <p class="text-secondary mb-4">Register to start tracking expenses with FinTrack.</p>

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

    <form method="post" action="register.php" novalidate>
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input id="username" name="username" class="form-control" value="<?= e($username ?? '') ?>" required>
      </div>
      
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" name="email" type="email" class="form-control" value="<?= e($email ?? '') ?>" required>
      </div>
      
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" name="password" type="password" class="form-control" minlength="6" required>
      </div>
      
      <div class="d-grid mb-2">
        <button type="submit" class="btn btn-primary">Register</button>
      </div>
      
      <!-- Link to login page for existing users -->
      <p class="mb-0 text-secondary">Already have an account? <a href="login.php">Login</a></p>
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
  <title>Register | FinTrack</title>
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
        <a href="login.php" class="btn btn-outline-primary btn-sm">Login</a>
        <a href="../contact.php" class="btn btn-outline-secondary btn-sm">Contact</a>
      </div>
    </div>
  </nav>

  <main class="container py-5 auth-container">
    <div class="auth-card mx-auto">
      <h1 class="h3 mb-2">Create Account</h1>
      <p class="text-secondary mb-4">Register to start tracking expenses with FinTrack.</p>

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

    <form method="post" action="register.php" novalidate>
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input id="username" name="username" class="form-control" value="<?= e($username ?? '') ?>" required>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" name="email" type="email" class="form-control" value="<?= e($email ?? '') ?>" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" name="password" type="password" class="form-control" minlength="6" required>
      </div>
      <div class="d-grid mb-2">
        <button type="submit" class="btn btn-primary">Register</button>
      </div>
      <p class="mb-0 text-secondary">Already have an account? <a href="login.php">Login</a></p>
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
