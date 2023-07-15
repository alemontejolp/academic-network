# Academy Network Services

## Description

This software is the core of the system `Academy Network`. This hold the different web services that this system provides
and connect the rest of components of the system between them.

Version: 0.1.0

## Conventions

* Indentation: Spaces, 2 spaces.
* Style: Camel Case.

## Docs

The whole documentation is in `docs/` directory. Please, read it if you want to contribute or use the project. 
[Click here to go](docs/README.md).

## NPM scripts

* `npm run dev` start the development server.
* `npm start` start the production server.

## How to try it

* If you don't have nodemon installed, use `npm install -g nodemon`.
* Clone this repository to your local machine.
* Install dependencies with `npm ci`.
* Setup the environment.
  * Run the environment setup command like so: `node src/scripts/setup_env.js --db-user=[db username] --db-passwd=[db password]`
  * Or setup the environment by yourself. See how to do it [here](docs/ENV_SETUP.md).
* Run `npm run dev` if you are in a development environment, `npm start` if production environment.

## How the application works

See [this](docs/DIRECTORY_HIERARCHY.md) and then, the rest of the docs.

## Maintainer and project lead

* [Axel Alexis Montejo Lopez](https://www.linkedin.com/in/alemontejolp/)
