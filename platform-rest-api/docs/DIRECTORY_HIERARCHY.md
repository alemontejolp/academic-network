# Directory Hierarchy

## Index

* [Directory structure](#directory-structure)
* [Entry point, bootstrap file and boot sequence](#entry-point-bootstrap-file-and-boot-sequence)
* [Explanation of the directories](#explanation-of-the-directories)

## Directory structure

* certs/
* docs/
* etc/
* logs/
* src/
  * apis/
    * social_network/
      * controllers/
      * endpoints/
      * flows/
  * lib/
  * middlewares/
  * scripts/
  * services/
* uploads/

## Entry point, bootstrap file and boot sequence

The entry point is the file `src/index.js`. This is the file which Node.JS will read first. This file will load
the bootstrap file, which is `src/app.js`. This file load the main modules of the application, which are the Web Services
modules. Such modules can be founded at `src/apis/[web service name]/interfaces.js`. These files will load the diferent
parts of their respective modules and their dependencies (as middlewares, services or libraries) and then, 
the whole application will be in memory.

## Explanation of the directories

* `certs/`

Here are the certificates that the application use for encryption processes. For example, certs

* `docs/`

The documentation of the repository.

* `etc/`

Some configuration files and other things such as messages.

* `src/`

The source code of the application.

* `src/apis`

Where the web services modules are.

* `src/apis/[web service name]/controllers/`

The endpoint controllers of the web services API.

* `src/apis/[web service name]/flows/`

Here the is where the middlewares and the controllers of an endpoint are registered. The sequence of middlewares and finally
the controller is called a **flow**.

* `src/apis/[web service name]/endpoint/`

Here endpoints are associated with a flow and exported as an `express.js` `Router`. Each file in this directory is considered as a module of the web service.

* `src/lib/`

Where the functionality written especially for this project is, and which is not a service.

* `src/middlewares/`

All the middlewares. They can be used in different endpoints execution flows.

* `src/scripts/`

Here are scripts that are not necessary loaded when the server starts. They are usually automatization of common tasks.

* `src/services/`

Here is logic that is required in different parts of the application almost all the time. They are loaded and kept listening for
calls to their APIs.

* `uploads`

Here the images are temporarily stored meanwhile are uploaded to Cloudinary. 
