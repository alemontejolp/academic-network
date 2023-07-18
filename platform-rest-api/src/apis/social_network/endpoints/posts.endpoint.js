const router = require('express').Router()
const postFlows = require('../flows/posts.flow')

router.get('/timeline', postFlows.postsForTimelime)
router.get('/post/:post_id', postFlows.getPostData)
router.get('/favorite', postFlows.favoritePosts)
router.get('/post/:post_id/comments', postFlows.getCommentsOfAPost)
router.get('/group/:group_id', postFlows.getPostsOfAGroup)
router.get('/user/:username', postFlows.getPostsOfUser)
router.put('/set-like/:post_id/:action', postFlows.setLikeStatus)

module.exports = router
