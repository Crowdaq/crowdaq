from node:12

COPY *.json ./
COPY packages packages
COPY resources/run_backend.sh ./run_backend.sh

RUN npx lerna bootstrap

RUN chmod +x ./run_backend.sh

ENV NODE_ENV 'production'

CMD ./run_backend.sh
