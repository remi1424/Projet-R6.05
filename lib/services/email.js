'use strict';

const nodemailer = require('nodemailer');
const { Service } = require('@hapipal/schmervice');

module.exports = class EmailService extends Service {

    constructor() {
        super();
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            // Créer un compte de test Ethereal
            const testAccount = await nodemailer.createTestAccount();
            console.log('Ethereal Email account created:', testAccount);

            // Créer un transporteur avec les identifiants générés
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });

            console.log('Email transporter initialized successfully');
        } catch (error) {
            console.error('Failed to initialize email transporter:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(user) {
        try {
            const mailOptions = {
                from: '"Movie App" <noreply@movieapp.com>',
                to: user.email,
                subject: 'Welcome to Movie App!',
                html: `
                    <h1>Welcome ${user.firstName}!</h1>
                    <p>Thank you for joining Movie App. We're excited to have you on board!</p>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent:', info.messageId);
            
            // Obtenir l'URL de prévisualisation
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('Preview URL:', previewUrl);

            return {
                ...info,
                previewUrl
            };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw error;
        }
    }

    async sendNewMovieNotification(users, movie) {
        for (const user of users) {
            const mailOptions = {
                from: '"Movie App" <noreply@movieapp.com>',
                to: user.email,
                subject: 'New Movie Added!',
                html: `
                    <h1>New Movie: ${movie.title}</h1>
                    <p>A new movie has been added to our collection:</p>
                    <ul>
                        <li>Title: ${movie.title}</li>
                        <li>Director: ${movie.director}</li>
                        <li>Release Date: ${movie.releaseDate}</li>
                    </ul>
                `
            };

            await this.transporter.sendMail(mailOptions);
        }
    }

    async sendMovieUpdateNotification(users, movie) {
        for (const user of users) {
            const mailOptions = {
                from: '"Movie App" <noreply@movieapp.com>',
                to: user.email,
                subject: 'Movie Update Notification',
                html: `
                    <h1>Movie Update: ${movie.title}</h1>
                    <p>A movie in your favorites has been updated:</p>
                    <ul>
                        <li>Title: ${movie.title}</li>
                        <li>Director: ${movie.director}</li>
                        <li>Release Date: ${movie.releaseDate}</li>
                    </ul>
                `
            };

            await this.transporter.sendMail(mailOptions);
        }
    }

    async sendMovieExportEmail(user, csvBuffer) {
        const mailOptions = {
            from: '"Movie App" <noreply@movieapp.com>',
            to: user.email,
            subject: 'Movie Export',
            text: 'Please find attached the CSV export of all movies.',
            attachments: [{
                filename: 'movies_export.csv',
                content: csvBuffer
            }]
        };

        return this.transporter.sendMail(mailOptions);
    }
};
