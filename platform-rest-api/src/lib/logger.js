const moment = require("moment")
const fs = require('fs')
const path = require('path')

let rootDir = process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR

class Logger {
  constructor(conf = {}) {
    this.process = conf.process
    this.method = conf.method
    this.queue = (conf.queue) ? (conf.queue) : ([])
    this.logpath = (conf.logpath) ? (conf.logpath) : (path.join(rootDir, 'logs', 'logs.log'))
    this.dirname = path.dirname(this.logpath)
    this.writeToStdout = (typeof conf.writeToStdout == 'boolean') ? (conf.writeToStdout) : true
    this.writeToFile = (typeof conf.writeToFile == 'boolean') ? (conf.writeToFile) : false
  }

  log(message) {
    this.queue.push(message)
  }

  error(err) {
    this.queue.push('ERROR')
    this.queue.push(`CODE: ${err.code}`)
    this.queue.push(`MESSAGE: ${err.message}`)
    this.queue.push(`FUNCTION: ${err.func}`)
    this.queue.push(`FILE: ${err.file}`)
    this.queue.push(`STACK: ${err.stack}`)

    this.writeToFile = true
  }

  computeLog() {
    let log = `--- Process [${moment().format('YYYY-MM-DD HH:mm:ss')}] [${this.method}]: ${this.process}.\n`
    for (let m of this.queue) {
      log += `-> ${m}\n`
    }
    log += `------------------------------------------`
    return log
  }
  
  write() {
    let log = this.computeLog()
    if(this.writeToStdout) {
      console.log(log)
    }
    if(this.writeToFile) {
      log += '\n'
      try {
        fs.appendFileSync(this.logpath, log)
      } catch(err) {
        fs.mkdirSync(this.dirname, { recursive: true })
        fs.appendFileSync(this.logpath, log)
      }
    }
    this.queue = []
  }
}

module.exports = Logger
