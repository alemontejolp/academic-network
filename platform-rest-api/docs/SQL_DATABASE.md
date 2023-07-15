# SQL Database documentation

This system use MariaDB v10.4 as database management system.

## Index

* [SQL Schema](#SQL-Schema)
* [Stored procedures](#Stored-procedures)
  * [Create user](#Create-user)
  * [Create student](#Create-student)
  * [Create user type](#Create-user-type)
  * [Create an allowed domain](#Create-an-allowed-domain)
  * [Create an API key](#Create-an-API-key)
  * [Create group permission](#Create-group-permission)
  * [Create group](#Create-group)
  * [Add a permission to a group](#Add-a-permission-to-a-group)
  * [Add a tag to a group](#Add-a-tag-to-a-group)
  * [Switch group notifications](#Switch-group-notifications)
  * [Add a user to a group](#add-a-user-to-a-group)
  * [Create a post of type group](#create-a-post-of-type-group)
  * [Create a post of type user](#create-a-post-of-type-user)

## SQL Schema
![SQL Schema](diagrams/db.png)

## Stored procedures

SPs aid to perform complex process that require execute several queries and checks that must act as
a single one logic query. This approach is used to reduce the execution time when a service is called
at the backend.

All SPs which aim is modify in some way the database will return an exit code. 0 code is considered success.

SPs that modify the DB are write-type. SPs that only read data are read-type.

### Create user

#### Type

Write

#### Description

Creates a new base user in the system.

#### SP name

`sp_user_create`

#### Parameters

* `firstname`: varchar(70)
* `lastname`: varchar(70)
* `username`: varchar(50)
* `email`: varchar(100)
* `passwd`: varchar(300)
* `profile_img_src`: varchar(700)
* `description`: varchar(700)
* `user_type_id`: int unsigned
* `domain_name`: varchar(255)

#### Exit codes

* 1: Domain name not allowed.
* 2: Email already exists.
* 3: Username already exists.
* 4: User type id doesn't exist.

### Create student

#### Type

Write

#### Description

Creates a new student by an existing user.

#### SP name

`sp_create_student`

#### Parameters

* `user_id`: int unsigned
* `student_id`: varchar(50)
* `major_id`: int unsigned

#### Exit codes

* 1: User already registered as student.
* 2: User doesn't exist.
* 3: Major doesn't exist.

### Create user type

#### Type

Write

#### Description

Creates a new user type.

#### SP name

`sp_user_type_create`

#### Parameters

* `name`: varchar(255)

#### Exit codes

* 1: This name already exists.

### Create an allowed domain

#### Type

Write

#### Description

Creates a new allowed domain.

#### SP name

`sp_domain_create`

#### Parameters

* `domain_name`: varchar(255)

#### Exit codes

* 1: This domain name already exists.

### Create an API key

#### Type

Write

#### Description

Creates a new API key with the owner data related.

#### SP name

`sp_create_api_key`

#### Parameters

* `appname`: varchar(100)
* `owner_name`: varchar(100)
* `email`: varchar(100)
* `phone`: varchar(20)

#### Exit codes

* No codes.

### Create group permission

#### Type

Write

#### Description

Create a new group permission.

#### SP name

`group_permission_create`

#### Parameters

* `name`: varchar(100)
* `codename`: varchar(100)

#### Exit codes

* 1: Name already exists.
* 2: Codename already exists.

### Create group

#### Type

Write

#### Description

Creates a new group and register the membership of the owner user id with the new group id.

#### SP name

`group_create`

#### Parameters

* `user_id`: int unsigned
* `gname`: varchar(100)
* `image_src`: varchar(700)
* `description`: varchar(700)
* `visibility`: varchar(15)

#### Exit codes

* 1: User owner does not exist.
* 2: Visibility not allowed.

### Add a permission to a group

#### Type

Write

#### Description

Adds a permission to a group.

#### SP name

`group_grant_permission`

#### Parameters

* `group_id`: int unsigned
* `permission_id`: int unsigned

#### Exit codes

* 1: Permission does not exist.
* 2: Permission already granted.

### Add a tag to a group

#### Type

Write

#### Description

Adds a tag to a group.

#### SP name

`group_add_tag`

#### Parameters

* `group_id`: int unsigned
* `tag`: varchar(50)

#### Exit codes

* No codes.

### Switch group notifications

#### Type

Write

#### Description

Turn on or turn off the group notifications which the user requesting belongs to.

#### SP name

`group_switch_notifications`

#### Parameters

* `user_id`:` int unsigned
* `group_id`: int unsigned
* `state`: bool

#### Exit codes

* 1: User doesn't exist in the group memberships or the group doesn't exist.
* 2: Group notifications are already in that state.

### Add a user to a group

#### Type

Write

#### Description

Adds a user to a group.

#### SP name

`group_add_user`

#### Parameters

* `user_id`: int unsigned
* `group_id`: int unsigned

#### Exit codes

* 1: Group does not exist.
* 2: The user is already a member of the group.

### Create a post of type group

#### Type

Write

#### Description

Create a new group post, with a content and/or image.

Or shares a user post or public group post as group post, with an optional content. 
If the referenced post id of the shared post has an integer positive number, the 
referenced post id of the new group post that is going to be saved will be the id 
of the root post.

#### SP name

`group_post_create`

#### Parameters

* `user_id`: int unsigned
* `group_id`: int unsigned
* `content`: text
* `img_src`: varchar(700)
* `cloudinary_id`: varchar(100)
* `referenced_post_id`: int. Id of user post or public group post to share.
* `post_type`: varchar(50)

#### Exit codes

* 1: User is not member of group.
* 2: The post cannot be shared, it belongs to a private group.

### Create a post of type user

#### Type

Write

#### Description

Create a new user post, with a content and/or image.

Or shares a user post or public group post as user post, with an optional content. 
If the referenced post id of the shared post has an integer positive number, the 
referenced post id of the new user post that is going to be saved will be the id 
of the root post.

#### SP name

`user_post_create`

#### Parameters

* `user_id`: int unsigned
* `content`: text
* `img_src`: varchar(700)
* `cloudinary_id`: varchar(100)
* `referenced_post_id`: int. Id of user post or public group post to share.
* `post_type`: varchar(50)

#### Exit codes

* 1: The post cannot be shared, it belongs to a private group.

### Sets a permission for an endpoint.

#### Type

Write

#### Description

Sets a permission for an endpoint.

#### SP name

`endpoint_permission_create`

#### Parameters

* `endpoint`: varchar(700),
* `group_permission_id`: int unsigned

#### Exit codes

* 1: The endpoint already has the group permission id.
