#!/bin/bash
#main script for the crud generator

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

############# functions ##############

generate_model() {
  if [ -z "$model_name" ]; then
    read -p "Enter the model name: " model_name
  fi

  read -p 'attributes as sequelize eg.(title:string,name:string) ? ' attributes
  npx sequelize-cli model:generate --name $model_name --attributes $attributes
}

generate_repository() {
  if [ -z "$model_name" ]; then
      read -p "Enter the model name: " model_name
  fi

  if [ ! -f ./templates/repositoryTemplate ]; then
    echo -e "Error: Template file 'repositoryTemplate' not found."
    exit 1
  fi

  cp "templates/repositoryTemplate" "./repositories/${model_name}Repository.js"
  sed -i "s/\[model_name\]/$model_name/g" "./repositories/${model_name}Repository.js"

  echo "repository created"
}

generate_controller() {
  if [ -z "$model_name" ]; then
      read -p "Enter the model name: " model_name
  fi

  if [ ! -f ./templates/controllerTemplate ]; then
    echo "${RED} Error: Template file 'controllerTemplate' not found. ${NC}"
    exit 1
  fi

  if [ ! -f "./repositories/${model_name}Repository.js" ]; then
      echo -e "${RED} Error: repository file '${model_name}Repository' not found. ${NC}"
      exit 1
    fi

  mkdir "./controllers/${model_name}"

  cp "templates/controllerTemplate" "./controllers/${model_name}/${model_name}Controller.js"
  cp "templates/RulesTemplate" "./controllers/${model_name}/create${model_name}Rules.js"
  cp "templates/RulesTemplate" "./controllers/${model_name}/update${model_name}Rules.js"

  sed -i "s/\[model_name\]/$model_name/g" "./controllers/${model_name}/${model_name}Controller.js"

  sed -i "s/\[model_name\]/$model_name/g" "./controllers/${model_name}/create${model_name}Rules.js"
  sed -i "s/\[method_name\]/create/g" "./controllers/${model_name}/create${model_name}Rules.js"

  sed -i "s/\[model_name\]/$model_name/g" "./controllers/${model_name}/update${model_name}Rules.js"
  sed -i "s/\[method_name\]/update/g" "./controllers/${model_name}/update${model_name}Rules.js"

  echo "controller created with it's roles files "
}

generate_routes(){
  read -p "Enter route name: " model_name_for_routes
  cp "templates/RoutesTemplate" "./routes/${model_name}Routes.js"
  sed -i "s/\[model_name\]/$model_name/g" "./routes/${model_name}Routes.js"
  sed -i "s/\[model_name_for_routes\]/$model_name_for_routes/g" "./routes/${model_name}Routes.js"
}

generate_swagger(){
  cp "templates/swaggerTemplate" "./swagger/${model_name}.yaml"
  sed -i "s/\[model_name\]/$model_name/g" "./swagger/${model_name}.yaml"
  sed -i "s/\[model_name_for_routes\]/$model_name_for_routes/g" "./swagger/${model_name}.yaml"
}

generate_middlewares(){
  mkdir "./middlewares/${model_name}"

  cp "templates/existenceMiddlewareTemplate" "./middlewares/${model_name}/${model_name}ExistenceMiddleware.js"
  sed -i "s/\[model_name\]/$model_name/g" "./middlewares/${model_name}/${model_name}ExistenceMiddleware.js"

  cp "templates/validationMiddlewareTemplate" "./middlewares/${model_name}/${model_name}ValidationMiddleware.js"
  sed -i "s/\[model_name\]/$model_name/g" "./middlewares/${model_name}/${model_name}ValidationMiddleware.js"
}

migrate(){
    npm run migrate
}

generate_crud() {
  read -p "Enter the model name: " model_name
  generate_model
  generate_repository
  generate_controller
  generate_routes
  generate_swagger
  generate_middlewares
  migrate
}

############### end of functions #################

############## lets start our main menu #################################
PS3='What do you think of ?! :: '
options=("generate crud" "generate controller" "generate repository" "quit")


select opt in "${options[@]}"; do
	case $opt in
	"generate crud")
		generate_crud
		;;
  "generate controller")
		generate_controller
		;;
  "generate repository")
		generate_repository
		;;
	"quit")
		echo "bye (･_･)"
		break
		;;
	*) echo "invalid option $REPLY" ;;
	esac
done