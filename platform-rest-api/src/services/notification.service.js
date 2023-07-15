const mariadb = require('./mariadb.service')

module.exports = {
  createNotification: function(conn = null, user_target_id, message, notif_type, element_id) {
    let connProvided = true
    if (!conn) {
      connProvided = false;
      conn = mariadb.getConnection()
    }
    const query = `
      insert into 
        notifications(user_target_id, message, notif_type, element_id)
      values (?, ?, ?, ?);
    `
    const args = [user_target_id, message, notif_type, element_id]
    try {
      return conn.query(query, args)
    } catch (err) {
      err.func = 'createNotification'
      err.file = __filename
      throw err
    } finally {
      if (!connProvided) {
        conn.release()
      }
    }
  }
}