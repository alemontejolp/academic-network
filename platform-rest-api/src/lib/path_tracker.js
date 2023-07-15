const Logger = require('./logger')
const moment = require('moment')

class PathTracker extends Logger{
  constructor(conf) {
    super(conf)
    this.time = moment()
  }

  computeLog() {
    let log = `--- Process [${moment().format('YYYY-MM-DD HH:mm:ss')}] [${this.method}]: ${this.process}.\n`
    for (let m of this.queue) {
      log += `-> ${m}\n`
    }
    log += `--- Process ended on time: (${moment().diff(this.time)}).`
    return log
  }
}

module.exports = PathTracker
