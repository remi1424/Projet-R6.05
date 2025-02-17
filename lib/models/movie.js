'use strict';

const { Model } = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class Movie extends Model {

    static get tableName() {
        return 'movies';
    }

    static get joiSchema() {
        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().required().min(1).max(255),
            description: Joi.string().required(),
            releaseDate: Joi.date().required(),
            director: Joi.string().required().min(1).max(255),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    $beforeUpdate(opt, queryContext) {
        this.updatedAt = new Date();
    }

    static get relationMappings() {
        const User = require('./user');

        return {
            favoriteByUsers: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'movies.id',
                    through: {
                        from: 'user_favorite_movies.movieId',
                        to: 'user_favorite_movies.userId'
                    },
                    to: 'user.id'
                }
            }
        };
    }
};
