const { 
  Validator, 
  parseValidatorOutput, 
  parseNumberFromGroupIfApplic,
  parseNumberIfApplicable
} = require('../services/validator.service')

module.exports = {
  checkPaginationParams: function(req, res, next) {
    let validator = new Validator()
    req.query = parseNumberFromGroupIfApplic(req.query)

    validator(req.query).isObject(obj => {
      obj('offset').isNumber().integer().isPositive()
      obj('page').isNumber().integer().notNegative()
    })

    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    
    next()
  },

  checkPostId: function(req, res, next) {
    req.params.post_id = parseNumberIfApplicable(req.params.post_id)
    
    let validator = new Validator()
    validator(req.params).required().isObject( obj => {
      obj('post_id').required().isNumber().integer().isPositive()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    next()
  },

  checkCommentInPostData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body.content).isString().display('content')

    // FileUploader will use the 'image'-named field, if a file is sent in this field FileUploader
    // will "send the image" in req.files.image so req.body.image will have undefined value, but 
    // if a file is not sent in the field 'image' req.files.image will be undefined and 
    // req.body.image will have a value so it is necessary to validate it.
    //If no file is sent, req.files will be undefined as well.
    if (!req.files) {
      req.files = {}
    }
    validator(req.files.image).isObject().display('image')
    if (req.body.image) {
      validator(req.body.image).isObject().display('image')
    }
    
    let errors = parseValidatorOutput(validator.run())
    if (errors.length != 0) {
      if (req.files.image) {
        fs.unlinkSync(req.files.image.path)
      }
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    
    next()
  }
}
