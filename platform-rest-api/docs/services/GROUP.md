# Group service

## Index

* [Description](#Description)
* [Methods](#Methods)
  * [getGroupPermissions](#getGroupPermissions)
  * [getAvailableGroupPermissions](#getavailablegrouppermissions)
  * [getGroupInformation](#getgroupinformation)
  * [searchGroups](#searchGroups)
  * [createGroup](#createGroup)
  * [switchGroupNotifications](#switchGroupNotifications)
  * [updateGroupImage](#updateGroupImage)
  * [addUserToGroup](#addUserToGroup)
  * [createPost](#createPost)
  * [getMembershipInfo](#getmembershipinfo)
  * [groupVisibility](#groupVisibility)

## Description

This service use the [MariaDB service](MARIADB.md) to perform queries to the database. This service is in charge of
read and write data of groups.

## Methods

### `getGroupPermissions`

* **Description**

Return the permissions that a group has.

* **Params**:
  * `groupId`: int
* **Return data type**: Promise\<Object>
  * `group_exists`: boolean. If the group exists.
  * `permissions`: Array\<Object>
    * `name`: string.
    * `codename`: string
* **Exit code**:
  * 1: Group doesn't exists.

### `getAvailableGroupPermissions`

* **Description**

Return an array of available permissions that can be assigned to a group.

* **Params**: void
* **Return data type**: Promise\<Object[]>
  * `id`: int. 
  * `name`: string
  * `codename`: string.

### `getGroupInformation`

* **Description**

Return information of a group such as who is its owner, name, image, permissions, tags and so on.

* **Params**:
  * `groupId`: int
* **Return data type**: Promise\<Object>
  - exit_code: int
  - groupData: Objetc
    - owner_firstname: string
    - owner_firstname: string
    - owner_profile_img_src: string
    - group_name: string
    - group_image_src: string
    - group_description: string
    - group_visibility: string
    - group_created_at: string
  - permissions: Object[]
    - id: number
    - name: string
    - codename: string
  - tags: Object[]
    - tag: string
* **Exit code**:
  * 1: Group doesn't exists.

### `searchGroups`

* **Description**

Return all groups or only the groups (public and private) that user belongs to.

* **Params**:
  * `groupRelativeType`: string.
  * `search`: string.
  * `offset`: int.
  * `page`: int.
  * `asc`: int.
  * `userId`: int.
* **Return data type**: Promise\<Object>
  * `groups`: Array\<Object>
    * `id`: int.
    * `name`: string.
    * `image_src`: string.
    * `description`: string.
  * `total_records`: int.
  
### `createGroup`

* **Description**

Creates a new group associating the user id provided as the owner.

* **Params**:
  * `userId`: int
  * `group`: Object
    * `group_name`: string
    * `image_src`: string
    * `description`: string
    * `visibility`: string
    * `permissions`: string
    * `tags`: Array\<int>
* **Return data type**: Promise\<Object>
  * `exit_code`: int
  * `message`: string
  * `id`: int, if exit_code = 0
* **Exit code**:
  * 1: User owner does not exists.
  * 2: Visibility not allowed.
  * 3: Permission does not exists

### `switchGroupNotifications`

* **Description**

Turn on or turn off the group notifications which the user requesting belongs to.

* **Params**
  * `userId`: int
  * `group_id`: int
  * `state`: int
* **Return data type**: Promise\<Object>
  * `exit_code`: int
  * `message`: string
* **Exit code**:
  * 1: User doesn't exist in the group memberships or the group doesn't exist
  * 2: Group notifications are already in that state.

### `updateGroupImage`

* **Description**

Update the group image. To do that the user requesting must be the group owner.

* **Params**
  * `group_id`: int.
  * `image`: Object.
      * `path`: string. Path of image in the local files.
  * `userId`: int.

* **Return data type**: Promise\<Object>
  * `exit_code`: int.
  * `image_src`: string, only if code = 0.

* **Exit code**:
  * 1: The group does not exist.
  * 2: Permission denied. You are not the group owner.

### `addUserToGroup`

* **Description**

Add a user to a specific group.

* **Params**
  * `userId`: int
  * `group_id`: int
* **Return data type**: Promise\<Object>
  * `exit_code`: int
  * `message`: string
* **Exit code**:
  * 1: Group does not exist.
  * 2: The user is already a member of the group.

### `createPost`

* **Description**: 

Create a new group post, with a content and/or image.

Or shares a user post or public group post as group post, with an optional content. 
If the referenced post id of the shared post has an integer positive number, the 
referenced post id of the new group post that is going to be saved will be the id 
of the root post.

* **Params**
  * `userId`: int.
  * `groupId`: int.
  * `post`: Object.
    * `content`: string.
    * `image`: Object.
      * `path`: string. Path of image in the local files.
  * `referenced_post_id`: int. Id of user post or public group post to share.
* **Return data type**: Promise\<Object>
  * `exit_code`: int,
  * `message`: string,
  * `post_data`: Object
    * `content`: string.
    * `img_src`: string.
* **Exit code**:
  * 1: User is not member of group.
  * 2: The post cannot be shared, it belongs to a private group.

### `getMembershipInfo`

* **Description**

Returns information about the membership of a user related to a certain group.

* **Params**:
  * `userId`: int
  * `groupId`: int
* **Return data type**: Promise\<Object>
  * `exit_code`: number
  * `membershipInfo`: Object | undefined
    * `is_member`: boolean,
    * `is_owner`: boolean,
    * `active_notifications`: boolean,
    * `created_at:` string | null
* **Exit code**:
  * 1: Group does not exist.

### `groupVisibility`

* **Description**

Returns the visibility of the requested group. If also the user id is sent, includes 
in the response if the user is member of the group or not.

It is assumed that the group exists.

* **Params**:
  * `groupId`: int
  * `userId`: int | null
* **Return data type**: Promise\<Object>
  * `visibility`: string
  * `user_is_member`: boolean | null
