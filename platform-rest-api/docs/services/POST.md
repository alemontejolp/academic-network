# Post service documentation

## Index

* [Description](#description)
* [Methods](#methods)
  * [getPostsForTimeline](#getpostsfortimeline)
  * [getPostData](#getpostdata)
  * [postBelongsToGroup](#postbelongstogroup)
  * [userBelongsToGroup](#userbelongstogroup)
  * [getFavoritePosts](#getfavoriteposts)
  * [getCommentsOfAPost](#getcommentsofapost)
  * [getPostsOfAGroup](#getpostsofagroup)
  * [createComment](#createcomment)

## Description

## Methods

### `getPostsForTimeline`

* **Description**: 

Retrieves a list of publications made by users that the requesting user is following and publications 
that are associated to groups that the requesting user is part of. The publications are sorted in 
descending order according to their creation date. Records are served into groups of a certain size. Regarding the referenced post only sends the id of the post.

* **Params**:

  * `page`: int.
  * `offset`: int.

* **Return data type**: Promise\<Object>
  * `posts`: Array\<Object>
    * `id`: int,
    * `username`: string,
    * `firstname`: string,
    * `lastname`: string,
    * `profile_img_src`: string,
    * `content`: string,
    * `img_src`: string,
    * `post_type`: string,
    * `like_counter`: int,
    * `created_at`: date,
    * `liked_by_user`: bool,
    * `group_name`: string,
    * `group_id`: string,
    * `referenced_post_id`: int
  * `total_records`: int.

### `getPostData`

* **Description**: 

Gets data of a single publication.

The response can add the following fields:

'liked_by_user' if the user_id has an integer value (the user is authenticated).

'referenced_post_id' if withReferencedPostId is equals true.

* **Params**:

  * `post_id`: int.
  * `withReferencedPostId`: boolean.
  * `user_id`: null | undefined | int. Not required.

* **Return data type**: Promise\<Object>
  * `id`: number,
  * `username`: string,
  * `firstname`: string,
  * `lastname`: string,
  * `profile_img_src`: string,
  * `content`: string,
  * `img_src`: string,
  * `post_type`: string,
  * `like_counter`: number,
  * `created_at`: datetime,
  * `liked_by_user`: bool (if user_id has a value),
  * `group_name`: string,
  * `group_id`: number
  * `referenced_post_id`: number (if withReferencedPostId == true.)

### `postBelongsToGroup`

* **Description**: 

Verifies if the post provided is part of a group, if is true
returns its group id and visibilty (public or private).

In case the post is not found it returns -1.

* **Params**:

  * `post_id`: int.

* **Return data type**: Promise\<Object | number>

### `userBelongsToGroup`

* **Description**: 

Checks if the user provided belongs to the group provided.
Returns true or false.

* **Params**:

  * `user_id`: int.
  * `group_id`: int.

* **Return data type**: Promise\<boolean>

### `getFavoritePosts`

* **Description**: 

Retrieves a list of favorite publications of a user.

The publications are sorted in descending order according to their creation date.

Regarding the referenced post only sends the id of the post.

The resulting posts are paginated according to the 'offset' and the 'page' parameters.

* **Params**:

  * `page`: int.
  * `offset`: int.

* **Return data type**: Promise\<Object>
  * `posts`: Array\<Object>
    * `id`: int,
    * `username`: string,
    * `firstname`: string,
    * `lastname`: string,
    * `profile_img_src`: string,
    * `content`: string,
    * `img_src`: string,
    * `post_type`: string,
    * `like_counter`: int,
    * `created_at`: date,
    * `group_name`: string (if apply),
    * `group_id`: string (if apply),
    * `referenced_post_id`: int
  * `total_records`: int.

### `getCommentsOfAPost`

* **Description**: 

Retrieves a list of comments for a specific post.
Comments are sorted in descending order according to the creation date.

* **Params**:

  * `post_id`: int.
  * `page`: int.
  * `offset`: int.

* **Return data type**: Promise\<Object>
  * `exists_post`: boolean
  * `comments`: Array\<Object>
    * `post_id`: int,
    * `user_id`: int,
    * `firstname`: string,
    * `lastname`: string,
    * `username`: string,
    * `profile_img_src`: string,
    * `content`: string,
    * `image_src`: string,
    * `created_at`: date
  * `total_records`: int.

### `getPostsOfAGroup`

* **Description**: 

Given a group id, return the most recent publications made in the requested group. 

The result has pagination, with 10 post by page and the first group of posts by 
default.

* **Params**:

  * `userId`: int.
  * `groupId`: int.
  * `offset`: int. Default 10
  * `page`: int. Default 0

* **Return data type**: Promise\<Object>
  * `exit_code`: int
  * `group_posts`: Array\<Object> | undefined
    * `id`: int,
    * `username`: string,
    * `firstname`: string,
    * `lastname`: string,
    * `profile_img_src`: string,
    * `content`: string,
    * `img_src`: string,
    * `post_type`: string,
    * `created_at`: string,
    * `like_counter`: int,
    * `liked_by_user`: boolean,
    * `group_name`: string,
    * `group_id`: string,
    * `referenced_post_id`: int
  * `total_records`: int. | undefined

### `createComment`

* **Description**: 

Create a comment made on a certain post (user and group post type).

* **Params**:

  * `postId`: int.
  * `userId`: int.
  * `comment`: Object
    * `content`: string
    * `image`: Object
      * `path`: string

* **Return data type**: Promise\<Object>
  * `comment_id`: number
  * `content`: string 
  * `image_src`: string.
  * `created_at`: string