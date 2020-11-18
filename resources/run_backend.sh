#!/usr/bin/env bash

if [ "$CROWDAQ_INIT_DB" = "true" ];
 then
   npx lerna exec --scope @crowdaq/backend knex migrate:latest;
fi

npx lerna exec --scope @crowdaq/backend npm run start
