<?php
echo json_encode([
    'status' => 'working',
    'message' => 'PHP is working!',
    'server' => $_SERVER['SERVER_SOFTWARE'],
    'php_version' => phpversion()
]);
?>
