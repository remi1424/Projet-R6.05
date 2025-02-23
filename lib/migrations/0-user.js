'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.createTable('user', (table) => {

            table.increments('id').primary();
            table.string('firstName').notNull();
            table.string('lastName').notNull();
            table.string('email').notNull().unique();
            table.string('password').notNull();
            table.string('username').notNull().unique();
            table.json('roles').notNull();

            table.dateTime('createdAt').notNull().defaultTo(knex.fn.now());
            table.dateTime('updatedAt').notNull().defaultTo(knex.fn.now());
        });

        await knex.raw(`
            ALTER TABLE user 
            ALTER roles SET DEFAULT (JSON_ARRAY('user'))
        `);
    },

    async down(knex) {

        await knex.schema.dropTableIfExists('user');
    }
};
