'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');

module.exports = class UserService extends Service {

    async create(user) {
        try {
            const { User } = this.server.models();
            const { emailService } = this.server.services();

            // S'assurer que admin est un booléen
            const userData = {
                ...user,
                admin: Boolean(user.admin)
            };

            const newUser = await User.query().insertAndFetch(userData);
            
            await emailService.sendWelcomeEmail(newUser);
            
            return newUser;
        } catch (error) {
            console.error('Error in create user:', error);
            throw error;
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

        // S'assurer que admin est un booléen
        const isAdmin = Boolean(user.admin);
        
        console.log('User from database:', { ...user, admin: isAdmin }); // Debug log

        const scope = isAdmin ? ['admin'] : ['user'];

        const tokenPayload = {
            aud: 'urn:audience:iut',
            iss: 'urn:issuer:iut',
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            scope: scope,
            admin: isAdmin
        };

        console.log('Token payload:', tokenPayload); // Debug log

        const token = Jwt.token.generate(
            tokenPayload,
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
                email: user.email,
                admin: isAdmin
            }
        };
    }
};
