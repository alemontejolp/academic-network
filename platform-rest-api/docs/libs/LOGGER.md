# Logger lib

This document describe the API of the `Logger` library.

Describe the exported elements, what they are and how to use them.

## Index

* [Logger](#Logger)
  * [Description](#Description)
  * [Public methods](#Public-methdos)
    * [constructor](#constructor)
    * [log](#log)
    * [error](#error)
    * [computeLog](#computeLog)
    * [write](#write)

## Logger

### Description

A class for generate logs and write them in files and to the stdout.

### Public methdos

#### `constructor`

* **Params**:
  * `conf`: object
    * `process`: string. The process related to this log. Usually the path to the endpoint requested.
    * `method`: string. The HTTP method related to the process.
    * `queue`: Array\<string>. Optional if you want to add some existing logs.
    * `logpath`: string. Path to the file where log will be written.
    * `writeToStdout`: boolean. If logs must be written to stdout.
    * `writeToFile`: boolean. If logs must be written in `logpath`.

#### `log`

* **Description**: Add to the logs queue the new message.
* **Params**:
  * `message`: string
* **Return data type**: void

#### `error`

* **Description**: Add a some messages to the logs queue indicating relevant data of the error.
If this method is called, when `write` method is called the logs will be written in the `logpath` too.
* **Params**:
  * `err`: object
    * `code`: string. The error code.
    * `messages`: string. The informative messages of the error.
    * `func`: string. The name of the function in which the error was originally caught.
    * `file`: string. The filename where the error was originally caught.
    * `stack`: string. The tracking made for Node.js.
* **Return data type**: void

#### `computeLog`

* **Description**: Gives format to the logs queue and return it as string.
* **Params**: void
* **Return data type**: string

#### `write`

* **Description**: Formats the logs and write them according to the configuration and empty the logs queue.
* **Params**: void
* **Return data type**: void

### Public attributes
* `process`: string. The process related to this log. Usually the path to the endpoint requested.
* `method`: string. The HTTP method related to the process.
* `logpath`: string. Path to the file where log will be written.
* `writeToStdout`: boolean. If logs must be written to stdout.
* `writeToFile`: boolean. If logs must be written in `logpath`.
