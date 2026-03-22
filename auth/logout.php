<?php
/**
 * LOGOUT PAGE (auth/logout.php)
 * 
 * Purpose: Safely log out the user and destroy their session
 * 
 * Features:
 * - Clears all session data
 * - Deletes session cookie from browser
 * - Destroys server-side session
 * - Redirects to login page
 * 
 * When this page loads, the user is automatically logged out
 */

declare(strict_types=1);

// Load helper functions
require_once __DIR__ . '/../includes/functions.php';

// STEP 1: Clear the $_SESSION superglobal array
// This removes all session variables (user_id, username, etc.)
$_SESSION = [];

// STEP 2: Delete session cookie from browser
// This removes the session identifier cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    // Set cookie with expiration in the past (deletes it)
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}

// STEP 3: Destroy server-side session
// This removes session data from server storage
session_destroy();

// STEP 4: Redirect user to login page
redirect_to('/fintrack/auth/login.php');
