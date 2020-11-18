const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('ExamAssignments', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);
        
        // Value will be assigned on creation.
        table.string('exam_id').notNullable();
        table.text('assignment_payload').notNullable();
        table.datetime('deadline').notNullable();
        table.string('worker_id').notNullable();
        table.string('worker_platform').notNullable();
        
        // Value will be assigned on completion.
        table.text('response_payload');
        table.datetime('complete_time');
        table.float('grade');

        table.index([
            'owner', "exam_id", "worker_platform", "worker_id"
        ]);

        // table.unique(['owner', "exam_id",])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('ExamAssignments')
};
