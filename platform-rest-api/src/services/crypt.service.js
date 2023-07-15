const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

let publicKey = ''
let privateKey = ''
let rootDir = process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR

function getPublicKey() {
  try {
    if(publicKey == '' || !publicKey) {
      publicKey = fs.readFileSync(path.join(rootDir, 'certs', 'academic_network.pem'), { encoding: 'utf8' })
    }
    return publicKey
  } catch(err) {
    err.file = __filename
    err.func = 'getPublicKey'
    throw err
  }
}

function getPrivateKey() {
  try {
    if(privateKey == '' || !privateKey) {
      privateKey = fs.readFileSync(path.join(rootDir, 'certs', 'academic_network'), { encoding: 'utf8' })
    }
    return privateKey
  } catch(err) {
    err.file = __filename
    err.func = 'getPrivateKey'
    throw err
  }
}

module.exports = {
  generateJWT: async function(payload, expIn) {
    return jwt.sign(payload, getPrivateKey(), { expiresIn: expIn, algorithm: 'RS256' })
  },

  //Can throw exceptions. See: https://www.npmjs.com/package/jsonwebtoken
  verifyJWT: async function(token) {
    return jwt.verify(token, getPublicKey(), { algorithms: 'RS256' })
  },

  hash: function(data) {
    let hash = crypto.createHash('sha256')
    hash.update(data)
    return hash.digest('hex')
  }
}
