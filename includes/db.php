<?php
/**
 * DATABASE CONNECTION FILE (includes/db.php)
 * 
 * Purpose: Establish secure PDO connection to MySQL database
 * 
 * This file:
 * - Reads database credentials from environment variables (or uses defaults)
 * - Creates a PDO instance for safe database queries
 * - Enables prepared statements and error handling
 * - Returns a $pdo object available to all PHP files that require it
 * 
 * Security: Uses PDO prepared statements to prevent SQL injection attacks
 */

declare(strict_types=1);

// Read database configuration from environment variables
// If not set, use defaults (safe for XAMPP local development)
$host = getenv('DB_HOST') ?: '127.0.0.1';           // Database server address
$port = (int)(getenv('DB_PORT') ?: 3306);            // Database port (default: 3306)
$dbName = getenv('DB_NAME') ?: 'fintrack';           // Database name
$user = getenv('DB_USER') ?: 'root';                 // Database username
$pass = getenv('DB_PASS') ?: '';                     // Database password (empty for XAMPP)

// Build connection string (DSN = Data Source Name)
// Format: mysql:host=localhost;dbname=fintrack;charset=utf8mb4
$dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";

try {
    // Create PDO connection with security options
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,  // Throw exceptions on error
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,  // Return results as associative arrays
        PDO::ATTR_EMULATE_PREPARES => false,          // Use native prepared statements
    ]);
} catch (PDOException $e) {
    // If connection fails, show error and stop execution
    http_response_code(500);
    exit('Database connection failed: ' . $e->getMessage());
}
