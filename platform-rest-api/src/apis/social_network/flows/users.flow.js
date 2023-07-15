const fileUpload = require('express-fileupload')
const generalMidd = require('../../../middlewares/general.middleware')
const userMidd = require('../../../middlewares/users.middleware')
const postMidd = require('../../../middlewares/posts.middleware')
const userCtrl = require('../controllers/users.controller')

const rootDir = process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR
// FileUpload settings.
const fileUploadMidd = fileUpload({
  useTempFiles : true,
  tempFileDir : `${rootDir}/uploads/`,
  safeFileNames: true
})

module.exports = {
  signup: [
    generalMidd.verifyAPIKey,
    userMidd.checkSignUpData,
    userMidd.checkStudentSignUpData,
    userCtrl.createStudent
  ],

  signin: [
    generalMidd.verifyAPIKey,
    userMidd.checkSignInData,
    userCtrl.signIn
  ],

  getPublicUserData: [
    generalMidd.verifyAPIKey,
    userMidd.checkGetPublicUserDataParameter,
    userCtrl.getPublicUserData
  ],

  post: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    fileUploadMidd,
    userMidd.checkNewPostData,
    userCtrl.createPost
  ],
  
  searchUsers: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuthIfTokenSent,
    userMidd.checkSearchUserParams,
    userCtrl.searchUsers
  ],

  getPublicUserTypes: [
    generalMidd.verifyAPIKey,
    userCtrl.getPublicUserTypes
  ],

  getMajorsData: [
    generalMidd.verifyAPIKey,
    userCtrl.getMajorsData
  ],

  createComment: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    postMidd.checkPostId,
    fileUploadMidd,
    postMidd.checkCommentInPostData,
    userCtrl.createComment
  ]
}
