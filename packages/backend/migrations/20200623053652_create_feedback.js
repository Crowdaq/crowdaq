const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('Feedbacks', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.string('instruction_id')
        table.string('tutorial_id')
        table.string('exam_id')
        table.string('annotation_taskset_id')
        table.string('annotation_task_id')

        table.string('full_url', 512)
        table.text('feedback')
        table.string('worker_email')
        table.string('worker_id')
        table.string('worker_platform')

    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('Feedbacks')
};
