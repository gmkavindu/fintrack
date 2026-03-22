<?php
/**
 * API ENDPOINT (api/app_data.php)
 * 
 * Purpose: Central backend API for all data operations (categories, expenses, budgets)
 * 
 * How it works:
 * - Frontend JavaScript files request data from this endpoint
 * - GET request: Fetch all categories, expenses, budgets for logged-in user
 * - POST request: Save updated categories, expenses, or budgets to database
 * 
 * Security:
 * - Only logged-in users can access (checks session)
 * - All data filtered by user_id (users can only access their own data)
 * - Uses prepared statements (preventing SQL injection)
 * - Returns JSON responses
 * 
 * Used by: dashboard.php, expenses.php, categories.php, budget.php, js/common.js
 */

declare(strict_types=1);

// Load helper functions and database connection
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/db.php';

// Set response type to JSON (tells browser what kind of data we're sending)
header('Content-Type: application/json; charset=utf-8');

/**
 * FUNCTION: respond()
 * Helper function to send JSON responses
 * 
 * @param array $payload - Data to send as JSON
 * @param int $status - HTTP status code (200=OK, 401=Unauthorized, 500=Error)
 * @return void
 */
function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

/**
 * FUNCTION: current_user_exists()
 * Check if user exists in database (validate session is still valid)
 * 
 * @param PDO $pdo - Database connection
 * @param int $userId - User ID to check
 * @return bool - true if user exists, false otherwise
 */
function current_user_exists(PDO $pdo, int $userId): bool
{
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $userId]);
    return (bool)$stmt->fetch();
}

/**
 * FUNCTION: load_categories()
 * Fetch all categories for current user from database
 * 
 * @param PDO $pdo - Database connection
 * @param int $userId - Current user ID (filters data)
 * @return array - Array of categories with id, name, description
 */
function load_categories(PDO $pdo, int $userId): array
{
    // Query: Get all categories owned by this user
    $stmt = $pdo->prepare('SELECT id, name, description FROM categories WHERE user_id = :user_id ORDER BY id ASC');
    $stmt->execute(['user_id' => $userId]);

    // Transform rows into clean array format
    return array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'],                            // Category ID
            'name' => (string)$row['name'],                     // Category name (e.g., "Food", "Transport")
            'description' => (string)($row['description'] ?? ''),  // Optional description
        ];
    }, $stmt->fetchAll() ?: []);
}

/**
 * FUNCTION: load_expenses()
 * Fetch all expenses for current user from database
 * 
 * @param PDO $pdo - Database connection
 * @param int $userId - Current user ID (filters data)
 * @return array - Array of expenses with id, title, amount, category, date, note
 */
function load_expenses(PDO $pdo, int $userId): array
{
    // Query: Get all expenses owned by this user
    $stmt = $pdo->prepare('SELECT id, title, amount, category, expense_date, note FROM expenses WHERE user_id = :user_id ORDER BY id ASC');
    $stmt->execute(['user_id' => $userId]);

    // Transform rows into clean array format (rename expense_date to date)
    return array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'],                           // Expense ID
            'title' => (string)$row['title'],                  // Expense name (e.g., "Coffee purchase")
            'amount' => (float)$row['amount'],                 // Amount spent
            'category' => (string)$row['category'],            // Category (e.g., "Food")
            'date' => (string)$row['expense_date'],            // Date of expense (YYYY-MM-DD)
            'note' => (string)($row['note'] ?? ''),            // Optional notes
        ];
    }, $stmt->fetchAll() ?: []);
}

/**
 * FUNCTION: load_budgets()
 * Fetch all budgets for current user from database
 * 
 * @param PDO $pdo - Database connection
 * @param int $userId - Current user ID (filters data)
 * @return array - Array of budgets with id, category, limit (renamed from limit_amount), period
 */
function load_budgets(PDO $pdo, int $userId): array
{
    // Query: Get all budgets owned by this user
    $stmt = $pdo->prepare('SELECT id, category, limit_amount, period FROM budgets WHERE user_id = :user_id ORDER BY id ASC');
    $stmt->execute(['user_id' => $userId]);

    // Transform rows into clean array format (rename limit_amount to limit)
    return array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'],                        // Budget ID
            'category' => (string)$row['category'],         // Category (e.g., "Food", "Transport")
            'limit' => (float)$row['limit_amount'],         // Spending limit amount
            'period' => (string)$row['period'],             // Period (e.g., "Monthly", "Weekly")
        ];
    }, $stmt->fetchAll() ?: []);
}

/**
 * FUNCTION: save_categories()
 * Save/update all categories for current user
 * Strategy: Delete all old categories, insert new ones
 * 
 * @param PDO $pdo - Database connection
 * @param int $userId - User ID (to delete their categories)
 * @param array $items - New categories array to save
 * @return void
 */
function save_categories(PDO $pdo, int $userId, array $items): void
{
    // Delete all old categories for this user
    $pdo->prepare('DELETE FROM categories WHERE user_id = :user_id')->execute(['user_id' => $userId]);
    
    // Prepare INSERT statement
    $insert = $pdo->prepare('INSERT INTO categories (user_id, name, description) VALUES (:user_id, :name, :description)');

    // Loop through and insert each category
    foreach ($items as $item) {
        $insert->execute([
            'user_id' => $userId,
            'name' => (string)($item['name'] ?? ''),
            'description' => (string)($item['description'] ?? ''),
        ]);
    }
}

/**
 * FUNCTION: save_expenses()
 * Save/update all expenses for current user
 * Strategy: Delete all old expenses, insert new ones
 * 
 * @param PDO $pdo - Database connection
 * @param int $userId - User ID (to delete their expenses)
 * @param array $items - New expenses array to save
 * @return void
 */
function save_expenses(PDO $pdo, int $userId, array $items): void
{
    // Delete all old expenses for this user
    $pdo->prepare('DELETE FROM expenses WHERE user_id = :user_id')->execute(['user_id' => $userId]);
    
    // Prepare INSERT statement
    $insert = $pdo->prepare('INSERT INTO expenses (user_id, title, amount, category, expense_date, note) VALUES (:user_id, :title, :amount, :category, :expense_date, :note)');

    // Loop through and insert each expense
    foreach ($items as $item) {
        $insert->execute([
            'user_id' => $userId,
            'title' => (string)($item['title'] ?? ''),
            'amount' => (float)($item['amount'] ?? 0),
            'category' => (string)($item['category'] ?? 'General'),
            'expense_date' => (string)($item['date'] ?? date('Y-m-d')),  // Rename 'date' to 'expense_date'
            'note' => (string)($item['note'] ?? ''),
        ]);
    }
}

/**
 * FUNCTION: save_budgets()
 * Save/update all budgets for current user
 * Strategy: Delete all old budgets, insert new ones
 * 
 * @param PDO $pdo - Database connection
 * @param int $userId - User ID (to delete their budgets)
 * @param array $items - New budgets array to save
 * @return void
 */
function save_budgets(PDO $pdo, int $userId, array $items): void
{
    // Delete all old budgets for this user
    $pdo->prepare('DELETE FROM budgets WHERE user_id = :user_id')->execute(['user_id' => $userId]);
    
    // Prepare INSERT statement
    $insert = $pdo->prepare('INSERT INTO budgets (user_id, category, limit_amount, period) VALUES (:user_id, :category, :limit_amount, :period)');

    // Loop through and insert each budget
    foreach ($items as $item) {
        $insert->execute([
            'user_id' => $userId,
            'category' => (string)($item['category'] ?? 'General'),
            'limit_amount' => (float)($item['limit'] ?? 0),          // Rename 'limit' to 'limit_amount'
            'period' => (string)($item['period'] ?? 'Monthly'),
        ]);
    }
}

// ==================== MAIN LOGIC ====================

// SECURITY CHECK 1: Verify user is logged in
if (!is_logged_in()) {
    respond(['success' => false, 'message' => 'Unauthorized'], 401);
}

// Get the current user ID from session
$userId = (int)$_SESSION['user_id'];

// SECURITY CHECK 2: Verify user still exists in database (session might be stale)
if (!current_user_exists($pdo, $userId)) {
    // Session is invalid - log user out and return error
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    respond(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
}

// ==================== HANDLE GET REQUEST ====================
// GET request: Fetch all user data
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Load all data and return as JSON
        respond([
            'success' => true,
            'data' => [
                'categories' => load_categories($pdo, $userId),   // User's categories
                'expenses' => load_expenses($pdo, $userId),       // User's expenses
                'budgets' => load_budgets($pdo, $userId),         // User's budgets
            ],
        ]);
    } catch (Throwable $e) {
        // If database query fails, return error
        respond(['success' => false, 'message' => 'Failed to load app data.'], 500);
    }
}

// ==================== HANDLE POST REQUEST ====================
// POST request: Save/update user data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request body
    $payload = json_decode(file_get_contents('php://input') ?: '{}', true);
    $key = $payload['key'] ?? '';           // Type: 'categories', 'expenses', or 'budgets'
    $value = $payload['value'] ?? [];       // Data array to save

    // Validate that value is an array
    if (!is_array($value)) {
        respond(['success' => false, 'message' => 'Invalid payload'], 400);
    }

    try {
        // Start database transaction (all-or-nothing operation)
        $pdo->beginTransaction();

        // Route to appropriate save function based on key
        if ($key === 'categories') {
            save_categories($pdo, $userId, $value);
        } elseif ($key === 'expenses') {
            save_expenses($pdo, $userId, $value);
        } elseif ($key === 'budgets') {
            save_budgets($pdo, $userId, $value);
        } else {
            // Invalid key - rollback and return error
            $pdo->rollBack();
            respond(['success' => false, 'message' => 'Invalid payload key'], 400);
        }

        // Commit transaction (save changes)
        $pdo->commit();
        respond(['success' => true]);
    } catch (Throwable $e) {
        // If error occurs, rollback transaction to avoid partial saves
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        respond(['success' => false, 'message' => 'Failed to save app data.'], 500);
    }
}

// ==================== HANDLE INVALID REQUESTS ====================
// If request is neither GET nor POST, return error
respond(['success' => false, 'message' => 'Method not allowed'], 405);
