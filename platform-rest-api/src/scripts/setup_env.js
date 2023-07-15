const mariadb = require('mariadb')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const Logger = require('../lib/logger')

const rootDir = path.join(__dirname, '..', '..')

logger = new Logger({
  process: 'Setup environment script',
  method: 'Command line',
  logpath: path.join(rootDir, 'logs', 'setup_env_script.log'),
  writeToStdout: false,
  writeToFile: true
})

//--------------------------Useful functions.-------------------------

//Parse de command line arguments into an object.
function parseArgs(args) {
  let keyConversion = {
    '--db-user': 'db_user',
    '--db-passwd': 'db_passwd',
    '--force-reconf': 'force_reconf',
    '--reconf-target': 'reconf_target', //target must be given only separated by comma. Values: env|db|certs|conf-file
    '--db-port': 'db_port',
    '--cd-cloud-name': 'cd_cloud_name',
    '--cd-api-key': 'cd_api_key',
    '--cd-api-secret': 'cd_api_secret',
    '--help': 'help'
  }

  let parsedArgs = {}

  //args start at index 2.
  if(args.length >= 3) {
    for(let i = 2; i < args.length; i++) {
      //Split eache argument into key value format.
      let keyVal = args[i].split('=')
      if(keyConversion[keyVal[0]]) {
        parsedArgs[ keyConversion[ keyVal[0] ] ] = keyVal[1] || true
      } else {
        console.log(`${keyVal[0]} is not a supported option. It will be skipted.`)
      }
    }
  } else {
    console.log(`This script needs arguments to work. Read the documentation in docs/SCRIPTS.md or use --help`)
    process.exit(1) //No arguments error.
  }

  if(parsedArgs.force_reconf) {
    if(!parsedArgs.reconf_target || parsedArgs.reconf_target === true) {
      console.log('Using --force-reconf without --reconf-target is equivalent to reconfigure all.')
      parsedArgs.reconf_target = []
    } else {
      parsedArgs.reconf_target = parsedArgs.reconf_target.split(',')
    }
  }

  if(!parsedArgs.db_user && !parsedArgs.help) {
    console.log(`You need provide the --db-user and --db-passwd options.`)
    process.exit(2) //Required options not provided.
  }
  return parsedArgs
}

function loadEnvVars() {
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

//Sets up the environment
function setupEnv(user, passwd, dbPort, cdCloudName, cdApiKey, cdApiSecret, force_reconf) {
  //Default env vars configuratons.
  let envConf = [
    'MARIADB_HOST=localhost',
    `MARIADB_USER=${user}`,
    `MARIADB_PASS=${passwd || ''}`,
    'MARIADB_DATABASE=academic_network',
    'IANA_TIMEZONE=America/Cancun',
    'PORT=3000',
    `MARIADB_PORT=${dbPort || '3306'}`,
    `CLOUDINARY_CLOUD_NAME=${cdCloudName || '*'}`,
    `CLOUDINARY_API_KEY=${cdApiKey || '*'}`,
    `CLOUDINARY_API_SECRET=${cdApiSecret || '*'}`
  ].join('\n') + '\n'
  let dotEnvPath = path.join(rootDir, 'etc', '.env')

  if(force_reconf) {
    //Reconfiguring.
    console.log('Reconfiguring.')
    fs.writeFileSync(dotEnvPath, envConf)

    // Checks if some Cloudinary env var it was not provided.
    let cloudinaryErrorMsg = `No value was provided for ENV_VAR env var. '*' will be set as the default value and you must configure it, otherwise some endpoints using Cloudinary services it won't work'`
    if (cdCloudName === undefined) {
      console.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_CLOUD_NAME'))
      logger.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_CLOUD_NAME'))
    }
    if (cdApiKey === undefined) {
      console.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_KEY'))
      logger.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_KEY'))
    }
    if (cdApiSecret === undefined) {
      console.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_SECRET'))
      logger.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_SECRET'))
    }
  }
  //Load env vars and check for missing vars.
  envResult = loadEnvVars()

  try {
    if(envResult.missing_env_vars.length) {
      console.log('Missing env vars.')
      //Adding missing conf.
      console.log('Adding missing vars.')
      let cloudinaryErrorMsg = `Env var ENV_VAR doesn't exist and it wasn't provided a value to create it. '*' will be set as the default value and you must configure it, otherwise some endpoints using Cloudinary services it won't work`

      fs.appendFileSync(dotEnvPath, '\n')
      for(let evar of envResult.missing_env_vars) {
        let conf = ''
        switch(evar) {
          case 'MARIADB_HOST':
            conf = 'MARIADB_HOST=localhost'
            break
          case 'MARIADB_USER':
            conf = `MARIADB_USER=${user}`
            break
          case 'MARIADB_PASS':
            conf = `MARIADB_PASS=${passwd || ''}`
            break
          case 'MARIADB_DATABASE':
            conf = 'MARIADB_DATABASE=academic_network'
            break
          case 'IANA_TIMEZONE':
            conf = 'IANA_TIMEZONE=America/Cancun'
            break
          case 'PORT':
            conf = 'PORT=3000'
            break
          case 'MARIADB_PORT':
            conf = `MARIADB_PORT=${dbPort || '3306'}`
            break
          case 'CLOUDINARY_CLOUD_NAME':
            if (!cdCloudName) {
              console.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_CLOUD_NAME'))
              logger.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_CLOUD_NAME'))
            }
            conf = `CLOUDINARY_CLOUD_NAME=${cdCloudName || '*'}`
            break
          case 'CLOUDINARY_API_KEY':
            if (!cdApiKey) {
              console.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_KEY'))
              logger.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_KEY'))
            }
            conf = `CLOUDINARY_API_KEY=${cdApiKey || '*'}`
            break
          case 'CLOUDINARY_API_SECRET':
            if (!cdApiSecret) {
              console.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_SECRET'))
              logger.log(cloudinaryErrorMsg.replace('ENV_VAR', 'CLOUDINARY_API_SECRET'))
            }
            conf = `CLOUDINARY_API_SECRET=${cdApiSecret || '*'}`
            break
        }
        fs.appendFileSync(dotEnvPath, conf + '\n')
      }
    } else {
      console.log('No missing env vars.')
    }
  } catch(err) {
    console.log('An unexpected error have ocurred:')
    console.log(err)
    console.log('Leaving process.')
    process.exit(3) //Error trying to write env vars.
  }

  envResult = loadEnvVars()
  if(!envResult.envVarsLoaded) {
    console.log('Environment setup gone wrong. Following env vars could not be written:')
    console.log(envResult.missing_env_vars.join('\n'))
    console.log('leavinv process.')
    process.exit(4) //Error trying to configure env vars.
  }

  console.log('Env setup done.')
  logger.log('Env setup done.')
}

function createDBConn() {
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

function parseSPScript(scriptname) {
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

async function createDB(conn) {
  console.log('Creating DB, tables and SPs if they do not exist.')
  await execSQLScript(conn, 'db.sql')
  console.log('DB and tables created.')
  await conn.query(parseSPScript('stored_procedures.sql'))
  console.log('SPs loaded.')
}

async function setupDB(force_reconf) {
  let conn
  try {
    conn = await createDBConn()
    let dbresult = await conn.query('show databases')
    let db_exists = false
    for(let db of dbresult) {
      if(db.Database == 'academic_network') {
        db_exists = true
        break
      }
    }

    //If DB exists and reconfiguration is forced.
    if(db_exists && force_reconf) {
      console.log('Reconfiguring DB...')
      await conn.query('drop database academic_network')
      console.log('DB dropped.')
    }

    await createDB(conn)

    if(!db_exists || force_reconf) {
      let initResult = await execSQLScript(conn, 'db_initial_setup.sql')
      let apiKey = ''
      for(let i = 0; i < initResult.length; i++){
        if(initResult[i][0]) {
          if(initResult[i][0].api_key) {
            apiKey = initResult[i][0].api_key
            break;
          }
        }
      }
      console.log('Initial setup done.')
      console.log(`API Key: ${apiKey}`)
      logger.log(`API KEY: ${apiKey}`)
    }

    conn.end()
    console.log('DB setup done.')
    logger.log('DB setup done.')
  } catch(err) {
    if(err.code == 'ECONNREFUSED') {
      console.log('Please ensure your DB server is running or you have set an appropriate port.')
      console.log('DB Setup failed.')
      logger.log('Please ensure your DB server is running or you have set an appropriate port.')
      logger.error(err)
    } else if(err.code == 'ER_ACCESS_DENIED_ERROR') {
      let message = `Access denied to DB. Ensure your credentials are valid.`
      console.log(message)
      console.log(err)
      logger.log(message)
      logger.error(err)
    } else {
      console.log('An unexpected error have ocurred:')
      console.log(err)
      conn.end()
      logger.log('Error trying to setup the DB.')
      logger.error(err)
    }
    console.error('DB setup NOT DONE.')
    logger.log('DB setup NOT DONE.')
    //process.exit(5) //Error trying to configure DB.
  }
}

function mustReconf(reconf_target, target) {
  return (reconf_target.indexOf(target) != -1 || reconf_target.length == 0)
}

function createKeyPair(certsPath) {
  let privKeyPath = `${path.join(certsPath, 'academic_network')}`
  childProcess.execSync(`ssh-keygen -q -f ${privKeyPath} -t rsa -m PEM -N ""`, { encoding: 'utf8', input: 'y' })
  let publicKeyPath = path.join(certsPath, 'academic_network.pem')
  childProcess.execSync(`ssh-keygen -e -f ${privKeyPath} -m PEM > ${publicKeyPath}`, { encoding: 'utf8' })
}

function setupCerts(force_reconf) {
  try {
    if(force_reconf) {
      let certsPath = path.join(rootDir, 'certs')
      if(!fs.existsSync(certsPath)) {
        fs.mkdirSync(certsPath)
      }
      createKeyPair(certsPath)
    } else {
      //Trying access to RSA certificates.
      fs.accessSync(path.join(rootDir, 'certs', 'academic_network'), fs.constants.R_OK)
      fs.accessSync(path.join(rootDir, 'certs', 'academic_network.pem'), fs.constants.R_OK)
      console.log('RSA certificates found and accessible.')
    }
    console.log('Certs setup done.')
    logger.log('Certs setup done.')
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
        logger.log('Certs setup done.')
        return
      case 'EACCES':
        console.log(`Access denied to this RSA certificate: ${err.path}`)
        console.log('Please give it read permissions.')
        logger.log(`Access denied to this RSA certificate: ${err.path}`)
        logger.error(err)
        break
      default:
        console.error(err)
        console.error('An error has ocurred trying to setup the certs.');
        logger.log('An error has ocurred trying to setup the certs.')
        logger.error(err)
    }
    console.log('Certs setup NOT DONE.')
    logger.log('Certs setup NOT DONE.')
  }
}

function getConfigFile() {
  let res = { success: false }
  try {
    res.config = require(path.join(rootDir, 'etc', 'conf.json'))
    res.success = true
  } catch(err) {
    console.log('conf.json not found')
  }
  return res
}

function setupConfigFile(force_reconf) {
  let configFile =
`{
  "path_tracking": {
    "write_to_file": true,
    "write_to_stdout": true
  },
  "session": {
    "expires_in": "7 days"
  },
  "db": {
    "conn_limit": 50
  },
  "moment": {
    "language": "es"
  }
}
`

  let confPath = path.join(rootDir, 'etc')
  let conf = getConfigFile()

  if(!conf.success || force_reconf) {
    console.log('Configuring conf.json')
    if(!fs.existsSync(confPath)) {
      fs.mkdirSync(confPath)
    }
    fs.writeFileSync(path.join(confPath, 'conf.json'), configFile)
  } else {
    console.log('conf.json found. Checking for missing attributes.')

    conf = conf.config
    let somethingMissing = false

    if(conf.path_tracking) {
      if(!conf.path_tracking.write_to_file) {
        conf.path_tracking.write_to_file = true
        somethingMissing= true
      }
      if(!conf.path_tracking.write_to_stdout) {
        conf.path_tracking.write_to_stdout = true
        somethingMissing= true
      }
    } else {
      conf.path_tracking = {
        write_to_file: true,
        write_to_stdout: true
      }
      somethingMissing= true
    }

    if(conf.session) {
      if(!conf.session.expires_in) {
        conf.session.expires_in = '7 days'
        somethingMissing= true
      }
    } else {
      conf.session = {
        expires_in: '7 days'
      }
      somethingMissing= true
    }

    if(conf.db) {
      if(!conf.db.conn_limit) {
        conf.db.conn_limit = 50
        somethingMissing= true
      }
    } else {
      conf.db = {
        conn_limit: 50
      }
      somethingMissing= true
    }

    if(conf.moment) {
      if(!conf.moment.language) {
        conf.moment.language = 'es'
        somethingMissing= true
      }
    } else {
      conf.moment = {
        language: 'es'
      }
      somethingMissing= true
    }

    if(somethingMissing) {
      console.log('Missing attributes found. Creating them.')
      fs.writeFileSync(path.join(confPath, 'conf.json'), JSON.stringify(conf))
    } else {
      console.log('Missing attributes were not found.')
    }
  }
  console.log('Conf-file setup done.')
  logger.log('Conf-file setup done.')
}

function help() {
  let message = `
  Description: Creates the configuration file, certificates, environment variables and runs the database scripts to initialize it.
  By default only perform missing configurations. You need to provide at least the user database and their password when use this script.

  Option follow this format: [option name]=[value]. The value must not have spaces. If the option allow a list of option, each value
  must be separated by a comma.

  A extended version can be found at docs/SCRIPTS.md

  Options:

  * --db-user

  User database.

  * --db-passwd

  Password of the above user.

  * --force-reconf

  No arguments are required for this. When this flag is present overwrite all existing configuration, if --reconf-target
  is not given.

  * --reconf-target

  Indicates what elements of the environment configuration reconfigurate. Values can be: env|db|certs|conf-file

  * --cd-cloud-name

  Indicates the Cloud name of your Cloudinary account.

  * --cd-api-key

  Indicates the API Key of your Cloudinary account.

  * --cd-api-secret

  Indicates the API Secret of your Cloudinary account.

  * --help

  Display this documentation.

  `

  console.log(message)
}

//--------------------------Script.-------------------------

async function main() {
  let args = parseArgs(process.argv)

  if(args.help) {
    help()
    return 0
  }

  let forceReconf = false;
  if(args.force_reconf) {
    forceReconf = mustReconf(args.reconf_target, 'env')
  }

  setupEnv(args.db_user, args.db_passwd, args.db_port, args.cd_cloud_name, args.cd_api_key, args.cd_api_secret, forceReconf)

  forceReconf = false;
  if(args.force_reconf) {
    forceReconf = mustReconf(args.reconf_target, 'db')
  }

  await setupDB(forceReconf)

  forceReconf = false;
  if(args.force_reconf) {
    forceReconf = mustReconf(args.reconf_target, 'certs')
  }

  setupCerts(forceReconf)

  forceReconf = false;
  if(args.force_reconf) {
    forceReconf = mustReconf(args.reconf_target, 'conf-file')
  }

  setupConfigFile(forceReconf)

  logger.write()
  console.log('Setup finished.')
}

main()
