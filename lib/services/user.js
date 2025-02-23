'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');

module.exports = class UserService extends Service {

    async create(user) {
        try {
            const { User } = this.server.models();
            
            // Vérifier si l'email existe déjà
            const existingUser = await User.query().findOne({ email: user.email });
            if (existingUser) {
                throw Boom.conflict('Email already exists');
            }

            // Vérifier si le username existe déjà
            const existingUsername = await User.query().findOne({ username: user.username });
            if (existingUsername) {
                throw Boom.conflict('Username already exists');
            }

            // S'assurer que roles est un tableau
            if (!user.roles) {
                user.roles = ['user'];
            }

            const newUser = await User.query().insertAndFetch(user);
            
            // Gérer l'envoi d'email s'il existe
            if (this.server.services().emailService) {
                try {
                    await this.server.services().emailService.sendWelcomeEmail(newUser);
                } catch (emailError) {
                    console.error('Error sending welcome email:', emailError);
                    // Continue même si l'email échoue
                }
            }
            
            return newUser;
        } catch (error) {
            console.error('Error in create user:', error);
            if (error.isBoom) {
                throw error;
            }
            throw Boom.internal('Failed to create user: ' + error.message);
        }
    }

    findAll() {
        const { User } = this.server.models();
        return User.query();
    }

    delete(id) {
        const { User } = this.server.models();
        return User.query().deleteById(id);
    }

    update(id, user) {
        const { User } = this.server.models();
        return User.query().findById(id).patch(user);
    }

    async login(email, password) {

        const { User } = this.server.models();

        const user = await User.query()
            .where({ email, password })
            .first();

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
                key: 'random_string', 
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400 // 4 hours
            }
        );

        return {
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        };
    }
};
