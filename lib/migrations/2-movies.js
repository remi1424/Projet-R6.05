'use strict';

exports.up = async (knex) => {
    await knex.schema.createTable('movies', (table) => {
        table.increments('id').primary();
        table.string('title').notNull();
        table.text('description').notNull();
        table.date('releaseDate').notNull();
        table.string('director').notNull();
        table.datetime('createdAt').notNull();
        table.datetime('updatedAt').notNull();
    });

    await knex.schema.createTable('user_favorite_movies', (table) => {
        table.increments('id').primary();
        table.integer('userId').unsigned().references('user.id').onDelete('CASCADE');
        table.integer('movieId').unsigned().references('movies.id').onDelete('CASCADE');
        table.unique(['userId', 'movieId']);
        table.datetime('createdAt').notNull();
    });
};

exports.down = async (knex) => {
    await knex.schema.dropTable('user_favorite_movies');
    await knex.schema.dropTable('movies');
};
