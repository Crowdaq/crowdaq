const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('Tutorials', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.string('tutorial_id').notNullable();
        table.text('definition').notNullable();

        table.index([
            'owner', "tutorial_id"
        ]);

        table.unique(['owner', "tutorial_id"])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('Tutorials')
};
