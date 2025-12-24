/**
 * Contact Form Email Handler - Node.js/Express
 * Sends emails using Nodemailer with Hostinger SMTP
 */

require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Hostinger SMTP configuration from environment variables
const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true' || true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'adeyemi@adediranadeyemi.com',
        pass: process.env.EMAIL_PASSWORD || 'ObaAdeyemi01$$'
    }
};

// Recipient email
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'adeyemi@adediranadeyemi.com';

// Validate configuration
if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    console.error('ERROR: Email credentials not configured!');
    console.error('Please create a .env file with EMAIL_USER and EMAIL_PASSWORD');
    process.exit(1);
}

// Create reusable transporter with Hostinger SMTP
const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth,
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('✗ Email configuration error:', error);
        console.error('Please check your SMTP settings');
    } else {
        console.log('✓ Server is ready to send emails');
        console.log(`✓ SMTP Host: ${EMAIL_CONFIG.host}:${EMAIL_CONFIG.port}`);
        console.log(`✓ Sending from: ${EMAIL_CONFIG.auth.user}`);
        console.log(`✓ Sending to: ${RECIPIENT_EMAIL}`);
    }
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Sanitize inputs
        const sanitizedName = name.trim();
        const sanitizedEmail = email.trim();
        const sanitizedSubject = subject.trim();
        const sanitizedMessage = message.trim();

        // Email options
        const mailOptions = {
            from: `"${sanitizedName}" <${EMAIL_CONFIG.auth.user}>`,
            to: RECIPIENT_EMAIL,
            replyTo: sanitizedEmail,
            subject: `New Contact Form: ${sanitizedSubject}`,
            text: `
You have received a new message from your website contact form.

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Subject: ${sanitizedSubject}

Message:
${sanitizedMessage}
            `,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #106eea; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
                        <h2 style="margin: 0;">New Contact Form Submission</h2>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px;">
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333;">Name:</strong> 
                            <span style="color: #555;">${sanitizedName}</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333;">Email:</strong> 
                            <a href="mailto:${sanitizedEmail}" style="color: #106eea;">${sanitizedEmail}</a>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333;">Subject:</strong> 
                            <span style="color: #555;">${sanitizedSubject}</span>
                        </div>
                        <hr style="border: 1px solid #dee2e6; margin: 20px 0;">
                        <div>
                            <strong style="color: #333;">Message:</strong>
                            <p style="white-space: pre-wrap; color: #555;">${sanitizedMessage}</p>
                        </div>
                    </div>
                </div>
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✓ Email sent successfully:', info.messageId);
        console.log(`  From: ${sanitizedName} (${sanitizedEmail})`);
        console.log(`  Subject: ${sanitizedSubject}`);
        console.log(`  Time: ${new Date().toISOString()}`);
        
        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully! I\'ll respond within 24 hours.'
        });

    } catch (error) {
        console.error('✗ Error sending email:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to send email. Please try again later or contact me directly at adeyemi@adediranadeyemi.com'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Email server is running',
        smtp: {
            host: EMAIL_CONFIG.host,
            port: EMAIL_CONFIG.port,
            secure: EMAIL_CONFIG.secure
        },
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Contact Form Email Server - Hostinger SMTP',
        endpoints: {
            health: '/health',
            sendEmail: '/send-email (POST)'
        },
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`✓ Email server running on port ${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
    console.log(`✓ SMTP Server: ${EMAIL_CONFIG.host}:${EMAIL_CONFIG.port}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(60));
});

module.exports = app;
