npx sequelize-cli \
 model:generate \
  --name User \
  --attributes \
   username:string,hashed_password:string,salt:string,email:string \
   --underscored

npx sequelize-cli \
 model:generate \
  --name User \
  --attributes \
   username:string,hashed_password:string,salt:string,email:string \
   --underscored
