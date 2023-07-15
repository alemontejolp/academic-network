# Authentication service documentation

## Index

* [getAppDataByAPIKey](#getAppDataByAPIKey)
* [authUserByCrendent](#authUserByCrendent)

## Description

This service use the [MariaDB service](MARIADB.md) to perform queries to the database. It is in charge to read and write
data related to the authentication.

## Methods

### `getAppDataByAPIKey`

* **Description**: Retrieve the application data related to a API key.
* **Params**
  * `APIKey`: string.
* **Return data type**: Promise\<Object>
  * `appname`: string.
  * `owner_name`: string.
  * `email`: string
  * `phone`: string.

### `authUserByCrendent`

* **Description**: Retrieve the user id by user credentials. Returns the ID if user can be authenticated or null if not.
* **Params**
  * `username`: string. It can be username or email.
  * `passwd`: string. 
* **Return data type**: Promise\<int | null>
