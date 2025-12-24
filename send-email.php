<?php
/**
 * Contact Form Email Handler - Hostinger SMTP
 * Sends emails using Hostinger's SMTP server
 */

// Set headers to allow CORS (adjust origins as needed for security)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Hostinger SMTP Configuration
$smtp_host = 'smtp.hostinger.com';
$smtp_port = 465;
$smtp_username = 'adeyemi@adediranadeyemi.com';
$smtp_password = 'ObaAdeyemi01$$';
$from_email = 'adeyemi@adediranadeyemi.com';
$from_name = 'Portfolio Contact Form';

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
}

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

if (empty($subject)) {
    $errors[] = 'Subject is required';
}

if (empty($message)) {
    $errors[] = 'Message is required';
}

// Return validation errors if any
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit();
}

// Sanitize inputs
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Create email body
$email_subject = 'New Contact Form: ' . $subject;
$email_body = "You have received a new message from your website contact form.\n\n";
$email_body .= "Name: $name\n";
$email_body .= "Email: $email\n";
$email_body .= "Subject: $subject\n\n";
$email_body .= "Message:\n$message\n";

// HTML email body
$html_body = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #106eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #333; }
        .value { color: #555; }
        hr { border: 1px solid #dee2e6; margin: 20px 0; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='margin: 0;'>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>Name:</span> <span class='value'>$name</span>
            </div>
            <div class='field'>
                <span class='label'>Email:</span> <span class='value'><a href='mailto:$email'>$email</a></span>
            </div>
            <div class='field'>
                <span class='label'>Subject:</span> <span class='value'>$subject</span>
            </div>
            <hr>
            <div class='field'>
                <span class='label'>Message:</span>
                <p style='white-space: pre-wrap;'>$message</p>
            </div>
        </div>
    </div>
</body>
</html>
";

// Email headers for HTML
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: $from_name <$from_email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// Try to send using SMTP socket connection
try {
    // Connect to SMTP server
    $socket = fsockopen('ssl://' . $smtp_host, $smtp_port, $errno, $errstr, 30);
    
    if (!$socket) {
        throw new Exception("Failed to connect to SMTP server: $errstr ($errno)");
    }
    
    // Set timeout
    stream_set_timeout($socket, 30);
    
    // Read welcome message
    $response = fgets($socket, 515);
    
    // Send EHLO
    fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $response = fgets($socket, 515);
    
    // AUTH LOGIN
    fputs($socket, "AUTH LOGIN\r\n");
    $response = fgets($socket, 515);
    
    // Send username (base64 encoded)
    fputs($socket, base64_encode($smtp_username) . "\r\n");
    $response = fgets($socket, 515);
    
    // Send password (base64 encoded)
    fputs($socket, base64_encode($smtp_password) . "\r\n");
    $response = fgets($socket, 515);
    
    if (strpos($response, '235') === false) {
        throw new Exception("SMTP Authentication failed");
    }
    
    // MAIL FROM
    fputs($socket, "MAIL FROM: <$from_email>\r\n");
    $response = fgets($socket, 515);
    
    // RCPT TO
    fputs($socket, "RCPT TO: <$from_email>\r\n");
    $response = fgets($socket, 515);
    
    // DATA
    fputs($socket, "DATA\r\n");
    $response = fgets($socket, 515);
    
    // Send headers and body
    fputs($socket, "To: $from_email\r\n");
    fputs($socket, "From: $from_name <$from_email>\r\n");
    fputs($socket, "Reply-To: $email\r\n");
    fputs($socket, "Subject: $email_subject\r\n");
    fputs($socket, $headers);
    fputs($socket, "\r\n");
    fputs($socket, $html_body);
    fputs($socket, "\r\n.\r\n");
    
    $response = fgets($socket, 515);
    
    // QUIT
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Your message has been sent successfully! I\'ll respond within 24 hours.'
    ]);
    
} catch (Exception $e) {
    // If socket method fails, try using mail() as fallback
    $mail_sent = mail($from_email, $email_subject, $html_body, $headers);
    
    if ($mail_sent) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Your message has been sent successfully! I\'ll respond within 24 hours.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send email. Please try again later or contact me directly at adeyemi@adediranadeyemi.com'
        ]);
    }
}
?>
