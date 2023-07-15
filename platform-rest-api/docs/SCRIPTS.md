# Scripts documentation

## Index

* [Description](#description)
* [Setup environment](#setup-environment)

## Description

Some tasks might be tedious. That is why we have written some scripts to automate that tasks. Here is the documentation
to use those scripts. All scripts are in `src/scripts`.

## Setup environment

**Filename**: `setup_env.js`

**Description**: Creates the configuration file, certificates, environment variables and runs the database scripts to initialize it.
By default only perform missing configurations. You need to provide at least the user database and their password when use this script.

Option follow this format: `[option name]=[value]`. The value must not have spaces. If the option allow a list of option, each value
must be separated by a comma.

Default values of the environment variable are:

* MARIADB_HOST=localhost
* MARIADB_USER=[provided by `--db-user`]
* MARIADB_PASS=[provided by `--db-passwd`]
* MARIADB_DATABASE=academic_network
* IANA_TIMEZONE=America/Cancun
* PORT=3000
* MARIADB_PORT=3306
* CLOUDINARY_CLOUD_NAME=*
* CLOUDINARY_API_KEY=*
* CLOUDINARY_API_SECRET=*

Some endpoints needs to send images, this images are uploaded to Cloudinary service, to do that is necesary to set the correct values in the 3 cloudinary env vars, click [here](ENV_SETUP.md#setting-up-environment-variables) to see how to it.

**Options**

* `--db-user`

User database.

* `--db-passwd`

Password of the above user.

* `--force-reconf`

No arguments are required for this. When this flag is present overwrite all existing configuration, if `--reconf-target`
is not given.

* `--reconf-target`

Indicates what elements of the environment configuration reconfigurate. Values can be: `env|db|certs|conf-file`

* `--db-port`

Indicates what port the MariaDB connector should use. If it don't exists or if `--force-reconf` is present and `env` is part of the target,
this port will be written in the .env file.

* `--cd-cloud-name`

Indicates the Cloud name of your Cloudinary account. If it don't exist (take '*' as default value) and the `--force-reconf` is present 
and `env` is part of the target, the Cloud name env var will be written in the .env file.

* `--cd-api-key`

Indicates the API Key of your Cloudinary account. If it don't exist (take '*' as default value) and the `--force-reconf` is present and 
`env` is part of the target, the API Key env var will be written in the .env file.

* `--cd-api-secret`

Indicates the API Secret of your Cloudinary account. If it don't exist (take '*' as default value) and the `--force-reconf` is present 
and `env` is part of the target, the API Secret env var will be written in the .env file.

* `--help`

Display a minified version of this documentation.

**Example**

`node setup_env.js --db-user=ale --db-passwd=qwerty --force-reconf --reconf-target=env,db`

This will overwrite the current configuration of the environment variables and the database with the default configuration.
Also will add missing configuration of the remaining elements.
