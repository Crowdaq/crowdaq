# Crowdaq

## Install

This package requires node version 12.

```
node --version
v12.18.1
```

To install packages, run

```
npx lerna bootstrap
```


## Development

To start development server:

```
docker run --name crowdaq-dev-postgres -p 55432:5432 -e POSTGRES_PASSWORD=12345678 -e POSTGRES_DB=crowdaq-dev  -d postgres:10.7
npx lerna exec --scope @crowdaq/backend knex migrate:latest
npx lerna exec --scope @crowdaq/backend npm run dev        
```

To start frontend app:
```
npx lerna exec --scope @crowdaq/frontend npm run serve
```



