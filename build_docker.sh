
CI_COMMIT_SHA=`git rev-parse --short HEAD`
echo BUILDING VERSION: $CI_COMMIT_SHA

npx lerna bootstrap

docker build -f docker/backend/Dockerfile -t crowdaq/backend:$CI_COMMIT_SHA .
docker tag crowdaq/backend:$CI_COMMIT_SHA crowdaq/backend:latest

export NODE_ENV='production'
export VUE_APP_CROWDAQ_API_URL='/apiV2'
npx lerna exec --scope @crowdaq/frontend npm run build

docker build -f docker/frontend/Dockerfile -t crowdaq/frontend:$CI_COMMIT_SHA .
docker tag crowdaq/frontend:$CI_COMMIT_SHA crowdaq/frontend:latest
