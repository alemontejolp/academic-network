const cloudinary = require('cloudinary').v2
const fs = require('fs')
const mariadb = require('./mariadb.service')

module.exports = {
  /**
   * Retrieves a list of publications made by users that the requesting user is following 
   * and publications that are associated to groups that the requesting user is part of. 
   * The publications are sorted in descending order according to their creation date.
   * Regarding the referenced post only sends the id of the post.
   * @param {number} user_id Id of user requesting.
   * @returns {Object}
   *  * posts: posts records
   *  * total_records: number
   */
  getPostsForTimeline: async function(user_id, offset = 10, page = 0) {
    const query = `
      select
        id,
        username,
        firstname,
        lastname,
        profile_img_src,
        content,
        img_src,
        post_type,
        like_counter,
        created_at,
        liked_by_user,
        group_name,
        group_id,
        referenced_post_id
      from (	
      (
        select
          posts.id,
          users.username,
          users.firstname,
          users.lastname,
          users.profile_img_src,
          posts.content,
          posts.img_src,	
          posts.post_type,
          posts.like_counter,
          posts.created_at,
          case 
            when (
              select id from favorite_posts 
              where post_id = posts.id and user_id = ?
              limit 1
            ) is not null then 1 
            else 0
          end as liked_by_user,
          null as group_name,
          null as group_id,
          posts.referenced_post_id
        from posts
        inner join followers
          on posts.user_id = followers.target_user_id
        inner join users
          on posts.user_id = users.id
        where 
          followers.follower_user_id = ? and 
          posts.post_type = 'user'
      ) 
      union 
      (
        select 
          posts.id,
          users.username,
          users.firstname,
          users.lastname,
          users.profile_img_src,
          posts.content,
          posts.img_src,	
          posts.post_type,
          posts.like_counter,
          posts.created_at,
          case 
            when (
              select id from favorite_posts 
              where post_id = posts.id and user_id = ?
              limit 1
            ) is not null then 1  
            else 0
          end as liked_by_user,
          user_groups.name as group_name,
          user_groups.id as group_id,
          posts.referenced_post_id
        from posts
        inner join group_posts
          on posts.id = group_posts.post_id
        inner join user_groups
          on group_posts.group_id = user_groups.id
        inner join group_memberships
          on user_groups.id = group_memberships.group_id
        inner join users
          on posts.user_id = users.id
        where 
          group_memberships.user_id = ? and
          posts.user_id != ?
      )
      ) results
      order by created_at desc
      limit ?, ?;
    `
    // Prepare query to counts how much records there are.
    let countQuery = query.split('\n')
    // Remove selected fields and select the amount of records.
    countQuery.splice(2, 14, 'count(*) as total_records')
    // Remove limit to select all the records.
    countQuery.pop(); countQuery.pop()
    countQuery = countQuery.join('\n')

    let params = new Array(5).fill(user_id)
    params.push(page * offset, offset)
    
    try {
      const postsResult = await mariadb.query(query, params)
      let countResult = await mariadb.query(countQuery, params)
      countResult = countResult[0]

      return {
        posts: postsResult,
        total_records: countResult ? countResult.total_records : 0
      }
    } catch (err) {
      err.file = __filename
      err.func = 'getPostsForTimeline'
      throw err
    }
  },

  /**
   * Gets data of a single publication.
   * The response can add the following fields:
   * - 'liked_by_user' if the user_id has an integer value (the user is authenticated).
   * - 'referenced_post_id' if withReferencedPostId is equals true.
   * @param {number} post_id Id of post to get the data.
   * @param {boolean} withReferencedPostId
   * @param {number} user_id Id of user requesting (optional).
   * @returns {object} An object with:
   * - id: number,
   * - username: string,
   * - firstname: string,
   * - lastname: string,
   * - profile_img_src: string,
   * - content: string,
   * - img_src: string,
   * - post_type: string,
   * - like_counter: number,
   * - created_at: datetime,
   * - liked_by_user: bool (if the user is authenticated),
   * - group_name: string,
   * - group_id: number,
   * - referenced_post_id: number (if withReferencedPostId == true)
   */
  getPostData: async function(post_id, withReferencedPostId, user_id = null) {
    let query = `
      select
        posts.id,
        users.username,
        users.firstname,
        users.lastname,
        users.profile_img_src,
        posts.content,
        posts.img_src,	
        posts.post_type,
        posts.like_counter,
        posts.created_at,
    `
    if (user_id) {
      query += `
        case 
          when (
            select id
              from favorite_posts
              where 
                user_id = ? and
                post_id = ?
            limit 1
          ) is not null then 1 
          else 0
        end as liked_by_user,
      `
    }
    query += `
        case 
          when posts.post_type = 'group' then (
            select user_groups.name
            from posts
            inner join group_posts
              on posts.id = group_posts.post_id
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where posts.id = ?
          )
        end as group_name,
        case 
          when posts.post_type = 'group' then (
            select user_groups.id
            from posts
            inner join group_posts
              on posts.id = group_posts.post_id
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where posts.id = ?
          )
        end as group_id
    `
    if (withReferencedPostId) {
      query += `, posts.referenced_post_id`
    } 
    query += `
      from posts
      inner join users
        on posts.user_id = users.id
      where posts.id = ?
      limit 1;
    `
    try {
      let params = [post_id, post_id, post_id]
      if (user_id) {
        params.unshift(user_id, post_id)
      }
      const post = await mariadb.query(query, params)
      return post[0]
    } catch (err) {
      err.file = __filename
      err.func = 'getPostData'
      throw err
    }
  },

  /**
   * Verifies if  the post provided is part of a group, if is true
   * returns its group id and visibilty (public or private).
   * In case the post is not found it returns -1.
   * @param {number} post_id 
   * @returns {Object | number}
   */
  postBelongsToGroup: async function(post_id) {
    const query = `
      select 
        user_groups.id as group_id,
        user_groups.visibility
      from posts
      inner join group_posts
        on posts.id = group_posts.post_id
      inner join user_groups
        on group_posts.group_id = user_groups.id
      where posts.id = ?
      limit 1;
    `
    try {
      let result = await mariadb.query(query, [post_id])
      result = result[0]

      if (result === undefined) return -1
      return {
        group_id: result.group_id,
        group_private: result.visibility === 'private' ? true : false
      }
    } catch (err) {
      err.file = __filename
      err.func = 'postBelongsToGroup'
      throw err
    }
  },

  /**
   * Checks if the user provided belongs to the group provided.
   * Returns true or false.
   * @param {number} user_id 
   * @param {number} group_id 
   * @returns {boolean}
   */
  userBelongsToGroup: async function(user_id, group_id) {
    const query = `
      select id
      from group_memberships
      where user_id = ? and group_id = ?
      limit 1;
    `
    try {
      let result = await mariadb.query(query, [user_id, group_id])
      result = result[0]

      return (result === undefined ? false : true)
    } catch (err) {
      err.file = __filename
      err.func = 'userBelongsToGroup'
      throw err
    }
  },

  /**
   * Retrieves a list of favorite publications of a user.
   * The publications are sorted in descending order according to their creation date.
   * Regarding the referenced post only sends the id of the post.
   * The resulting posts are paginated according to the 'offset' and the 'page' received.
   * @param {number} user_id Id of user requesting.
   * @returns {Object}
   *  * posts: favorite posts records
   *  * total_records: number
   */
  getFavoritePosts: async function(user_id, offset = 10, page = 0) {
    const query = `
      select 
        posts.id,
        users.username,
        users.firstname,
        users.lastname,
        users.profile_img_src,
        posts.content,
        posts.img_src,	
        posts.post_type,
        posts.like_counter,
        posts.created_at,
        true as liked_by_user,
        case 
          when posts.post_type = 'group' then (
            select user_groups.name
            from group_posts 
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where group_posts.post_id = posts.id
            limit 1
          )
          else null
        end as group_name,
        case 
          when posts.post_type = 'group' then (
            select user_groups.id
            from group_posts 
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where group_posts.post_id = posts.id
            limit 1
          )
          else null
        end as group_id,
        posts.referenced_post_id
      from posts
      inner join users
        on posts.user_id = users.id
      inner join favorite_posts
        on posts.id = favorite_posts.post_id
      where favorite_posts.user_id = ?
      order by posts.created_at desc, posts.id desc
      limit ?, ?;
    `
    // Prepare query to counts how much records there are.
    let countQuery = query.split('\n')
    // Remove selected fields and select the amount of records.
    countQuery.splice(2, 34, 'count(*) as total_records')
    // Remove limit to select all the records.
    countQuery.pop(); countQuery.pop()
    countQuery = countQuery.join('\n')

    const params = [user_id, page*offset, offset]
    
    try {
      const postsResult = await mariadb.query(query, params)
      let countResult = await mariadb.query(countQuery, params)
      countResult = countResult[0]

      return {
        posts: postsResult,
        total_records: countResult ? countResult.total_records : 0
      }
    } catch (err) {
      err.file = __filename
      err.func = 'getFavoritePosts'
      throw err
    }
  },

  /**
   * Retrieves a list of comments for a specific post.
   * Comments are sorted in descending order according to the creation date.
   * @param {number} post_id 
   * @param {number} offset 
   * @param {number} page 
   * @returns {Object}
   *  * exists_post: boolean
   *  * comments: comments records | undefined
   *  * total_records: number | undefined
   */
  getCommentsOfAPost: async function(post_id, offset = 10, page = 0) {
    const commentsQuery = `
      select 
        posts.id as post_id,
        users.id as user_id,
        users.firstname,
        users.lastname,
        users.username,
        users.profile_img_src,
        post_comments.content,
        post_comments.image_src,
        post_comments.created_at
      from posts
      inner join post_comments
        on posts.id = post_comments.post_id
      inner join users
        on post_comments.user_id = users.id
      where posts.id = ?
      order by post_comments.created_at desc
      limit ?, ?;
    `
    const countQuery = `
      select count(*) as total_records
      from posts
      inner join post_comments
        on posts.id = post_comments.post_id
      inner join users
        on post_comments.user_id = users.id
      where posts.id = ?;
    `
    try {
      // Verify if post exists.
      const postQuery = `select id from posts where id = ? limit 1`
      const post = await mariadb.query(postQuery, [post_id])
      if (!post[0]) {
        return { exists_post: false }
      }

      const commentsResult = await mariadb.query(commentsQuery, [post_id, page*offset, offset])
      const countResult = await mariadb.query(countQuery, [post_id])

      return {
        exists_post: true,
        comments: commentsResult,
        total_records: countResult[0].total_records
      }
    } catch (err) {
      err.file = __filename
      err.func = 'getCommentsOfAPost'
      throw err
    }
  },

  /**
   * Given a group id, return the most recent publications made in the requested group. 
   * @param {number} userId 
   * @param {number} groupId 
   * @param {number} offset 
   * @param {number} page 
   * @returns {Promise<object>}
   *  * exit_code: number
   *  * group_posts: posts records | undefined
   *  * total_records: number | undefined
   */
  getPostsOfAGroup: async function(userId, groupId, offset = 10, page = 0) {
    const query = `
      select
        posts.id,
        users.username,
        users.firstname,
        users.lastname,
        users.profile_img_src,
        posts.content,
        posts.img_src,
        posts.post_type,
        posts.created_at,
        posts.like_counter,
        case 
          when (
            select id from favorite_posts 
            where post_id = posts.id and user_id = ?
            limit 1
          ) is not null then true
          else false
        end as liked_by_user,
        user_groups.name as group_name,
        user_groups.id as group_id,
        posts.referenced_post_id
      from group_posts
      inner join user_groups
        on group_posts.group_id = user_groups.id
      inner join posts
        on group_posts.post_id = posts.id
      inner join users
        on posts.user_id = users.id
      where user_groups.id = ?
      order by posts.created_at desc, posts.id desc
      limit ?, ?;
    `
    const args = [userId, groupId, page*offset, offset]

    // Prepare query to counts how much records there are.
    let countQuery = query.split('\n')
    // Remove selected fields and select the amount of records.
    countQuery.splice(2, 21, 'count(*) as total_records')
    // Remove limit to select all the records.
    countQuery.pop(); countQuery.pop()
    countQuery = countQuery.join('\n')
    
    try {
      // Verify if group exists.
      const q = `select id from user_groups where id = ?;`
      let groupExists = await mariadb.query(q, [groupId])
      groupExists = groupExists[0]
      if (groupExists === undefined) {
        return {
          exit_code: 1  // Group does not exist.
        }
      }

      let groupPosts = await mariadb.query(query, args)
      delete groupPosts.meta
      let countResult = await mariadb.query(countQuery, [groupId])
      countResult = countResult[0]
  
      return {
        exit_code: 0,
        group_posts: groupPosts,
        total_records: countResult.total_records
      }
    } catch (err) {
      err.file = __filename
      err.func = 'getPostsOfAGroup'
      throw err
    }
  },

  /**
   * Create a comment made on a certain post (user and group post type).
   * @param {number} postId 
   * @param {number} userId 
   * @param {Object} comment 
   *  * content: string
   *  * image: Object
   *    * path: string
   * @returns {Promise<Object>}
   *  * comment_id: number
   *  * content: string 
   *  * image_src: string
   *  * created_at: string
   */
  createComment: async function(postId, userId, comment) {
    let cloudinaryId = null
    let cloudinaryImageSrc = null

    if (comment.image) {
      try {
        const resultUploadImage = await cloudinary.uploader.upload(comment.image.path)
        cloudinaryImageSrc = resultUploadImage.secure_url
        cloudinaryId = resultUploadImage.public_id
      } catch (err) {
        err.file = __filename
        err.func = 'createComment'
        err.cloudinary_id = cloudinaryId
        throw err
      } finally {
        fs.unlinkSync(comment.image.path)
      }
    }

    const args = [
      postId,
      userId,
      comment.content ?? '', 
      cloudinaryImageSrc ?? '', 
      cloudinaryId ?? ''
    ]
    const query = `
      insert into post_comments(post_id, user_id, content, image_src, cloudinary_id)
      values (?, ?, ?, ?, ?);
    `

    try {
      const queryCommentRes = await mariadb.query(query, args)
      const commentData = {
        comment_id: queryCommentRes.insertId,
        content: comment.content,
        image_src: cloudinaryImageSrc,
        created_at: new Date().toISOString().slice(0, 10)
      }
      return commentData
    } catch (err) {
      err.file = __filename
      err.func = 'createComment'
      err.cloudinary_id = cloudinaryId
      throw err
    }
  }
}
