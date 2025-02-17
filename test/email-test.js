'use strict';

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

async function testEmail() {
    // Create test account
    const testAccount = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    };

    // Create reusable transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    try {
        // Test welcome email
        const welcomeInfo = await transporter.sendMail({
            from: '"Movie App" <noreply@movieapp.com>',
            to: testAccount.user,
            subject: 'Test - Welcome Email',
            html: `
                <h1>Welcome to Movie App!</h1>
                <p>This is a test welcome email.</p>
            `
        });

        console.log('Welcome email sent successfully!');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(welcomeInfo));

        // Test new movie notification
        const movieInfo = await transporter.sendMail({
            from: '"Movie App" <noreply@movieapp.com>',
            to: testAccount.user,
            subject: 'Test - New Movie Added',
            html: `
                <h1>New Movie: Test Movie</h1>
                <p>A new movie has been added to our collection:</p>
                <ul>
                    <li>Title: Test Movie</li>
                    <li>Director: Test Director</li>
                    <li>Release Date: 2024-02-05</li>
                </ul>
            `
        });

        console.log('Movie notification email sent successfully!');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(movieInfo));

    } catch (error) {
        console.error('Error sending test emails:', error);
    }
}

// Run the test
testEmail().catch(console.error);
