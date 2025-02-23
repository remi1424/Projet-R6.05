'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    async create(movie, credentials) {
        const { Movie, User } = this.server.models();

        try {
            // Vérifier si l'utilisateur a le rôle admin
            if (!credentials.scope || !credentials.scope.includes('admin')) {
                throw Boom.forbidden('Only admins can create movies');
            }

            console.log('Attempting to create movie:', movie);

            // Créer le film
            const newMovie = await Movie.query().insert({
                title: movie.title,
                description: movie.description,
                releaseDate: movie.releaseDate,
                director: movie.director
            });

            console.log('Movie created:', newMovie);

            // Envoyer les notifications en arrière-plan
            setImmediate(async () => {
                try {
                    const { emailService } = this.server.services();
                    if (emailService && typeof emailService.sendNewMovieNotification === 'function') {
                        const users = await User.query().where('roles', 'like', '%"user"%');
                        await emailService.sendNewMovieNotification(users, newMovie);
                        console.log('Notifications sent successfully');
                    }
                } catch (notifError) {
                    console.error('Failed to send notifications:', notifError);
                }
            });

            // Retourner les données du film
            return {
                id: newMovie.id,
                title: newMovie.title,
                description: newMovie.description,
                releaseDate: newMovie.releaseDate,
                director: newMovie.director,
                createdAt: newMovie.createdAt,
                updatedAt: newMovie.updatedAt
            };

        } catch (error) {
            console.error('Error in create movie:', error);
            throw Boom.internal('Failed to create movie: ' + error.message);
        }
    }

    async update(id, movieData, credentials) {
        const { Movie, User } = this.server.models();
        const { emailService } = this.server.services();

        if (!credentials.scope || !credentials.scope.includes('admin')) {
            throw Boom.forbidden('Only admins can update movies');
        }

        const movie = await Movie.query().findById(id);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        const updatedMovie = await Movie.query().patchAndFetchById(id, movieData);

        try {
            // Notify users who have this movie in their favorites
            const usersWithFavorite = await movie.$relatedQuery('favoriteByUsers');
            if (usersWithFavorite.length > 0 && emailService && emailService.sendMovieUpdateNotification) {
                await emailService.sendMovieUpdateNotification(usersWithFavorite, updatedMovie);
            }
        } catch (error) {
            // Continue even if email notification fails
            console.error('Failed to send update notifications:', error);
        }

        return updatedMovie;
    }

    async delete(id, credentials) {
        const { Movie } = this.server.models();

        if (!credentials.scope || !credentials.scope.includes('admin')) {
            throw Boom.forbidden('Only admins can delete movies');
        }

        const movie = await Movie.query().findById(id);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        await Movie.query().deleteById(id);
        return { success: true };
    }

    async addToFavorites(movieId, userId) {
        const { Movie, User } = this.server.models();

        // Vérifier si le film existe
        const movie = await Movie.query().findById(movieId);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        // Vérifier si l'utilisateur existe
        const user = await User.query().findById(userId);
        if (!user) {
            throw Boom.notFound('User not found');
        }

        // Vérifier si le film est déjà dans les favoris
        const existing = await Movie.query()
            .joinRelated('favoriteByUsers')
            .where('favoriteByUsers.id', userId)
            .where('movies.id', movieId)
            .first();

        if (existing) {
            throw Boom.conflict('Movie already in favorites');
        }

        // Ajouter aux favoris avec la date de création
        await movie.$relatedQuery('favoriteByUsers').relate({
            id: userId,
            createdAt: new Date()
        });

        return { success: true };
    }

    async removeFromFavorites(movieId, userId) {
        const { Movie } = this.server.models();

        // Vérifier si la relation existe
        const existing = await Movie.query()
            .joinRelated('favoriteByUsers')
            .where('favoriteByUsers.id', userId)
            .where('movies.id', movieId)
            .first();

        if (!existing) {
            throw Boom.notFound('Movie not in favorites');
        }

        // Supprimer des favoris
        await Movie.relatedQuery('favoriteByUsers')
            .for(movieId)
            .unrelate()
            .where('id', userId);

        return { success: true };
    }

    async getFavorites(userId) {
        const { Movie } = this.server.models();

        return await Movie.query()
            .joinRelated('favoriteByUsers')
            .where('favoriteByUsers.id', userId)
            .select('movies.*');
    }

    async exportMoviesToCsv(credentials) {
        const { Movie } = this.server.models();

        if (!credentials.scope || !credentials.scope.includes('admin')) {
            throw Boom.forbidden('Only admins can export movies');
        }

        const movies = await Movie.query();
        
        // Créer l'en-tête CSV
        const header = ['Title', 'Director', 'Release Date', 'Description'].join(',');
        
        // Créer les lignes de données
        const rows = movies.map(movie => {
            return [
                `"${movie.title.replace(/"/g, '""')}"`,
                `"${movie.director.replace(/"/g, '""')}"`,
                movie.releaseDate,
                `"${movie.description.replace(/"/g, '""')}"`
            ].join(',');
        });

        // Combiner l'en-tête et les données
        return [header, ...rows].join('\n');
    }
};
