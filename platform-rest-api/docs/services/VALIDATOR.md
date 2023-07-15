# Validator service documentation

## Index

* [Description](#Description)
* [Methods](#Methods)
  * [parseValidatorOutput](#parseValidatorOutput)

## Description

This service is in charge of perform some formatting to the output of the validations performed by 
[better-validator lib](https://www.npmjs.com/package/better-validator).

## Methods

### `parseValidatorOutput`

* **Description**: Formats into a human readable structure the output of `Validator.run()`. The output
is an array of error messages.
* **Params**:
  * `result`: Array\<Object>. Output of `Validator.run()`.
* **Return data type**: Array\<string>

## Attributes

### `Validator`

* **Description** The class exported by [better-validator lib](https://www.npmjs.com/package/better-validator).
