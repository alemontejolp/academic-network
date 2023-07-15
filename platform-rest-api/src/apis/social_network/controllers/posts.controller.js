const postService = require('../../../services/post.service')
const groupService = require('../../../services/group.service')
const errorHandlingService = require('../../../services/error_handling.service')
const messages = require('../../../../etc/messages.json')

/**
 * Prepares the array of posts that will be send in some API response.
 * Does the following changes for every post in the array:
 * If the post has a referenced post then:
 *  - Gets the post data of the referenced post and insert the data in 
 *  the referenced_post property.
 *  - liked_by_user property is changed to a boolean value.
 * If the post does not have a referenced post then the referenced_post property
 * will be null.
 * For every post, the referenced_post_id property is deleted from the response
 * and the liked_by_user property is changed to a boolean value.
 * @param {Array<Object>} posts 
 * @param {number} userId 
 */
async function preparePosts(posts, userId) {
  const lengthPosts = posts.length
  for (let i = 0; i < lengthPosts; i++) {
    let post = posts[i]
    if (post.referenced_post_id != null) {
      post.referenced_post = await postService.getPostData(
        post.referenced_post_id, 
        false, 
        userId
      )
      post.referenced_post.liked_by_user = !!post.referenced_post.liked_by_user
    } else {
      post.referenced_post = null
    }
    delete post.referenced_post_id
    post.liked_by_user = !!post.liked_by_user
  }
}

module.exports = {
  getPostsForTimeline: async function(req, res) {
    try {
      let result = await postService.getPostsForTimeline(
        req.api.userId,
        req.query.offset,
        req.query.page
      )
      let posts = result.posts
      await preparePosts(posts, req.api.userId)

      res.finish({
        code: 0,
        messages: [messages.success_messages.c200],
        data: {
          posts,
          total_records: result.total_records
        }
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPostsForTimeline'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getPostData: async function(req, res) {
    const userId = req.api.userId
    const postId = req.params.post_id

    try {
      const groupPost = await postService.postBelongsToGroup(postId)

      if (groupPost.group_private) {
        // User not authenticated
        if (userId === undefined) {
          return res.status(401).finish({
            code: 1,
            messages: [messages.error_messages.e401]
          })
        }
        // User authenticated
        const userIsMember = await postService.userBelongsToGroup(userId, groupPost.group_id)

        if (userIsMember) {
          const post = await postService.getPostData(postId, true, userId)
          if (post.referenced_post_id != null) {
            post.referenced_post = await postService.getPostData(post.referenced_post_id, false, userId)
            post.referenced_post.liked_by_user = !!post.referenced_post.liked_by_user
          } else {
            post.referenced_post = null
          }
          delete post.referenced_post_id
          post.liked_by_user = !!post.liked_by_user
          return res.finish({
            code: 0,
            messages: [messages.success_messages.c200],
            data: post
          })
        } else {
          return res.status(403).finish({
            code: 2,
            messages: [`Forbidden. The requested post belongs to a private group to which the user requesting doesn't belong.`]
          })
        }
      } 

      const post = await postService.getPostData(postId, true, userId)
      if (!post) {
        return res.status(404).finish({
          code: 3,
          messages: [messages.error_messages.e404]
        })
      }
      if (post.referenced_post_id != null) {
        post.referenced_post = await postService.getPostData(post.referenced_post_id, false, userId)
        post.referenced_post.liked_by_user = !!post.referenced_post.liked_by_user
      } else {
        post.referenced_post = null
      }
      delete post.referenced_post_id
      post.liked_by_user = !!post.liked_by_user
      return res.finish({
        code: 0,
        messages: [messages.success_messages.c200],
        data: post
      })
      
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPostData'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  favoritePosts: async function(req, res) {
    try {
      let result = await postService.getFavoritePosts(
        req.api.userId,
        req.query.offset,
        req.query.page
      )
      let posts = result.posts
      await preparePosts(posts, req.api.userId)

      res.finish({
        code: 0,
        messages: [messages.success_messages.c200],
        data: {
          favorite_posts: posts,
          total_records: result.total_records
        }
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'favoritePosts'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getCommentsOfAPost: async function(req, res) {
    const userId = req.api.userId
    const postId = req.params.post_id

    try {
      const groupPost = await postService.postBelongsToGroup(postId)
      
      if (groupPost.group_private && userId === undefined) {
        return res.status(401).finish({
          code: 1,
          messages: [messages.error_messages.e401]
        })
      }
      if (groupPost.group_private && userId) {
        const userIsMember = await postService.userBelongsToGroup(userId, groupPost.group_id)
        if (!userIsMember) {
          return res.status(403).finish({
            code: 2,
            messages: [`Forbidden. The requested post belongs to a private group to which the user requesting doesn't belong.`]
          })
        }
      }
      
      const resultComments = await postService.getCommentsOfAPost(
        postId, 
        req.query.offset, 
        req.query.page
      )
      if (!resultComments.exists_post) {
        return res.status(404).finish({
          code: 3,
          messages: [messages.error_messages.e404]
        })
      }

      res.status(200).finish({
        code: 0,
        messages: [messages.success_messages.c200],
        data: {
          comments: resultComments.comments,
          total_records: resultComments.total_records
        }
      })
      
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getCommentsOfAPost'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getPostsOfAGroup: async function(req, res) {
    try {
      const postsRes = await postService.getPostsOfAGroup(
        req.api.userId, 
        req.params.group_id, 
        req.query.offset, 
        req.query.page
      )

      if (postsRes.exit_code == 1) {
        return res.status(404).finish({
          code: 1,
          messages: ['Group does not exist.']
        })
      }

      const groupRes = await groupService.groupVisibility(req.params.group_id, req.api.userId)
      if (groupRes.visibility == 'private' && !groupRes.user_is_member) {
        return res.status(403).finish({
          code: 2,
          messages: ['Forbidden. User is not member of the private group.']
        })
      }

      let posts = postsRes.group_posts
      await preparePosts(posts, req.api.userId)

      res.finish({
        code: 0,
        messages: ['Done'],
        data: {
          group_posts: posts,
          total_records: postsRes.total_records
        }
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPostsOfAGroup'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  }
}
