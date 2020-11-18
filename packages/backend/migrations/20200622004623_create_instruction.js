const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('Instructions', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.string('instruction_id').notNullable();
        table.text('definition').notNullable();

        table.index([
            'owner', "instruction_id"
        ]);

        table.unique(['owner', "instruction_id"])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('Instructions')
};
