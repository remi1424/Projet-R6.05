'use strict';

const Joi = require('joi');

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
                title: Joi.string().required().min(1).max(255).example('The Matrix').description('Title of the movie'),
                description: Joi.string().required().example('A computer programmer discovers...').description('Description of the movie'),
                releaseDate: Joi.date().required().example('1999-03-31').description('Release date of the movie'),
                director: Joi.string().required().min(1).max(255).example('Lana Wachowski').description('Director of the movie')
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        return await movieService.create(request.payload, request.auth.credentials);
    }
}, {
    method: 'get',
    path: '/movies',
    options: {
        auth: {
            scope: ['admin', 'user']
        },
        tags: ['api']
    },
    handler: async (request, h) => {
        const { Movie } = request.models();
        return await Movie.query();
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
                id: Joi.number().integer().required().min(1)
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
                id: Joi.number().integer().required().min(1)
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
            scope: ['admin', 'user']
        },
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required().min(1)
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        const userId = request.auth.credentials.id;
        return await movieService.addToFavorites(request.params.id, userId);
    }
}, {
    method: 'delete',
    path: '/movies/{id}/favorites',
    options: {
        auth: {
            scope: ['admin', 'user']
        },
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().required().min(1)
            })
        }
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        const userId = request.auth.credentials.id;
        return await movieService.removeFromFavorites(request.params.id, userId);
    }
}, {
    method: 'get',
    path: '/movies/favorites',
    options: {
        auth: {
            scope: ['admin', 'user']
        },
        tags: ['api']
    },
    handler: async (request, h) => {
        const { movieService } = request.services();
        const userId = request.auth.credentials.id;
        return await movieService.getFavorites(userId);
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
        const csv = await movieService.exportMoviesToCsv(request.auth.credentials);
        
        return h.response(csv)
            .type('text/csv')
            .header('Content-Disposition', 'attachment; filename=movies.csv');
    }
}];
