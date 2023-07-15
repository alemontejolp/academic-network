const fs = require('fs')
const cloudinary = require('cloudinary').v2
const logService = require('./log.service')
const messages = require('../../etc/messages.json')

module.exports = {
  handleErrorInRequest: function(req, res, err) {
    let reportToStdout = true
    if(!res.headersSent) {
      req.api.logger.error(err)
      res.status(500).finish({
        code: -5,
        messages: [messages.error_messages.e500]
      })
      reportToStdout = false
    }
    err.method = req.method
    err.process = req.api.endpoint.path
    logService.crashReport(err, reportToStdout)
  },

  handleImageUploadError: function(req, res, err) {
    // If the image uploaded still exists in local files then it will delete.
    if (req.files && req.files.image && fs.existsSync(req.files.image.tempFilePath)) {
      fs.unlinkSync(req.files.image.tempFilePath)
    }
    
    // If the image created in cloudinary services still exists then it will delete.
    if (err.cloudinary_id) {
      cloudinary.api.resource(err.cloudinary_id)
      .then(() => cloudinary.uploader.destroy(err.cloudinary_id))
      .then(() => err.cloudinary_id = undefined)
    }
    
    this.handleErrorInRequest(req, res, err)
 }
}
