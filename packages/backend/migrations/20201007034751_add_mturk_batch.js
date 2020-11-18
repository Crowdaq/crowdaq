const {create_and_update_time, link_owner_to_user} = require("../migration_helper");

exports.up = function(knex) {
    // return knex.schema.createTable('MturkBatch', table => {
        // table.string('_id').notNullable().primary();
        // link_owner_to_user(table);
        // create_and_update_time(table);
        //
        // // Status can be 'Creating' or 'Created'
        // table.string('status').notNullable();
        // table.integer('count');
        //
        // // Type can be exam/task.
        // table.string('type');
        //
        // table.string('Title');
        // table.string('Reward');
        //
        //
        // table.index([
        //     'owner'
        // ]);
        //
        // table.unique(['owner', 'report_type', 'report_id'])
    // })
};

exports.down = function(knex) {
    // return knex.schema.dropTable('CrowdaqReports')
};