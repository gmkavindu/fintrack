# FinTrack (PHP + MySQL)

FinTrack is a personal expense tracker built with PHP, MySQL, Bootstrap, and vanilla JavaScript.

## Features

- User registration, login, and logout (session-based auth)
- Expense CRUD with search, filter, and sorting
- Category and budget management
- Budget-exceeded notifications
- Dashboard and reports
- Contact form message storage
- Light/Dark mode

## Tech Stack

- PHP 8+
- MySQL / MariaDB
- Bootstrap 5
- JavaScript (no framework)
- XAMPP

## Database Model (Strict Phase 03)

This project now uses only these MySQL tables:

- `users` (`id`, `username`, `email`, `password`, `created_at`)
- `messages` (`id`, `name`, `email`, `message`, `created_at`)
- `categories` (`id`, `user_id`, `name`, `description`, `created_at`)
- `budgets` (`id`, `user_id`, `category`, `limit_amount`, `period`, `created_at`)
- `expenses` (`id`, `user_id`, `title`, `amount`, `category`, `expense_date`, `note`, `created_at`)

Removed:

- `user_data` table and all related usage in code.

## Quick Setup (Viva Ready)

1. Place the project in:
   - `xampp\htdocs\fintrack`
2. Start services in XAMPP:
   - `Apache`
   - `MySQL`
3. Open phpMyAdmin:
   - `http://localhost/phpmyadmin`
4. Create a new database named:
   - `fintrack`
5. Import:
   - `database.sql`
6. Open in browser:
   - `http://localhost/fintrack/index.php`

## Important URLs

- Home: `http://localhost/fintrack/index.php`
- Register: `http://localhost/fintrack/auth/register.php`
- Login: `http://localhost/fintrack/auth/login.php`
- Dashboard: `http://localhost/fintrack/dashboard.php`
- Expenses: `http://localhost/fintrack/expenses.php`
- Budget: `http://localhost/fintrack/budget.php`
- Report: `http://localhost/fintrack/report.php`

## Troubleshooting

- If MySQL does not start on port `3306`:
  - Stop other MySQL services using the same port, or
  - Change XAMPP MySQL port and keep `includes/db.php` in sync.
- If login fails after DB import:
  - Verify database name is `fintrack`.
  - Recheck DB credentials in `includes/db.php`.

## Project Structure

```text
fintrack/
├── api/
├── auth/
├── css/
├── images/
├── includes/
├── js/
├── budget.php
├── categories.php
├── contact.php
├── dashboard.php
├── expenses.php
├── index.php
├── report.php
├── database.sql
└── README.md
```

