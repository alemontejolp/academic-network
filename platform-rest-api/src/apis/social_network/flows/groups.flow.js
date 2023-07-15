const fileUpload = require('express-fileupload')
const generalMidd = require('../../../middlewares/general.middleware')
const groupMidd = require('../../../middlewares/groups.middleware')
const postMidd = require('../../../middlewares/posts.middleware')
const groupCtrl = require('../controllers/groups.controller')

const rootDir = process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR
// FileUpload settings.
const fileUploadMidd = fileUpload({
  useTempFiles : true,
  tempFileDir : `${rootDir}/uploads/`,
  safeFileNames: true
})

module.exports = {
  getGroupInformation: [
    groupMidd.checkGroupId,
    generalMidd.verifyAPIKey,
    groupCtrl.getGroupInformation
  ],

  searchGroups: [
    generalMidd.verifyAPIKey,
    groupMidd.checkSearchGroupsParams,
    generalMidd.userAuthIfTokenSent,
    groupCtrl.searchGroups
  ],

  createGroup: [
    generalMidd.verifyAPIKey,
    groupMidd.checkCreatingData,
    generalMidd.userAuth,
    groupCtrl.createGroup
  ],

  switchGroupNotifications: [
    generalMidd.verifyAPIKey,
    groupMidd.checkGroupId,
    generalMidd.userAuth,
    groupMidd.checkSwitchGroupNotificationsData,
    groupCtrl.switchGroupNotifications
  ],

  updateGroupImage: [
    generalMidd.verifyAPIKey,
    groupMidd.checkGroupId,
    generalMidd.userAuth,
    groupMidd.checkUpdateGroupImageData,
    fileUploadMidd,
    groupCtrl.updateGroupImage
  ],

  addUserToGroup: [
    generalMidd.verifyAPIKey,
    groupMidd.checkGroupId,
    generalMidd.userAuth,
    groupCtrl.addUserToGroup
  ],

  getAvailableGroupPermissions: [
    generalMidd.verifyAPIKey,
    groupCtrl.getAvailableGroupPermissions
  ],

  post: [
    generalMidd.verifyAPIKey,
    groupMidd.checkGroupId,
    generalMidd.userAuth,
    groupMidd.verifyPermissions,
    groupMidd.checkNewPostData,
    fileUploadMidd,
    groupCtrl.createPost
  ],

  getMembershipInfo: [
    generalMidd.verifyAPIKey,
    groupMidd.checkGroupId,
    generalMidd.userAuth,
    groupCtrl.getMembershipInfo
  ],

  createComment: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    postMidd.checkPostId,
    groupMidd.getGroupIdFromPostId,
    groupMidd.verifyPermissions,
    fileUploadMidd,
    postMidd.checkCommentInPostData,
    groupCtrl.createComment
  ]
}
