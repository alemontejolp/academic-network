const { 
  Validator, 
  parseValidatorOutput, 
  parseNumberFromGroupIfApplic,
  parseNumberIfApplicable 
} = require('../services/validator.service')

module.exports = {
  checkSignUpData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('firstname').required().isString()
      obj('lastname').required().isString()
      obj('username').isString().isMatch(/^[a-zA-Z0-9_\-]*$/)
      obj('email').required().isString().isEmail()
      obj('passwd').required().isString()
      obj('description').isString()
      obj('user_type_id').required().isNumber().integer()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    return next()
  },

  checkStudentSignUpData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('major_id').required().isNumber().integer()
      obj('student_id').isString().isMatch(/^[a-zA-Z0-9_\-]*$/)
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkNonStudentsSignUpData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('username').required().isString()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkSignInData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('username').required().isString()
      obj('passwd').required().isString()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkGetPublicUserDataParameter: function(req, res, next) {
    let validator = new Validator()
    validator(req.params).required().isObject( obj => {
      obj('username').required().isString()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkNewPostData: function(req, res, next) {
    req.body.referenced_post_id = parseNumberIfApplicable(req.body.referenced_post_id)
    
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('content').isString(),
      obj('referenced_post_id').isNumber().integer().isPositive()
    })

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
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },
  
  checkSearchUserParams: function(req, res, next) {
    let validator = new Validator()
    req.query = parseNumberFromGroupIfApplic(req.query)
    if(req.query.search != undefined) {
      req.query.search = req.query.search.toString()
    }
    validator(req.query).isObject(obj => {
      obj('page').isNumber().integer()
      obj('offset').isNumber().integer()
      obj('asc').isNumber().integer()
      obj('search').isString()
      obj('user_relative_type').isString().isIncludedInArray(['all', 'followers', 'followed', undefined])
      obj('asc').isNumber().integer()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  }
}
