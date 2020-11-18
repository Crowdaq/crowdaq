const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('ExamConfigs', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.string('exam_id').notNullable();
        table.string('instruction_id');
        table.string('tutorial_id');


        table.integer('num_of_questions').notNullable().defaultTo(0);
        table.integer('max_attempts').notNullable().defaultTo(1);

        table.float('passing_grade').notNullable().defaultTo(1.0);
        table.integer('time_limit_in_seconds').notNullable().defaultTo(3600);

        table.index([
            'owner', "exam_id"
        ]);

        table.unique(['owner', "exam_id"])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('ExamConfigs')
};
