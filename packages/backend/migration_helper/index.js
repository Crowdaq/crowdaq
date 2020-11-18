function link_owner_to_user(table, col_name='owner'){
    table.string(col_name).notNullable();
    table.foreign(col_name)
        .references('Users.username');
}

function create_and_update_time(table){
    table.dateTime("create_at").notNullable();
    table.dateTime("update_at").notNullable();

    table.index(['create_at']);
    table.index(['update_at']);
}

module.exports = {
    link_owner_to_user,
    create_and_update_time
};