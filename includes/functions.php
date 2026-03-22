<?php
/**
 * HELPER FUNCTIONS FILE (includes/functions.php)
 * 
 * Purpose: Common utility functions used across the entire application
 * 
 * Functions:
 * - clean_input()     : Sanitize user input to prevent XSS attacks
 * - e()              : Shorthand for escaping HTML (alias for clean_input)
 * - redirect_to()    : Redirect user to different page
 * - is_logged_in()   : Check if user is authenticated (session exists)
 * - require_login()  : Force user to login if not authenticated
 */

declare(strict_types=1);

// Start PHP session if not already started
// Sessions store user data across page visits (like "logged in user ID")
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * FUNCTION: clean_input()
 * 
 * Purpose: Sanitize user input to prevent XSS (Cross-Site Scripting) attacks
 * 
 * What it does:
 * 1. trim() - removes whitespace from beginning/end
 * 2. htmlspecialchars() - converts HTML special chars (&, <, >, ", ') to safe entities
 * 
 * Example:
 *   Input: "<script>alert('hack')</script>"
 *   Output: "&lt;script&gt;alert('hack')&lt;/script&gt;" (safe to display)
 * 
 * @param string $value - User input to clean
 * @return string - Sanitized value
 */
function clean_input(string $value): string
{
    return trim(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
}

/**
 * FUNCTION: e()
 * 
 * Purpose: Shorthand alias for clean_input()
 * Used in HTML templates as <?= e($variable) ?> for cleaner code
 * 
 * @param string $value - Value to escape
 * @return string - HTML-safe value
 */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/**
 * FUNCTION: redirect_to()
 * 
 * Purpose: Redirect user to another page
 * 
 * How it works:
 * 1. Sets HTTP "Location" header to redirect browser
 * 2. exit() stops further code execution
 * 
 * Example: redirect_to('/fintrack/dashboard.php')
 *   - User is sent to dashboard.php
 * 
 * @param string $path - Page to redirect to (e.g., '/fintrack/dashboard.php')
 * @return void
 */
function redirect_to(string $path): void
{
    header("Location: {$path}");
    exit;
}

/**
 * FUNCTION: is_logged_in()
 * 
 * Purpose: Check if a user is currently logged in
 * 
 * How it works:
 * - Sessions store user_id when user logs in
 * - This checks if that session variable exists
 * 
 * @return bool - true if logged in, false otherwise
 */
function is_logged_in(): bool
{
    return isset($_SESSION['user_id']);
}

/**
 * FUNCTION: require_login()
 * 
 * Purpose: Force user to login before accessing a page
 * 
 * How it works:
 * - Used at top of protected pages (dashboard, expenses, categories, etc.)
 * - If user not logged in: redirect to login page
 * - If user is logged in: allow page to load
 * 
 * Example: Place at top of dashboard.php
 *   <?php require_login(); ?>
 * 
 * @return void - Either allows page to continue or redirects to login
 */
function require_login(): void
{
    if (!is_logged_in()) {
        redirect_to('/fintrack/auth/login.php');
    }
}
