/**
 * This is the bootstrap file. Load the required modules to make work the application.
 */
const path = require('path')

process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR = path.join(__dirname, '..')
let rootDir = process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR
console.log(process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR)
 //Test the environment.
require('./scripts/verify_env')

//Including dependencies.
const express = require('express')
const moment = require('moment')
const cloudinary = require('cloudinary').v2
const generalMidd = require('./middlewares/general.middleware')
const cors = require('cors')
const conf = require('../etc/conf.json')

//General settings.
moment.locale(conf.moment.language);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

//Creating a express server.
const app = express()

//Setting gobal middlewares.
app.use(cors())
//app.use(generalMidd.allowExternalConnections)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(generalMidd.setResponseFormat)

//Setting for browsers to test CORS policy
app.use(function(req, res, next) {
  if(req.method == 'OPTIONS') {
    console.log('OPTIONS request caught. Responding status 200.')
    return res.status(200).end()
  }
  next()
})

//Importing APIs.
const socialNetworkAPI = require('./apis/social_network/interfaces')

//Setting middlewares for this API.
app.use('/v1/api/social-network', generalMidd.setLogger({
  logpath: path.join(rootDir, 'logs', 'social_network_api.log'),
  writeToFile: conf.path_tracking.write_to_file,
  writeToStdout: conf.path_tracking.write_to_stdout
}))
//Setting the API.
app.use('/v1/api/social-network', socialNetworkAPI)

module.exports = app
