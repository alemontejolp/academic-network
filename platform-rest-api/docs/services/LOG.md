# Log service documentation

## Index

* [Description](#Description)
* [Methods](#Methods)
  * [crashReport](#crashReport)

## Description

This service is in charge of write logs to diferents destinations.

## Methods

### `crashReport`

* **Description**: Writes a crash report in `logs/crash_repots.log` and to the stdout.
* **Params**:
  * `err`: Object
    * `code`: string. The error code.
    * `messages`: string. The informative messages of the error.
    * `func`: string. The name of the function in which the error was originally caught.
    * `file`: string. The filename where the error was originally caught.
    * `stack`: string. The tracking made for Node.js.
  * `toStdout`: boolean. Default `true`. If logs must be written to stdout.
* **Return data type**: void
