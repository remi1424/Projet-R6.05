'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');
const nodemailer = require('nodemailer');

module.exports = class UserService extends Service {

    async create(user){
        try {
            const { User } = this.server.models();
            const { emailService } = this.server.services();

            // Créer l'utilisateur
            const newUser = await User.query().insertAndFetch(user);
            
            // Envoyer l'email de bienvenue
            const emailInfo = await emailService.sendWelcomeEmail(newUser);
            
            // Afficher l'URL de prévisualisation
            if (emailInfo.previewUrl) {
                console.log('Email preview URL:', emailInfo.previewUrl);
            }

            return newUser;
        } catch (error) {
            console.error('Error in create user:', error);
            throw Boom.boomify(error, { statusCode: 500, message: error.message });
        }
    }

    findAll(){

        const { User } = this.server.models();

        return User.query();
    }

    delete(id){

        const { User } = this.server.models();

        return User.query().deleteById(id);
    }

    update(id, user){

        const { User } = this.server.models();

        return User.query().findById(id).patch(user);
    }

    async login(email, password) {

        const { User } = this.server.models();

        const user = await User.query().findOne({ email, password });

        if (!user) {
            throw Boom.unauthorized('Invalid credentials');
        }

        const token = Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                scope: user.roles
            },
            {
                key: 'random_string', // La clé qui est définit dans lib/auth/strategies/jwt.js
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400 // 4 hours
            }
        );

        return token;
    }
}
