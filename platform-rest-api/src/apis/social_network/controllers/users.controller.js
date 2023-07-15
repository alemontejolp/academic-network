const fs = require('fs')
const moment = require('moment')
const userService = require('../../../services/user.service')
const cryptService = require('../../../services/crypt.service')
const authService = require('../../../services/auth.service')
const conf = require('../../../../etc/conf.json')
const messages = require('../../../../etc/messages.json')
const errorHandlingService = require('../../../services/error_handling.service')
const postService = require('../../../services/post.service');

module.exports = {
  createStudent: async function(req, res) {
    let at_index = req.body.email.indexOf('@')
    if (!req.body.username) {
      req.body.username = req.body.email.substring(0, at_index)
    }
    if (!req.body.student_id) {
      req.body.student_id = req.body.email.substring(0, at_index)
    }
    req.body.passwd = cryptService.hash(req.body.passwd)
    try {
      let result = await userService.createStudent(req.body)
      
      if(result.exit_code == 0) {
        let token = await cryptService.generateJWT({ 
          user_id: result.user_id,
          username: req.body.username
        }, conf.session.expires_in)
        let publicUserData = await userService.getPublicUserData(req.body.email)

        return res.finish({
          code: result.exit_code,
          messages: [result.message],
          data: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            description: req.body.description || '',
            profile_img_src: publicUserData.profile_img_src,
            user_type_id: req.body.user_type_id,
            user_type_name: publicUserData.type_user,
            major_id: req.body.major_id,
            major_name: publicUserData.major,
            student_id: req.body.student_id,
            created_at: publicUserData.created_at,
            session_token: token
          }
        })
      }

      res.finish({
        code: result.exit_code,
        messages: [result.message]
      })

    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'createStudent'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  signIn: async function(req, res) {
    try {
      req.body.passwd = cryptService.hash(req.body.passwd)
      let userId = await authService.authUserByCrendent(req.body.username, req.body.passwd)
      if(!userId) {
        return res.status(406).finish({
          code: 1,
          messages: ['Invalid credentials']
        })
      }
      let publicUserData = await userService.getPublicUserData(req.body.username)
      let token = await cryptService.generateJWT({ 
        user_id: userId,
        username: publicUserData.username
      }, conf.session.expires_in)
      publicUserData.session_token = token
      res.finish({
        code: 0, 
        data: publicUserData,
        message: ['Done']
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'signIn'

      if(err.code == 'ENOENT') {
        req.api.logger.error(err)
        res.status(500).finish({
          code: 1000,
          messages: [messages.error_messages.e500]
        })
      }
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getPublicUserData: async function(req, res) {
    try {
      let resultUserData = await userService.getPublicUserData(req.params.username)

      if (!resultUserData) {
        res.status(404).finish({
          code: 1,
          messages: [`Username or email doesn't exists.`]
        })
      } else {
        resultUserData.created_at = moment(resultUserData.created_at).format("LL")

        res.finish({
          code: 0,
          data: resultUserData,
          messages: ['Done']
        })
      }
      
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPublicUserData'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  createPost: async function(req, res) {
    const post = {
      content: req.body.content
    }
    if (req.files && req.files.image) {
      post.image = {
        path: req.files.image.tempFilePath
      }
    }
    const referencedPostId = req.body.referenced_post_id
    if (!referencedPostId && !post.content && !post.image) {
      return res.status(400).finish({
        code: 1,
        messages: ['No data was sent']
      })
    }
    try {
      let resultPost = await userService.createPost(req.api.userId, post, referencedPostId)

      let statusHttp = 200
      if (resultPost.exit_code == 1) {
        // It's necessary add 1 to exit_code because the code 1 is already in use.
        resultPost.exit_code = 2
        statusHttp = 403
      }

      //Retrieve post data.
      let newPostData = {}

      if (resultPost.exit_code == 0) {
        newPostData = await postService.getPostData(
          resultPost.post_data.post_id, 
          true,
          req.api.userId
        )
        if (newPostData.referenced_post_id) {
          let referencedPost = await postService.getPostData(
            newPostData.referenced_post_id,
            false,
            req.api.userId
          )
          newPostData.referenced_post = referencedPost
          newPostData.referenced_post.liked_by_user = !!newPostData.referenced_post.liked_by_user
        } else {
          newPostData.referenced_post = null
        }
        delete newPostData.referenced_post_id
        newPostData.liked_by_user = !!newPostData.liked_by_user
      }
      //END Retrieve post data.

      res.status(statusHttp).finish({
        code: resultPost.exit_code,
        messages: [resultPost.message],
        data: newPostData
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'createPost'

      // If exist some Cloudinary env var not configured.
      if (err.http_code === 401) {
        req.api.logger.error(err)
        res.status(500).finish({
          code: 1001,
          messages: [messages.error_messages.e500]
        })
      }
      errorHandlingService.handleImageUploadError(req, res, err)
    }
  },
  
  searchUsers: async function(req, res) {
    const userRelativeType = req.query.user_relative_type
    const userId = req.api.userId
    if ((userRelativeType == 'followers' || userRelativeType == 'followed') && !userId) {
      return res.status(401).finish({
        code: 1,
        messages: ['User unauthenticated.']
      })
    }
    try {
      let result = await userService.searchUsers(
        userRelativeType, 
        req.query.page, 
        req.query.offset, 
        req.query.search, 
        req.query.asc,
        userId
      )

      res.finish({
        code: 0,
        messages: ['Done'],
        data: result
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'searchUsers'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getPublicUserTypes: async function(req, res) {
    try {
      let userTypes = await userService.getPublicUserTypes()
      res.finish({
        code: 0,
        messages: ['Done'],
        data: {
          user_types: userTypes
        }
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPublicUserTypes'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getMajorsData: async function(req, res) {
    try {
      let majors = await userService.getMajorsData()
      res.finish({
        code: 0,
        messages: ['Done'],
        data: {
          majors: majors
        }
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'getMajorsData'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  createComment: async function(req, res) {
    const comment = {
      content: req.body.content
    }
    if (req.files && req.files.image) {
      comment.image = {
        path: req.files.image.tempFilePath
      }
    }
    if (!comment.content && !comment.image) {
      return res.status(400).finish({
        code: 1,
        messages: ['No data was sent.']
      })
    }
    try {
      const postData = await postService.getPostData(req.params.post_id, false)
      if (!postData) {
        return res.status(404).finish({
          code: 2,
          messages: ['Post does not exist.']
        })
      }

      const typeOfPost = await postService.postBelongsToGroup(req.params.post_id)
      if (typeOfPost.group_id) {
        return res.status(400).finish({
          code: 3,
          messages: ['Error. This post belongs to a group. Use the proper API.']
        })
      }

      const commentData = await postService.createComment(
        req.params.post_id,
        req.api.userId,
        comment
      )
      const userData = await userService.getPublicUserData(req.api.username)

      res.status(200).finish({
        code: 0,
        messages: ['Done'],
        data: {
          post_id: req.params.post_id,
          comment_id: commentData.comment_id,
          user_id: req.api.userId,
          firstname: userData.firstname,
          lastname: userData.lastname,
          username: userData.username,
          profile_image_src: userData.profile_img_src,
          content: commentData.content,
          image_src: commentData.image_src,
          created_at: commentData.created_at
        }
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'createComment'
      
      // If exist some Cloudinary env var not configured.
      if (err.http_code === 401) {
        req.api.logger.error(err)
        res.status(500).finish({
          code: 1001,
          messages: [messages.error_messages.e500]
        })
      }
      errorHandlingService.handleImageUploadError(req, res, err)
    } finally {
      // It is necessary delete the image when the codes in the response are 2 and 3.
      if (comment.image) {
        fs.unlinkSync(comment.image.path)
      }
    }
  }
}
