'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    async create(movie, admin) {
        const { Movie, User } = this.server.models;
        const { emailService } = this.server.services();

        if (!admin.admin) {
            throw Boom.forbidden('Only admins can create movies');
        }

        const newMovie = await Movie.query().insert(movie);

        // Notify all users about the new movie
        const users = await User.query();
        await emailService.sendNewMovieNotification(users, newMovie);

        return newMovie;
    }

    async update(id, movieData, admin) {
        const { Movie, User } = this.server.models;
        const { emailService } = this.server.services();

        if (!admin.admin) {
            throw Boom.forbidden('Only admins can update movies');
        }

        const movie = await Movie.query().findById(id);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        const updatedMovie = await Movie.query().patchAndFetchById(id, movieData);

        // Notify users who have this movie in their favorites
        const usersWithFavorite = await movie.$relatedQuery('favoriteByUsers');
        if (usersWithFavorite.length > 0) {
            await emailService.sendMovieUpdateNotification(usersWithFavorite, updatedMovie);
        }

        return updatedMovie;
    }

    async delete(id, admin) {
        const { Movie } = this.server.models;

        if (!admin.admin) {
            throw Boom.forbidden('Only admins can delete movies');
        }

        const movie = await Movie.query().findById(id);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        await Movie.query().deleteById(id);
        return { message: 'Movie deleted successfully' };
    }

    async addToFavorites(movieId, userId) {
        const { Movie, User } = this.server.models;

        const movie = await Movie.query().findById(movieId);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        const user = await User.query().findById(userId);
        if (!user) {
            throw Boom.notFound('User not found');
        }

        // Check if movie is already in favorites
        const existing = await user.$relatedQuery('favoriteMovies')
            .where('movies.id', movieId)
            .first();

        if (existing) {
            throw Boom.conflict('Movie is already in favorites');
        }

        await user.$relatedQuery('favoriteMovies').relate(movie);
        return { message: 'Movie added to favorites' };
    }

    async removeFromFavorites(movieId, userId) {
        const { Movie, User } = this.server.models;

        const user = await User.query().findById(userId);
        if (!user) {
            throw Boom.notFound('User not found');
        }

        const existing = await user.$relatedQuery('favoriteMovies')
            .where('movies.id', movieId)
            .first();

        if (!existing) {
            throw Boom.notFound('Movie is not in favorites');
        }

        await user.$relatedQuery('favoriteMovies').unrelate().where('movies.id', movieId);
        return { message: 'Movie removed from favorites' };
    }

    async getFavorites(userId) {
        const { User } = this.server.models;

        const user = await User.query().findById(userId);
        if (!user) {
            throw Boom.notFound('User not found');
        }

        return user.$relatedQuery('favoriteMovies');
    }

    async exportMoviesToCsv(admin) {
        const { Movie } = this.server.models;
        const { stringify } = require('csv-stringify/sync');
        const { emailService } = this.server.services();

        if (!admin.admin) {
            throw Boom.forbidden('Only admins can export movies');
        }

        const movies = await Movie.query();
        const csvData = stringify(movies, {
            header: true,
            columns: ['id', 'title', 'description', 'releaseDate', 'director', 'createdAt', 'updatedAt']
        });

        await emailService.sendMovieExportEmail(admin, Buffer.from(csvData));
        return { message: 'Movie export has been sent to your email' };
    }
};
