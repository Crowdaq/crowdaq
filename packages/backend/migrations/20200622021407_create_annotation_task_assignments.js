const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('AnnotationTaskAssignments', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.string('annotation_taskset_id').notNullable();
        table.string('annotation_task_id').notNullable();
        
        table.string('worker_id').notNullable();
        table.string('worker_platform').notNullable();    
        table.datetime('start_time').notNullable();
        table.datetime('deadline').notNullable();

        table.datetime('complete_time');
        table.text('response');

        table.index([
            'owner', "annotation_taskset_id", "annotation_task_id"
        ]);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('AnnotationTaskAssignments')
};