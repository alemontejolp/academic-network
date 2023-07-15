# Error handling service documentation

## Index

* [Description](#description)
* [Methods](#methods)
  * [handleErrorInRequest](#handleerrorinrequest)
  * [handleImageUploadError](#handleimageuploaderror)

## Description

This service is in charge of handling errors that have occurred during the execution process of an endpoint.
It use the [log service](LOG.md) to write logs.

## Methods

### `handleErrorInRequest`

* **Description**: Takes an error object and if headers haven't been sent, response with status 500 and with a 
code -5. Then write a crash report in the crash reports file and in the execution logs, if applicable. This is to manage unexpected errors
and keep the application running. See the [web services doc](../WEB_SERVICES.md) to getting know what means code -5.

* **Params**:
  * `req`: requestObject. The express req object.
  * `res`: responseObject. The express res object.
  * `err`: Error
    * `code`: string. The error code.
    * `messages`: string. The informative messages of the error.
    * `func`: string. The name of the function in which the error was originally caught.
    * `file`: string. The filename where the error was originally caught.
    * `stack`: string. The tracking made for Node.js.
* **Return data type**: void

### `handleImageUploadError`

* **Description**: Check if the uploaded image still exists in local files, if so it will be deleted. Something similar occurs 
with the image stored in Cloudinary services.

* **Params**:
  * `req`: requestObject. The express req object.
  * `res`: responseObject. The express res object.
  * `err`: Error
    * `code`: string. The error code.
    * `messages`: string. The informative messages of the error.
    * `func`: string. The name of the function in which the error was originally caught.
    * `file`: string. The filename where the error was originally caught.
    * `stack`: string. The tracking made for Node.js.
    * `cloudinary_id`: string. The public id of image stored in cloudinary in case that it need to delete the image.
* **Return data type**: void
