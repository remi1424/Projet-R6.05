'use strict';

exports.up = async (knex) => {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('firstName').notNull();
        table.string('lastName').notNull();
        table.string('email').notNull().unique();
        table.string('password').notNull();
        table.string('username').notNull().unique();
        table.json('roles').notNull();
        table.datetime('createdAt').notNull();
        table.datetime('updatedAt').notNull();
    });
};

exports.down = async (knex) => {
    await knex.schema.dropTable('users');
};
