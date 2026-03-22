<?php
// Shared app data endpoint for categories, expenses, and budgets.

declare(strict_types=1);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function current_user_exists(PDO $pdo, int $userId): bool
{
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $userId]);
    return (bool)$stmt->fetch();
}

function load_categories(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare('SELECT id, name, description FROM categories WHERE user_id = :user_id ORDER BY id ASC');
    $stmt->execute(['user_id' => $userId]);

    return array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'],
            'name' => (string)$row['name'],
            'description' => (string)($row['description'] ?? ''),
        ];
    }, $stmt->fetchAll() ?: []);
}

function load_expenses(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare('SELECT id, title, amount, category, expense_date, note FROM expenses WHERE user_id = :user_id ORDER BY id ASC');
    $stmt->execute(['user_id' => $userId]);

    // Keep frontend field names stable.
    return array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'],
            'title' => (string)$row['title'],
            'amount' => (float)$row['amount'],
            'category' => (string)$row['category'],
            'date' => (string)$row['expense_date'],
            'note' => (string)($row['note'] ?? ''),
        ];
    }, $stmt->fetchAll() ?: []);
}

function load_budgets(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare('SELECT id, category, limit_amount, period FROM budgets WHERE user_id = :user_id ORDER BY id ASC');
    $stmt->execute(['user_id' => $userId]);

    // Keep frontend field names stable.
    return array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'],
            'category' => (string)$row['category'],
            'limit' => (float)$row['limit_amount'],
            'period' => (string)$row['period'],
        ];
    }, $stmt->fetchAll() ?: []);
}

function save_categories(PDO $pdo, int $userId, array $items): void
{
    $pdo->prepare('DELETE FROM categories WHERE user_id = :user_id')->execute(['user_id' => $userId]);

    $insert = $pdo->prepare('INSERT INTO categories (user_id, name, description) VALUES (:user_id, :name, :description)');

    foreach ($items as $item) {
        $insert->execute([
            'user_id' => $userId,
            'name' => (string)($item['name'] ?? ''),
            'description' => (string)($item['description'] ?? ''),
        ]);
    }
}

function save_expenses(PDO $pdo, int $userId, array $items): void
{
    $pdo->prepare('DELETE FROM expenses WHERE user_id = :user_id')->execute(['user_id' => $userId]);

    $insert = $pdo->prepare('INSERT INTO expenses (user_id, title, amount, category, expense_date, note) VALUES (:user_id, :title, :amount, :category, :expense_date, :note)');

    foreach ($items as $item) {
        $insert->execute([
            'user_id' => $userId,
            'title' => (string)($item['title'] ?? ''),
            'amount' => (float)($item['amount'] ?? 0),
            'category' => (string)($item['category'] ?? 'General'),
            'expense_date' => (string)($item['date'] ?? date('Y-m-d')),
            'note' => (string)($item['note'] ?? ''),
        ]);
    }
}

function save_budgets(PDO $pdo, int $userId, array $items): void
{
    $pdo->prepare('DELETE FROM budgets WHERE user_id = :user_id')->execute(['user_id' => $userId]);

    $insert = $pdo->prepare('INSERT INTO budgets (user_id, category, limit_amount, period) VALUES (:user_id, :category, :limit_amount, :period)');

    foreach ($items as $item) {
        $insert->execute([
            'user_id' => $userId,
            'category' => (string)($item['category'] ?? 'General'),
            'limit_amount' => (float)($item['limit'] ?? 0),
            'period' => (string)($item['period'] ?? 'Monthly'),
        ]);
    }
}

// --- Main flow ---

if (!is_logged_in()) {
    respond(['success' => false, 'message' => 'Unauthorized'], 401);
}

$userId = (int)$_SESSION['user_id'];

if (!current_user_exists($pdo, $userId)) {
    // Session is stale; clear it and ask user to log in again.
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    respond(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        respond([
            'success' => true,
            'data' => [
                'categories' => load_categories($pdo, $userId),
                'expenses' => load_expenses($pdo, $userId),
                'budgets' => load_budgets($pdo, $userId),
            ],
        ]);
    } catch (Throwable $e) {
        respond(['success' => false, 'message' => 'Failed to load app data.'], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input') ?: '{}', true);
    $key = $payload['key'] ?? '';
    $value = $payload['value'] ?? [];

    if (!is_array($value)) {
        respond(['success' => false, 'message' => 'Invalid payload'], 400);
    }

    try {
        // Save as one transaction so partial updates do not slip through.
        $pdo->beginTransaction();

        if ($key === 'categories') {
            save_categories($pdo, $userId, $value);
        } elseif ($key === 'expenses') {
            save_expenses($pdo, $userId, $value);
        } elseif ($key === 'budgets') {
            save_budgets($pdo, $userId, $value);
        } else {
            $pdo->rollBack();
            respond(['success' => false, 'message' => 'Invalid payload key'], 400);
        }

        $pdo->commit();
        respond(['success' => true]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        respond(['success' => false, 'message' => 'Failed to save app data.'], 500);
    }
}

respond(['success' => false, 'message' => 'Method not allowed'], 405);
