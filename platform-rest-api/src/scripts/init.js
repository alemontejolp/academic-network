/*
* Script to initialize the application in Docker.
*
* Environment variables for Docker initialization
*
* 'PLATFORM_WEBAPP_APIKEY'
* 'SCHOOL_DOMAIN'
* 'SCHOOL_MAJORS'
*/

const mariadb = require('mariadb')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const rootDir = path.join(__dirname, '..', '..')

function exit(code = 1) {
  console.log('Initialization failed. Leaving process...')
  process.exit(code)
}

function checkEnvVars() {
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
    'CLOUDINARY_API_SECRET',
  ]

  //Loading env vars.
  //dotenv file shuld be in the root directory.
  let envResult = dotenv.config({ path: path.join(rootDir, 'etc', '.env') })
  let envVarsLoaded = false
  if(!envResult.error) {
    envVarsLoaded = true
  }

  //Checking for missing vars.
  let missing_env_vars = []
  for(let _var of env_vars_set) {
    if(!process.env[_var]) {
      missing_env_vars.push(_var)
    }
  }

  return {
    envVarsLoaded,
    missing_env_vars
  }
}

function createDbConn() {
  return mariadb.createConnection({
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASS,
    host: process.env.MARIADB_HOST,
    timezone: process.env.IANA_TIMEZONE,
    multipleStatements: true,
    port: process.env.MARIADB_PORT
  })
}

async function execSQLScript(conn, scriptname) {
  let SQLScript = fs.readFileSync(path.join(rootDir, 'src', 'scripts', scriptname), { encoding: 'utf8' })
  return await conn.query(SQLScript)
}

function cleanSPScript(scriptname) {
  let SQLScript = fs.readFileSync(path.join(rootDir, 'src', 'scripts', scriptname), { encoding: 'utf8' })
  let usableLines = []
  for(let line of SQLScript.split('\n')) {
    line = line.trim()
    //If line is not a comment.
    if(line[0] != '#' && line.substring(0, 2) != '--') {
      //Splits line into words and check if 'delimiter' key word is not present.
      line = line.split(' ')
      if(line[0] != 'delimiter') {
        //Changes symbol '$$' by a ';' if applicable.
        for(let i = 0; i < line.length; i++) {
          if(line[i] == '$$') {
            line[i] = ';'
          }
        }
        //If pass, it's a usable line.
        usableLines.push( line.join(' ') )
      }
    }
  }
  return usableLines.join('\n')
}

async function createDbSchema(conn) {
  console.log('Creating tables and SPs if they do not exist.')
  await execSQLScript(conn, 'db.sql')
  console.log('Tables created.')
  await conn.query(cleanSPScript('stored_procedures.sql'))
  console.log('SPs created.')
}

async function setupDb() {
  let conn
  let databaseName = process.env.MARIADB_DATABASE
  try {
    conn = await createDbConn()
    let dbresult = await conn.query('show databases')
    let dbInitialized = false
    let dbExists = false
    for(let db of dbresult) {
      // db.Database == 'academic_network'
      if(db.Database == databaseName) {
        dbExists = true
        await conn.query(`use ${databaseName}`)
        break
      }
    }

    if (!dbExists) {
      throw Error(`The database ${databaseName} does not exists.`)
    }

    await createDbSchema(conn)

    // Admin setup.
    await execSQLScript(conn, 'db_initial_setup.sql')

    if(process.env.SCHOOL_DOMAIN) {
      // Add school domain to the allowed domains.
      console.log('Allowing domain if not allowed before.')
      await conn.query(`call sp_domain_create("${process.env.SCHOOL_DOMAIN}")`)
    } else {
      console.log('SCHOOL_DOMAIN variable not found. Skipping domain initialization.')
    }

    if (process.env.SCHOOL_MAJORS) {
      // Create the majors of the school.
      console.log('Adding specified majors if do not exist.')
      let majorList = []
      for (let major of process.env.SCHOOL_MAJORS.split(',')) {
        major = major.trim()
        majorList.push(`call sp_add_major("${major}")`)
      }
      await conn.query(majorList.join(';'))
    } else {
      console.log('SCHOOL_MAJORS variable not found. Skipping major initialization.')
    }

    if (process.env.PLATFORM_WEBAPP_APIKEY) {
      // Add the api key for the platform web app.
      console.log('Adding API Key if not exists.')
      await conn.query(`call sp_add_api_key('Academic Network Web App', 'Platform Web App', 'platform_webapp@school.domain', '9999999999', '${process.env.PLATFORM_WEBAPP_APIKEY}');`)
    } else {
      console.log('PLATFORM_WEBAPP_APIKEY variable not found. Skipping API Key initialization.')
    }

    conn.end()
    console.log('DB setup done.')
  } catch(err) {
    if(err.code == 'ECONNREFUSED') {
      console.log('Please ensure your DB server is running or you have set an appropriate port.')
      console.log('DB Setup failed.')
    } else if(err.code == 'ER_ACCESS_DENIED_ERROR') {
      let message = `Access denied to DB. Ensure your credentials are valid.`
      console.log(message)
      console.log(err)
    } else {
      console.log('An unexpected error have ocurred:')
      console.log(err)
      conn.end()
    }
    console.error('DB setup NOT DONE.')
    exit(3)
  }
}

function createKeyPair(certsPath) {
  let privKeyPath = `${path.join(certsPath, 'academic_network')}`
  childProcess.execSync(`ssh-keygen -q -f ${privKeyPath} -t rsa -m PEM -N ""`, { encoding: 'utf8', input: 'y' })
  let publicKeyPath = path.join(certsPath, 'academic_network.pem')
  childProcess.execSync(`ssh-keygen -e -f ${privKeyPath} -m PEM > ${publicKeyPath}`, { encoding: 'utf8' })
}

function setupCerts() {
  try {
    //Trying access to RSA certificates.
    fs.accessSync(path.join(rootDir, 'certs', 'academic_network'), fs.constants.R_OK)
    fs.accessSync(path.join(rootDir, 'certs', 'academic_network.pem'), fs.constants.R_OK)
    console.log('RSA certificates found and accessible.')
    console.log('Certs setup done.')
  } catch(err) {
    switch(err.code) {
      case 'ENOENT':
        console.log('Creating missing certs.')
        let certsPath = path.join(rootDir, 'certs')
        if(!fs.existsSync(certsPath)) {
          fs.mkdirSync(certsPath)
        }
        createKeyPair(certsPath)
        console.log('Certs setup done.')
        return
      case 'EACCES':
        console.log(`Access denied to this RSA certificate: ${err.path}`)
        console.log('Please give it read permissions.')
        break
      default:
        console.error(err)
        console.error('An error has ocurred trying to setup the certs.');
    }
    console.log('Certs setup NOT DONE.')
    exit(4)
  }
}

async function main() {
  console.log('Initialization script starting.')
  let envVars = checkEnvVars()
  if (envVars.missing_env_vars.length != 0) {
    console.log(`Required environment variables are missing: ${envVars.missing_env_vars.join(', ')}`)
    exit(2)
  }
  await setupDb()
  setupCerts()
  console.log('Setup finished.')
}

main()
