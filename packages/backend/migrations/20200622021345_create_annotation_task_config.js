const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('AnnotationTaskConfigs', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.string('annotation_taskset_id').notNullable();
        table.integer('time_limit_in_seconds').notNullable().defaultTo(3600);

        table.index([
            'owner', "annotation_taskset_id"
        ]);

        table.unique(['owner', "annotation_taskset_id"])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('AnnotationTaskConfigs')
};
