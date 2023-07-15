const cloudinary = require('cloudinary').v2
const fs = require('fs')
const mariadb = require('./mariadb.service')

module.exports = {
  /**
   * Creates a new user in the system.
   * @param {Object} user An object with:
   * - firstname: string.
   * - lastname: string.
   * - username: string.
   * - email: string.
   * - passwd: string.
   * - profile_img_src: string.
   * - description: string.
   * - user_type_id: int.
   */
  createUser: async function(user) {
    let at_index = user.email.indexOf('@')
    let domain_name = user.email.substring(at_index + 1)
    let args = [user.firstname, user.lastname, user.username, user.email, user.passwd, 
                user.profile_img_src || '', user.description || '', user.user_type_id, domain_name]
    try {
      let result = await mariadb.query('call sp_user_create(?,?,?,?,?,?,?,?, ?)', args)
      return result[0][0]
    } catch(err) {
      err.file = __filename
      err.func = 'createUser'
      throw err
    }
  },

  /**
   * Creates a new student in the system.
   * @param {Object} user An object with:
   * - firstname: string.
   * - lastname: string.
   * - email: string.
   * - passwd: string.
   * - profile_img_src: string.
   * - description: string.
   * - user_type_id: int.
   * - student_id: string.
   * - major_id: int
   */
  createStudent: async function(user) {
    //Setting data to create a new user.
    let at_index = user.email.indexOf('@')
    let domain_name = user.email.substring(at_index + 1)
    let createUserArgs = [user.firstname, user.lastname, user.username, user.email, user.passwd, 
                user.profile_img_src || '', user.description || '', user.user_type_id, domain_name]
    let conn
    try {
      //Getting a new connection that must be released at the end.
      conn = await mariadb.getConnection()
      //Start a transaction to perform the process because it is composed by two steps.
      conn.beginTransaction()
      //Calling the SP to create the user. First step.
      let createUserResult = await conn.query('call sp_user_create(?,?,?,?,?,?,?,?, ?)', createUserArgs)
      createUserResult = createUserResult[0][0]
      let result = createUserResult

      //If it gone well, perform the rest.
      if (createUserResult.exit_code == 0) {
        //Setting data to create a new student using the last user created.
        let createStudentArgs = [createUserResult.id, user.student_id, user.major_id]
        //Calling SP to create the student. Second step.
        let createStudentResult = await conn.query('call sp_create_student(?, ?, ?)', createStudentArgs)
        createStudentResult = createStudentResult[0][0]
        result = createStudentResult
        
        //If it gone well, commit the transaction, release the connection and return the response.
        if(createStudentResult.exit_code == 0) {
          conn.commit()
          conn.release()
          return {
            exit_code: 0,
            user_id: createUserResult.id,
            student_data_id: createStudentResult.id,
            message: "Done"
          }
        }

        //Because both SP start their exit codes at 0, is necessary avoid the codes of both overlap between them.
        //So, it's necessary adjust the exit code of the second SP, if applicable, assigning a exit code
        //starting by the next number of the last exit code of the first SP.
        //Read the documentation of "sp_user_create" and "sp_create_student" in the SQL database documentation. 
        //Also the documentation of this function in the services documentation for more details.
        if(result.exit_code == 3) {
          result.exit_code = 5;
        } else if(result.exit_code == 4) {
          result.exit_code = 6;
        } else {
          throw new Error(`Error trying to create a new student by a new user. 
                          sp_create_student's exit_code: ${result.exit_code}`)
        }
      }
      //If something gone wrong, rollback, release the connection and response what gone wrong.
      conn.rollback()
      conn.release()
      return result
    } catch(err) {
      //Something gone wrong with the connector.
      //Rollback, release and throw the error again.
      conn.rollback()
      conn.release()
      
      err.file = __filename
      err.func = 'createStudent'
      throw err
    }
  },

  /**
   * Return the user public information according of the user type.
   * @param {string} username Username or email.
   */
  getPublicUserData: async function (username) {
    try {
      let query = `
        SELECT 
          users.id,
          users.username,
          users.firstname,
          users.lastname,
          users.email,
          user_types.name AS 'type_user',
          users.description,
          users.profile_img_src,
          Date(users.created_at) AS 'created_at'
        FROM
          users
            INNER JOIN
          user_types ON users.user_type_id = user_types.id
        WHERE
          username = ? or email = ?
        LIMIT 1;`
      let resultUser = await mariadb.query(query, [username, username])
      let userData = resultUser[0]
      
      if (!userData) {
        return null;
      }

      // Determine if the user is a student, if so add his/her major and delete his/her email.
      query = `
        SELECT 
          majors.name
        FROM
          students_data
            INNER JOIN
          majors ON students_data.major_id = majors.id
        WHERE
          user_id = ?
        LIMIT 1;`
      let resultMajorStudent = await mariadb.query(query, userData.id)
      resultMajorStudent = resultMajorStudent[0]

      if (resultMajorStudent) {
        userData.major = resultMajorStudent.name
        userData.email = undefined
      }

      userData.id = undefined
      return userData
    } catch (err) {
      err.file = __filename
      err.func = 'getPublicUserData'
      throw err
    }
  },

  /**
   * Creates a new post of type 'user'. The post can be a shared post of a 
   * public group post or user post.
   * @param {int} userId 
   * @param {Object} post An object with:
   * - content: string.
   * - image: Object. An object with:
   *   - path: Path of image in the local files.
   * @param {number} referencedPostId
   */
  createPost: async function(userId, post, referencedPostId = null) {
    let postData = {}

    if (post.content) {
      postData.content = post.content;
    }

    if (post.image && !referencedPostId) {
      try {
        // The image is uploaded to cloudinary
        const resultUploadImage = await cloudinary.uploader.upload(post.image.path)
        postData.img_src = resultUploadImage.secure_url
        postData.cloudinary_id = resultUploadImage.public_id
      } catch (err) {
        err.file = __filename
        err.func = 'createPost'
        err.cloudinary_id = postData.cloudinary_id
        throw err
      } finally {
         // The local files are deleted.
        fs.unlinkSync(post.image.path)
      }
    }

    const args = [
      userId, 
      postData.content ?? '', 
      postData.img_src ?? '', 
      postData.cloudinary_id ?? '',
      referencedPostId ?? 0,
      'user'
    ]
    const query = 'call user_post_create(?, ?, ?, ?, ?, ?);'
    
    try {
      let queryPostRes = await mariadb.query(query, args)
      queryPostRes = queryPostRes[0][0]
      postData.post_id = queryPostRes.post_id
      delete postData.cloudinary_id
      return {
        exit_code: queryPostRes.exit_code,
        message: queryPostRes.message,
        post_data: queryPostRes.exit_code == 0 ? postData : {}
      }
    } catch (err) {
      err.file = __filename
      err.func = 'createPost'
      err.cloudinary_id = postData.cloudinary_id
      throw err
    }
  },

  /** 
   * Perform a search in the database retrieving all the user records that match with 'search' parameter.
   * It gets all users, followers or users followed by a target user. This can be set in 'userRelativeType' using: all|followers|followed.
   * The 'all' user relative type does not need user authentication.
   * It can selects chunks of records of 'offset' size. The chunk number is defined by 'page'.
   * It supports ascending and descending order by regiter date.
   * @param {string} userRelativeType 
   * @param {number} page 
   * @param {number} offset 
   * @param {string} search 
   * @param {number} asc 
   * @param {number} userTarget 
   * 
   * @returns {Object}
   *  * users: users records
   *  * total_records: number
   */
  searchUsers: async function(userRelativeType = 'all', page = 0, offset = 10, search = '', asc = 1, userTarget) {
    //userRelativeType = all|followers|followed
    let query = `
      select 
        users.username, 
        users.firstname, 
        users.lastname, 
        users.profile_img_src
      from users
        inner join user_types
          on users.user_type_id = user_types.id
    `
    if(userRelativeType != 'all') {
      query += `inner join followers `
      if(userRelativeType == 'followers') {
        //This select followers of targetUser.
        query += `on followers.follower_user_id = users.id `
        query += `where followers.target_user_id = ? and `
      } else if(userRelativeType == 'followed') {
        //This select users that userTarget follow.
        query += `on followers.target_user_id = users.id `
        query += `where followers.follower_user_id = ? and `
      }
    } else {
      query += `where `
    }

    search = search.split(' ').join('|')
    query += `(
      users.username regexp ? or
      users.firstname regexp ? or 
      users.lastname regexp ? or 
      users.email regexp ? or
      user_types.name regexp ? ) 
      order by users.id ${asc ? 'asc' : 'desc'}
      limit ?, ?;
    `
    let args = [ userTarget, search, search, search, search, search, page*offset, offset ]
    if(userRelativeType == 'all') {
      args.shift()
    }

    //Counts how much records there are.
    let countQuery = query.split(/[ |\n]/)

    for(let i = 0; i < countQuery.length; i++) {
      //Removes selected fields and select the amount of records.
      if(countQuery[i] == 'select') {
        countQuery[++i] = 'count(*) as total_records'
        i++
        while(countQuery[i] != 'from') {
          countQuery.splice(i, 1)
        }
      }
      //Remove limit to select all the records.
      if(countQuery[i] == 'order') {
        countQuery[i++] = ';'
        //Remove the remaining elements.
        countQuery.splice(i, countQuery.length - i)
        break
      }
    }

    countQuery = countQuery.join(' ')

    try {
      let result = await mariadb.query(query, args)
      args.pop(); args.pop()
      let countResult = await mariadb.query(countQuery, args)
      return {
        users: result,
        total_records: countResult[0].total_records
      }
    } catch(err) {
      err.file = __filename
      err.func = 'searchUsers'
      throw err
    }
  },

  /**
   * Retrieve the name and id of all the public user types.
   */
  getPublicUserTypes: async function() {
    let query = `
      select 
        user_types.name, 
        user_types.id 
      from public_user_types
        inner join user_types
          on user_types.id = public_user_types.user_type_id`
    try {
      let userTypes = await mariadb.query(query)
      return userTypes
    } catch(err) {
      err.file = __filename
      err.func = 'getPublicUserTypes'
      throw err
    }
  },

  getMajorsData: async function() {
    let query = `
      select
        majors.id,
        majors.name
      from majors`
    try {
      let majors = await mariadb.query(query)
      return majors
    } catch(err) {
      err.file = __filename
      err.func = 'getMajorsData'
      throw err
    }
  }
}
