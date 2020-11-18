const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('ExamAssignmentRecord', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.string("exam_assignment_id").notNullable();
        table.foreign("exam_assignment_id")
            .references('ExamAssignments._id');

        table.string("exam_id").notNullable();
        table.string("question_id").notNullable();
        table.string("selection").notNullable();
    
        table.index([
            'owner', 'exam_id', 'exam_assignment_id', 'question_id'
        ]);

        table.unique(['owner', 'exam_id', 'exam_assignment_id', 'question_id'], "unique-owner-exam_id-exam_assignment_id-question_id")
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('ExamAssignmentRecord')
};