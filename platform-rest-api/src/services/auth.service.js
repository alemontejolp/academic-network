const mariadb = require('./mariadb.service')

module.exports = {
  /**
   * Retrieve the application data related to a API key.
   * @param {string} APIKey 
   * @returns {Object}
   */
  getAppDataByAPIKey: async function(APIKey) {
    try {
      let query = 'select appname, owner_name, email, phone from api_keys where api_key = ? limit 1'
      let result = await mariadb.query(query, [APIKey])
      return result[0]
    } catch(err) {
      err.file = __filename
      err.func = 'getAppDataByAPIKey'
      throw err
    }
  },

  /**
   * Retrieve the user id by user credentials. 
   * Returns the ID if user can be authenticated or null if not.
   * @param {string} username 
   * @param {string} passwd 
   * @returns {number | null}
   */
  authUserByCrendent: async function(username, passwd) {
    try {
      let query = 'select id from users where (username = ? or email = ?) and passwd = ? limit 1'
      let result = await mariadb.query(query, [username, username, passwd])
      return result[0].id
    } catch(err) {
      err.file = __filename
      err.func = 'authUserByCrendent'
    }
  }
}
