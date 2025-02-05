'use strict';

const Joi = require('joi');

module.exports = {
    method: 'post',
    path: '/movies',
    options: {
        auth: {
            scope: ['admin']
        },
        tags: ['api'],
        validate: {
            payload: Joi.object({
                title: Joi.string().required().min(1).max(255),
                description: Joi.string().required(),
                releaseDate: Joi.date().required(),
                director: Joi.string().required().min(1).max(255)
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.create(request.payload, request.auth.credentials);
    }
};

module.exports = [{
    method: 'post',
    path: '/movies',
    options: {
        auth: {
            scope: ['admin']
        },
        tags: ['api'],
        validate: {
            payload: Joi.object({
                title: Joi.string().required().min(1).max(255),
                description: Joi.string().required(),
                releaseDate: Joi.date().required(),
                director: Joi.string().required().min(1).max(255)
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.create(request.payload, request.auth.credentials);
    }
}, {
    method: 'put',
    path: '/movies/{id}',
    options: {
        auth: {
            scope: ['admin']
        },
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            }),
            payload: Joi.object({
                title: Joi.string().min(1).max(255),
                description: Joi.string(),
                releaseDate: Joi.date(),
                director: Joi.string().min(1).max(255)
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.update(request.params.id, request.payload, request.auth.credentials);
    }
}, {
    method: 'delete',
    path: '/movies/{id}',
    options: {
        auth: {
            scope: ['admin']
        },
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.delete(request.params.id, request.auth.credentials);
    }
}, {
    method: 'post',
    path: '/movies/{id}/favorites',
    options: {
        auth: {
            scope: ['user']
        },
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.addToFavorites(request.params.id, request.auth.credentials.id);
    }
}, {
    method: 'delete',
    path: '/movies/{id}/favorites',
    options: {
        auth: {
            scope: ['user']
        },
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required()
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.removeFromFavorites(request.params.id, request.auth.credentials.id);
    }
}, {
    method: 'get',
    path: '/movies/favorites',
    options: {
        auth: {
            scope: ['user']
        },
        tags: ['api']
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.getFavorites(request.auth.credentials.id);
    }
}, {
    method: 'get',
    path: '/movies/export',
    options: {
        auth: {
            scope: ['admin']
        },
        tags: ['api']
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.exportMoviesToCsv(request.auth.credentials);
    }
}];
