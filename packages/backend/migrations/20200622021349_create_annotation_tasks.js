const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('AnnotationTasks', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);
        table.string('annotation_taskset_id').notNullable();
        table.string('annotation_task_id').notNullable();
        table.text('definition').notNullable();

        table.index([
            'owner', "annotation_taskset_id", "annotation_task_id"
        ]);

        table.unique([
            'owner', "annotation_taskset_id", "annotation_task_id"
        ], "owner-annotation_taskset_id-annotation_task_id-unique-index")
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('AnnotationTasks')
};
