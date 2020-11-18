const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    return knex.schema.createTable('CrowdaqReports', table => {
        table.string('_id').notNullable().primary();
        link_owner_to_user(table);
        create_and_update_time(table);

        table.text('report')
        table.string('report_type')
        table.string('report_id')

        table.index([
            'owner', 'report_type', 'report_id'
        ]);

        table.unique(['owner', 'report_type', 'report_id'])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('CrowdaqReports')
};