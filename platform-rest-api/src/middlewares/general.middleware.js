//const Logger = require('../lib/logger')
const PathTracker = require('../lib/path_tracker')
const EventEmitter = require('events')
const cryptService = require('../services/crypt.service')
const authService = require('../services/auth.service')
const messages = require('../../etc/messages.json')
const errorHandlingService = require('../services/error_handling.service')

module.exports = {
  //Set an event emitter to response.api.events and
  //make available the method 'finish' that set a response
  //format for the REST APIs and emits a event when this
  //method has benn called. The event name is 'finished'.
  setResponseFormat: function(req, res, next) {
    res.api = { events: new EventEmitter() }
    res.finish = (r = {}) => {
      r = res.json({
        code: (r.code !== undefined && r.code !== null) ? (r.code) : (0),
        messages: r.messages || [],
        data: r.data || {}
      })
      res.api.events.emit('finished')
      return r
    };

    return next();
  },

  /**
   * Set a logger to req.api.logger and listen for the event
   * 'finished' on res.api.events to write in [conf.logpath] the logs stored
   * along the current process. By default, logs only will be writen in stdout, but
   * if logger's error method is called, logs will be writen in [conf.logpath] or
   * ~/logs/logs.log if [conf.logpath] is not provided.
   * @param {Object} conf an object with:
   * - logpath:string file where logs will be writen.
   * - writeToFile:bool if the logger should write to {logpath} file.
   * - writeToStdout:bool if the logger should write to stdout.
   * */
  setLogger: function(conf) {
    return (req, res, next) => {
      req.api = {};
      res.api.events.on('finished', () => {
        req.api.logger.log(`Status code sent: ${res.statusCode}`)
        req.api.logger.write()
      })

      req.api.endpoint = req._parsedUrl;
      req.api.logger = new PathTracker({
        process: req.api.endpoint.path,
        method: req.method,
        logpath: conf.logpath,
        writeToFile: conf.writeToFile,
        writeToStdout: conf.writeToStdout
      })

      return next()
    }
  },

  //Set headers to allow external connections.
  allowExternalConnections: function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "x-api-key, Authorization, Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Request-Method, X-Requested-With")
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE")
    res.header("x-api-key")
    return next()
  },

  userAuth: async function(req, res, next) {
    try {
      let payload = await cryptService.verifyJWT(req.headers.authorization)
      req.api.userId = payload.user_id
      req.api.username = payload.username
      return next()
    } catch(err) {
      if(err.name) {
        if(err.name == 'TokenExpiredError') {
          return res.status(403).finish({
            code: -2,
            messages: ['Authorization token expired']
          })
        } else if(err.name == 'JsonWebTokenError') {
          return res.status(403).finish({
            code: -3,
            messages: ['Invalid authorization token']
          })
        }
      }

      err.file = err.file || __filename
      err.func = err.func || 'userAuth'

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

  userAuthIfTokenSent: async function(req, res, next) {
    if (req.headers.authorization == undefined) {
      return next()
    }
    try {
      let payload = await cryptService.verifyJWT(req.headers.authorization)
      req.api.userId = payload.user_id
      return next()
    } catch(err) {
      if(err.name) {
        if(err.name == 'TokenExpiredError') {
          return res.status(403).finish({
            code: -2,
            messages: ['Authorization token expired']
          })
        } else if(err.name == 'JsonWebTokenError') {
          return res.status(403).finish({
            code: -3,
            messages: ['Invalid authorization token']
          })
        }
      }

      err.file = err.file || __filename
      err.func = err.func || 'userAuth'

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

  verifyAPIKey: async function(req, res, next) {
    try {
      let APIKey = req.headers['x-api-key']
      let appData = await authService.getAppDataByAPIKey(APIKey || '')
      if(!appData) {
        req.api.logger.log(`No valid API Key from: ${req.connection.remoteAddress}`)
        return res.status(403).finish({
          code: -4,
          messages: ['Your application is not allowed to use this service']
        })
      }

      req.api.logger.log(`Request from: ${appData.appname} [${APIKey}]`)
      return next()
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'verifyAPIKey'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  response200: async function(req, res, next) {
    res.status(200).end()
  }
}
