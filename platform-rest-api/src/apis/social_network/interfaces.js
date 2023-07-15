const router = require('express').Router()
const userEndpoints = require('./endpoints/users.endpoint')
const groupEndpoints = require('./endpoints/groups.endpoint')
const postEndpoints = require('./endpoints/posts.endpoint')

router.use('/users', userEndpoints)
router.use('/groups', groupEndpoints)
router.use('/posts', postEndpoints)

module.exports = router
