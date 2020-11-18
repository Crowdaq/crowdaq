yarn install
yarn build
# docker build -t turkproject/frontend .

echo docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .

echo docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG