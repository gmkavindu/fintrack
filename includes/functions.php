<?php
// Shared helpers used across PHP pages.

declare(strict_types=1);

// Start session once so auth helpers can use $_SESSION.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function clean_input(string $value): string
{
    return trim(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function redirect_to(string $path): void
{
    header("Location: {$path}");
    exit;
}

function is_logged_in(): bool
{
    return isset($_SESSION['user_id']);
}

function require_login(): void
{
    if (!is_logged_in()) {
        redirect_to('/fintrack/auth/login.php');
    }
}
