# Crowdaq

## Install

This package requires node version 12.

```
node --version
v12.18.1
```

To install packages, run

```bash
npx lerna bootstrap
# to install knex command
npm install -g knex
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

## Deployment

We recommend deploy crowdaq with docker, to do that, simply run:
```bash
./build_docker.sh
```

This will generate two docker images: crowdaq/frontend and crowdaq/backend. Then you can create a crowdaq cluster using docker compose.

```bash
cd docker
docker-compose up
```

Once you see this line in the output:
```
backend_1  | {"message":"🚀 Server ready at http://localhost:80/apiV2","level":"info","timestamp":"2020-11-18T01:34:00.693Z"}
```

You can go to http://localhost:18081 and the default username:password is crowdaq:your_client_password, which can be changed by modifying `docker/docker-compose.yml`. 


## Creating new user

```bash
npx lerna exec --scope @crowdaq/backend "node scripts/create_new_user.js" -- --user hao
# OR
npx lerna exec --scope @crowdaq/backend "node scripts/create_new_user.js" -- --user hao --password 123456
# OR
npx lerna exec --scope @crowdaq/backend "node scripts/create_new_user.js" -- --user hao --db_str "postgres://postgres:12345678@localhost:55432/crowdaq-dev"
```





