const Logger = require('../lib/logger')
const path = require('path')

let rootDir = process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR

module.exports = {
  crashReport: function(err, toStdout = true) {
    logger = new Logger({
      method: err.method,
      process: err.process,
      logpath: path.join(rootDir, 'logs', 'crash_reports.log'),
      writeToFile: true,
      writeToStdout: toStdout
    })

    logger.error(err)
    logger.write()

    //Implements some mechanism to send an email to the  
    //server maintainers reporting this error.
  }
}
