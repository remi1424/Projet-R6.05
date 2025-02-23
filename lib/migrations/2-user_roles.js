exports.up = async function(knex) {
    const hasRolesColumn = await knex.schema.hasColumn('user', 'roles');

    return knex.schema.table('user', function(table) {
        if (!hasRolesColumn) {
            table.json('roles').notNullable();
        }
    });
};

exports.down = function(knex) {
    return knex.schema.table('user', function(table) {
        table.dropColumn('roles');
    });
};
