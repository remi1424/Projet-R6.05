'use strict';

const Joi = require('joi')

module.exports = [
    {
        method: 'post',
        path: '/user',
        options: {
            auth: false,
            tags:['api'],
            validate: {
            payload: Joi.object({
                firstName: Joi.string().required().min(3).example('John').description('Firstname of the user'),
                lastName: Joi.string().required().min(3).example('Doe').description('Lastname of the user'),
                email: Joi.string().required().email().example('john@doe.fr').description('Email of the user'),
                password: Joi.string().required().min(8).example('password').description('Password of the user'),
                username: Joi.string().required().min(3).example('johndoe').description('Username of the user'),
                roles: Joi.array().items(Joi.string()).default(['user']).description('User roles')
            })
        }
    },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.create(request.payload);
        }
    },
    {
        method: 'get',
        path: '/users',
        options: {
            auth: {
                scope: ['admin']
            },
            tags:['api']
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.findAll();
        }
    },
    {
        method: 'delete',
        path: '/user/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags:['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.delete(request.params.id);
        }
    },
    {
        method: 'patch',
        path: '/user/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags:['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                }),
                payload: Joi.object({
                    firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
                    lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
                    email: Joi.string().email().example('john@doe.fr').description('Email of the user'),
                    password: Joi.string().min(8).example('password').description('Password of the user'),
                    username: Joi.string().min(3).example('johndoe').description('Username of the user')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.update(request.params.id, request.payload);
        }
    },
    {
        method: 'post',
        path: '/user/login',
        options: {
            auth: false,
            tags:['api'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required().email().example('john@doe.fr').description('Email of the user'),
                    password: Joi.string().required().example('password').description('Password of the user')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.login(request.payload.email, request.payload.password);
        }
    },
    {
        method: 'get',
        path: '/user/status',
        options: {
            auth: {
                scope: ['admin', 'user']
            },
            tags: ['api'],
            description: 'Get current user status and roles'
        },
        handler: async (request, h) => {
            const credentials = request.auth.credentials;
            return {
                isAuthenticated: true,
                user: {
                    firstName: credentials.firstName,
                    lastName: credentials.lastName,
                    email: credentials.email,
                    roles: credentials.scope
                }
            };
        }
    }
];
