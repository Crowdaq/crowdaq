const {
    knex
} = require('./knex');

const _ = require("lodash");
function remove_undefined(filter){
    return _.pickBy(filter, x => x !== undefined)
}


async function paged_query(base_query, count_query, cursor, option={}){
    
    const {updateAtColumn = "update_at"} = option;

    let estimated_item_count = await count_query().count("_id as CNT");

    estimated_item_count = estimated_item_count[0].CNT

    let { page_size, page } = cursor;

    page_size = page_size || 20
    page_size = Math.min(page_size, 100);
    page = page || 1
    
    let items_query = base_query()
    .orderBy(updateAtColumn, 'desc')
    .offset(page_size * (page - 1))
    .limit(page_size);
    
    let payload = await items_query;
    // payload = _.map(payload, x => x);


    return {
        estimated_item_count,
        payload
    }
}

/**
 * 
 * @param {*} table 
 * @param {*} filter 
 * @param {*} page_option 
 * @param {*} projection 
 * @param {*} strict_mode if allow undefined filter.
 */
async function LIST_FROM_DB(table, filter, page_option, projection="*"){
    const db_query = () => knex(table)
        .select(projection)
        .where(filter);

    const count_query = () => knex(table)
        .where(filter);

    return paged_query(db_query, count_query, page_option);
}

async function GET_FROM_DB(table, filter, projection="*"){
    return knex(table)
        .select(projection)
        .where(filter)
        .first();
}

async function ALL_FROM_DB(table, filter, projection="*"){
    return knex(table)
        .select(projection)
        .where(filter)
}

async function DELETE_FROM_DB(table, filter){
    return knex(table)
        .where(filter)
        .del();
}

async function ITEM_EXIST(table, filter){
    const count = await knex(table)
        .where(filter)
        .count("* as CNT");
    return count[0].CNT > 0;
}

async function UPDATE_FROM_DB(table, insert_object, update_object ,constraint){
    const insert = knex(table).insert(insert_object);
    const update = knex.queryBuilder().update(update_object);
    return knex.raw(`? ON CONFLICT ${constraint} DO ? returning *`, [insert, update]);
}

module.exports = {
    LIST_FROM_DB, GET_FROM_DB, DELETE_FROM_DB, ITEM_EXIST, UPDATE_FROM_DB, ALL_FROM_DB, paged_query, remove_undefined
}