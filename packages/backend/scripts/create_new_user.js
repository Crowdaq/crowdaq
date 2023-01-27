const sha256 = require('crypto-js/sha256');
const crypto = require('crypto');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const { logger } = require("../crowdaq/index");
const { create_spread } = require("../crowdaq/db/knex");

const argv = yargs(hideBin(process.argv)).argv

const connection_str = argv.db_str || "postgres://postgres:12345678@localhost:55432/crowdaq-dev"
const db_config = {
    client: 'postgresql',
    connection: connection_str,
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
}

const knex = require('knex')(db_config)
var read = require("read")

async function ITEM_EXIST(table, filter) {
    const count = await knex(table)
        .where(filter)
        .count("* as CNT");
    return count[0].CNT > 0;
}

function hashPassword(password, salt = undefined) {
    if (salt === undefined) {
        salt = crypto.randomBytes(16).toString('base64')
    }
    const hashed_password = sha256(salt + password).toString();
    return {
        hashed_password,
        salt
    }
}


async function run() {
    const {
        user: username,
    } = argv;

    let password = argv.password;

    if (!password) {
        password = await read({ prompt: 'Password: ', silent: true })
    }
    logger.info(`Checking if user ${username} exists.`)

    const user_exist = await ITEM_EXIST(
        'Users',
        { username }
    )

    if (user_exist) {
        logger.info(`User ${username} exists.`)
        throw new CrowdaqException(`User ${username} exists.`);
    } else {
        logger.info(`Creating user ${username}.`)
        const { salt, hashed_password } = hashPassword(password);

        let ret = await knex("Users").insert({
            username, salt, hashed_password, ...create_spread()
        }).returning("username");
        logger.info(`User ${username} created.`)
        return {
            username
        }
    }
}

run().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
})