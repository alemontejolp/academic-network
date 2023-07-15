#!/bin/sh

RED_COLOR='\033[0;31m'
NO_COLOR='\033[0m' # No Color

if [ ! -z ${INSTALL_DEPENDENCIES} ]
then
  echo "Installing application dependencies."
  npm ci
  # chmod -R 777 node_modules
else
  echo "Skipping installation of dependencies."
fi

node ./src/scripts/init.js

if [ $? -ne 0 ]
then
  printf "${RED_COLOR}Initialization process failed. Refusing to start the application.\n"
  exit 1
fi

npm run dev
