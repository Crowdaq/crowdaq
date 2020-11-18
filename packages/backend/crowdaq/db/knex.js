const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile');
const { v4: uuidv4 } = require('uuid');
const _ = require("lodash")

function get_new_id(){
    return `${new Date().getTime()}-${uuidv4().substring()}`
}

function create_spread(include_id=true){
    const v = new Date();
    if (include_id){
        return {
            _id: get_new_id(),
            create_at: v,
            update_at: v
        }
    }else{
        return {
            create_at: v,
            update_at: v
        }
    }
    
}

function update_spread(){
    return {
        update_at: new Date()
    }
}

module.exports = {
    knex: require('knex')(config[environment]),
    get_new_id,
    update_spread,
    create_spread
};
