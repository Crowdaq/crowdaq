
exports.up = function(knex) {
    return knex.schema.table('ExamConfigs', function (table) {
        table.string('qualification_id');
    })
};

exports.down = function(knex) {
    return knex.schema.table('ExamConfigs', table => {
        table.dropColumn('qualification_id');
    });
};
