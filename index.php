<?php
require_once __DIR__ . '/includes/functions.php';

if (is_logged_in()) {
    redirect_to('dashboard.php');
}

redirect_to('auth/login.php');

