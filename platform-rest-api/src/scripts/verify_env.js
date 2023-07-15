/**
 * This script tests the environment where the application will be running
 * and load the env variables from a .env file if applicable. That is why
 * this sctipt must be executed before everything else in the bootstrap file of the application.
 * 
 * If the environment is not able to run properly the application, this script return with
 * 1 as exit code.
 */

const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

console.log('Executing environment review...')

let env_vars_set = [
'MARIADB_HOST',
'MARIADB_USER',
'MARIADB_PASS',
'MARIADB_DATABASE',
'IANA_TIMEZONE',
'PORT',
'MARIADB_PORT',
'CLOUDINARY_CLOUD_NAME',
'CLOUDINARY_API_KEY',
'CLOUDINARY_API_SECRET'
]

function exit() {
  console.log('Leaving process...')
  process.exit(1)
}

let rootDir = path.join(__dirname, '..', '..')

//Loading env vars.
//dotenv file should be in the /etc directory.
envResult = dotenv.config({ path: path.join(rootDir, 'etc', '.env') });
if(envResult.error) {
  console.log('An error has occurred while loading ENV VARS from .env file.')
  console.log('Using default ENV VARS.')
} else {
  console.log('ENV VARS loaded from .env successfully.')
}

//Testing required env vars.
let missing_env_vars = []
for(let _var of env_vars_set) {
  if(!process.env[_var]) {
    missing_env_vars.push(_var)
  }
}

if(missing_env_vars.length) {
  console.log(`Following env vars are required. Please set them with an appropriate value:`)
  console.log(missing_env_vars.join('\n'))
  console.log('Pleas read the "config" section in the documentation.')
  exit()
}

console.log('Required env vars found.')

//Testing access to conf.json.
try {
  fs.accessSync(path.join(rootDir, 'etc', 'conf.json'), fs.constants.R_OK)
  console.log('Config file found and accessible.')
} catch (err) {
  switch(err.code) {
    case 'ENOENT':
      console.log('conf.json file not found.')
      break
    case 'EACCES':
      console.log('Access denied to conf.json file. Please give it read permissions.')
      break
    default:
      console.error('An error has ocurred trying to read the conf.json file.');
  }
  console.log('Pleas read the "config" section in the documentation.')
  exit()
}

//Testing access to RSA certificates.
try {
  fs.accessSync(path.join(rootDir, 'certs', 'academic_network'), fs.constants.R_OK)
  fs.accessSync(path.join(rootDir, 'certs', 'academic_network.pem'), fs.constants.R_OK)
  console.log('RSA certificates found and accessible.')
} catch(err) {
  switch(err.code) {
    case 'ENOENT':
      console.log(`RSA Certificate not found: ${err.path}`)
      break
    case 'EACCES':
      console.log(`Access denied to this RSA certificate: ${err.path}`)
      console.log('Please give it read permissions.')
      break
    default:
      console.error('An error has ocurred trying to read the RSA certificates.');
  }
  exit()
}

//If flow has come until here, all it's ok.
console.log('All environment tests passed.')
