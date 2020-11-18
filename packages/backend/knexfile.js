// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: "postgres://postgres:12345678@localhost:55432/crowdaq-dev",
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DB_URL,
    pool: {
      min: 2,
      max: 30
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
