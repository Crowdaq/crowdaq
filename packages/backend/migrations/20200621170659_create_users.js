
exports.up = function(knex) {
    return knex.schema.createTable('Users', table => {
        table.string('_id').notNullable().primary();
        table.string('username').notNullable();
        table.string('hashed_password').notNullable();
        table.string('salt');

        table.dateTime("create_at").notNullable();
        table.dateTime("update_at").notNullable();

        table.unique('username');

        table.index([
            'create_at'
        ]);

        table.index([
            'update_at'
        ]);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('Users')
};
