const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('RequesterProfile', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table, 'username');
        create_and_update_time(table);

        table.string('aws_access_key_id')
        table.string('aws_secret_access_key')

        table.index([
            'username'
        ]);

        table.unique(['username'])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('RequesterProfile')
};
