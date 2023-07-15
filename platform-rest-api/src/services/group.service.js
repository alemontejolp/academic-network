const cloudinary = require('cloudinary').v2
const fs = require('fs')
const mariadb = require('./mariadb.service')
const logService = require('./log.service')
const notificationService = require('./notification.service')

/**
 * Add the permissions in to a certain group, all by id.
 * @param {MariaDBConnection} conn 
 * @param {int} groupId 
 * @param {Array<int>} permissions 
 */
async function addPermissionToGroup(conn, groupId, permissions) {
  let query = `call group_grant_permission(?, ?)`
  
  try {
    if (!conn) {
      //Internal error.
      let errmsg = 'DB connection was not provided'
      throw new Error(errmsg)
    } if(!groupId) {
      //Internal error.
      let errmsg = 'Group id was not provided'
      throw new Error(errmsg)
    } if(!permissions.length) {
      //Internal error.
      let errmsg = 'At least one permission is required'
      throw new Error(errmsg)
    }
    let res = {}
    for(let perm of permissions) {
      res = await conn.query(query, [groupId, perm])
      res = res[0][0]
      if(res.exit_code != 0) {
        break
      }
    }
    return res
  } catch(err) {
    err.func = 'addPermissionToGroup'
    err.file = __filename
    throw err
  }
}


/**
 * Add tags to a certain group by group id.
 * @param {MariaDBConnection} conn 
 * @param {int} groupId 
 * @param {Array<string>} tags 
 */
async function addTagsToGroup(conn, groupId, tags) {
  let query = `
  insert into group_tags 
    (group_id, tag)
  values
  `
  
  try {
    if (!conn) {
      //Internal error.
      let errmsg = 'DB connection was not provided'
      throw new Error(errmsg)
    } if(!groupId) {
      //Internal error.
      let errmsg = 'Group id was not provided'
      throw new Error(errmsg)
    } if(!tags.length) {
      //Internal error.
      let errmsg = 'At least one tag is required'
      throw new Error(errmsg)
    }
    query += '(?, ?)'
    let args = [groupId, tags[0]]
    for(let i = 1; i < tags.length; i++) {
      query += ', (?, ?)'
      args.push(groupId, tags[i])
    }
    return await conn.query(query, args)
  } catch(err) {
    err.func = 'addTagsToGroup'
    err.file = __filename
    throw err
  }
}

module.exports = {
  /**
   * Return the permissions that a group has.
   * @param {number} groupId 
   * @returns {Promise<Array<object>>}
   *  * id: number
   *  * name: string
   *  * codename: string
   */
  getGroupPermissions: async function(groupId) {
    //Select permission that the group has.
    let query = `
      select 
        gp.id,
        gp.name,
        gp.codename,
        case 
          when (
            select 
              pgtg.group_permission_id
            from permissions_granted_to_groups as pgtg
            where 
              pgtg.group_permission_id = gp.id and
              pgtg.group_id = ?
            limit 1
          ) is not null then 1
          else 0
        end as granted
      from group_permissions as gp`
    
    try {
      let permissions = await mariadb.query(query, [groupId])
      delete permissions.meta
      let exists_group = true

      //Verify if group exists.
      query = `select id from user_groups where id = ? limit 1`
      let group = await mariadb.query(query, [groupId])
      if(!group.length) {
        exists_group = false
      }
      
      return {
        exists_group,
        permissions
      }
    } catch(err) {
      err.file = __filename
      err.func = 'getGroupPermissions'
      throw err
    }
  },

  /**
   * Return an array of available permissions that can be
   * assigned to a group.
   * @returns {Promise<Object[]>}
   *  - id
   *  - name
   *  - codename
   */
  getAvailableGroupPermissions: async function() {
    let query = `
      select
        gp.id,
        gp.name,
        gp.codename
      from group_permissions as gp;
    `
    try {
      let availablePermissions = await mariadb.query(query)
      delete availablePermissions.meta
      return availablePermissions
    } catch(err) {
      err.file = __filename
      err.func = 'getAvailableGroupPermissions'
      throw err
    }
  },

  /**
   * Return information of a group such as who is its owner,
   * name, image, permissions, tags and so on.
   * @param {number} groupId 
   * @returns Object
   *  - exit_code: int
   *  - groupData: Objetc
   *    - owner_firstname: string
   *    - owner_firstname: string
   *    - owner_profile_img_src: string
   *    - group_name: string
   *    - group_image_src: string
   *    - group_description: string
   *    - group_visibility: string
   *    - group_created_at: string
   *  - permissions: Object[]
   *    - id: number
   *    - name: string
   *    - codename: string
   *  - tags: Object[]
   *    - tag: string
   */
  getGroupInformation: async function(groupId) {
    let groupPermissions = await this.getGroupPermissions(groupId)
    if(!groupPermissions.exists_group) {
      return {
        exit_code: 1 //Group does not exist.
      }
    }

    let query = `
      select
        usr.firstname as owner_firstname,
        usr.lastname as owner_lastname,
        usr.username as owner_username,
        usr.profile_img_src as owner_profile_img_src,
        grp.name as group_name,
        grp.image_src as group_image_src,
        grp.description as group_description,
        grp.visibility as group_visibility,
        grp.created_at as group_created_at
          from user_groups as grp
            inner join users as usr
              on grp.owner_user_id = usr.id
          where grp.id = ?
          limit 1;`
    try {
      let groupData = await mariadb.query(query, [groupId])
      
      //Query tags.
      query = `
        select
          tag
            from group_tags
            where group_id = ?;`
      let groupTags = await mariadb.query(query, [groupId])

      return {
        exit_code: 0,
        groupData: groupData[0],
        permissions: groupPermissions.permissions,
        tags: groupTags
      }
    } catch(err) {
      err.file = __filename
      err.func = 'getGroupInformation'
      throw err
    }
  },

  /**
   * Perform a search in the database retrieving all the group records that match with 'search' parameter.
   * It gets all groups or only the groups (public and private) that user belongs to.
   * The 'all' group relative type does not need user authentication.
   * It can selects chunks of records of 'offset' size. The chunk number is defined by 'page'.
   * It supports ascending and descending order by the group id.
   * @param {string} groupRelativeType 
   * @param {string} search 
   * @param {number} offset 
   * @param {number} page 
   * @param {number} asc 
   * @param {number} userId 
   * 
   * @returns {Object}
   *  * groups: Object. Groups records.
   *  * total_records: number
   */
  searchGroups: async function(groupRelativeType = 'all', search = '', offset = 10, page = 0, asc = 1, userId) {
    let query = `
      select 
        user_groups.id,
        user_groups.name,
        user_groups.image_src,
        user_groups.description
      from user_groups
      right join group_tags 
        on user_groups.id = group_tags.group_id
    `
    // groupRelativeType = all | user
    if (groupRelativeType == 'user') {
      query += `
        inner join group_memberships
          on user_groups.id = group_memberships.group_id
        where
          group_memberships.user_id = ${userId} AND
      `
    } else {
      query += `where`
    }
    query += `
        (user_groups.name regexp ?
        OR user_groups.description regexp ?
        OR group_tags.tag regexp ?)
      group by user_groups.id
      order by user_groups.id ${asc ? 'asc' : 'desc'}
      limit ?, ?;
    `

    search = search.split(' ').join('|')
    let args = [search, search, search, offset*page, offset]

    // Counts how much records there are.
    let countQuery = query.split('\n')
    // Remove selected fields and select the amount of records.
    countQuery.splice(2, 4, 'distinct count(*) over() as total_records')
    // Remove limit to select all the records.
    countQuery.pop(); countQuery.pop()
    countQuery = countQuery.join('\n')

    try {
      let groupsResult = await mariadb.query(query, args)
      args.pop(); args.pop()
      let countResult = await mariadb.query(countQuery, args)
      countResult = countResult[0]

      return {
        groups: groupsResult,
        total_records: countResult ? countResult.total_records : 0
      }
    } catch (err) {
      err.file = __filename
      err.func = 'searchGroups'
      throw err
    }
  },

  /** Creates a new group associating the userId as owner.
   * @param {int} userId 
   * @param {object} group 
   *  * group_name: string
   *  * image_src: string
   *  * description: string
   *  * visibility: string
   *  * permissions: Array<int>
   *  * tags: Array<string>
   * @returns Object
   *  * exit_code: int
   *  * message: string
   *  * id: int, if exit_code = 0
   */
  createGroup: async function(userId, group) {
    let query = `call group_create(?, ?, ?, ?, ?)` //exit codes: 1, 2.
    let args = [userId, group.group_name, group.image_src || '', group.description, group.visibility]
    let conn

    try {
      conn = await mariadb.getConnection()
      conn.beginTransaction()
      let groupRes = await conn.query(query, args)
      groupRes = groupRes[0][0]
      if(groupRes.exit_code != 0) {
        conn.rollback()
        conn.release()
        return groupRes
      }

      if (group.permissions && group.permissions.length > 0) {
        let addPermRes = await addPermissionToGroup(conn, groupRes.id, group.permissions)
        if(addPermRes.exit_code == 1) { //exit code 1 -> 3
          addPermRes.exit_code = 3
          return addPermRes
        }
      }

      if (group.tags && group.tags.length > 0) {
        await addTagsToGroup(conn, groupRes.id, group.tags)
      }

      conn.commit()
      conn.release()

      return groupRes
    } catch(err) {
      conn.rollback()
      conn.release()
      err.file = err.file || __filename
      err.func = err.func || 'createGroup'
      throw err
    }
  },

  /**
   * Turn on or turn off the group notifications which the user requesting belongs to.
   * @param {int} userId 
   * @param {int} group_id 
   * @param {int} state 
   * @returns {Object}
   *  * exit_code: int
   *  * message: string
   */
  switchGroupNotifications: async function(userId, group_id, state) {
    try {
      let query = 'call group_switch_notifications(?, ?, ?);' // exit codes: 1, 2.
      let result = await mariadb.query(query, [userId, group_id, state])
      return result[0][0]
    } catch (err) {
      err.file = __filename
      err.func = 'switchGroupNotifications'
      throw err
    }
  },

  /**
   * Update the group image. To do that the user requesting must be the group owner.
   * @param {int} group_id 
   * @param {Object} image An object with:
   *  - path: Path of image in the local files.
   * @param {int} userId 
   * @returns {Object}
   *  * exit_code: int
   *  * image_src: string. Only if exit_code = 0.
   */
  updateGroupImage: async function(group_id, image, userId) {
    let cloudinary_id = undefined

    try {
      let query = `
        select
          owner_user_id,
          cloudinary_id
        from user_groups
        where id = ?
        limit 1;
      `
      let resultQuery = await mariadb.query(query, [group_id])
      resultQuery = resultQuery[0]
      
      // Verify if the group exist and the user requesting is the group owner.
      if (!resultQuery) {
        return {
          exit_code: 1
        }
      } else if (resultQuery.owner_user_id != userId){
        return {
          exit_code: 2
        }
      }

      // If the group currently has an image, then it is deleted from Cloudinary.
      if (resultQuery.cloudinary_id) {
        cloudinary.uploader.destroy(resultQuery.cloudinary_id).catch( err => {
          err.file = __filename
          err.func = 'updateGroupImage'
          err.code = err.http_code
          err.method = 'cloudinary.uploader.destroy'
          err.process = `Removing image from Cloudinary`
          logService.crashReport(err)
        })
      }

      // Uploading the new image to Cloudinary.
      let resultUploadImage = await cloudinary.uploader.upload(image.path)
      cloudinary_id = resultUploadImage.public_id
      let image_src = resultUploadImage.secure_url

      // If all before is successfully complete so the group image is updated in the DB.
      query = `
        update user_groups
        set
          image_src = ?,
          cloudinary_id = ?
        where id = ?
        limit 1;
      `
      await mariadb.query(query, [image_src, cloudinary_id, group_id])
      
      return {
        exit_code: 0,
        image_src
      }
    } catch (err) {
      err.file = __filename
      err.func = 'updateGroupImage'
      err.cloudinary_id = cloudinary_id
      throw err
    }
  },

  /**
   * Add a user to a specific group.
   * @param {int} userId 
   * @param {int} group_id 
   * @returns {Object}
   *  * exit_code: int
   *  * message: string
   */
  addUserToGroup: async function(userId, group_id) {
    let query = `call group_add_user(?, ?);`
    let conn
    try {
      conn = await mariadb.getConnection()
      conn.beginTransaction()
      let addUserRes = await conn.query(query, [userId, group_id])
      addUserRes = addUserRes[0][0]

      if (addUserRes.exit_code == 3) {
        const message = `@${addUserRes.user_username} ha solicitado unirse a tu grupo ${addUserRes.group_name}.`
        const notifType = 'request_to_join_a_group'
        await notificationService.createNotification(
          conn,
          addUserRes.group_owner_user_id, 
          message, 
          notifType, 
          addUserRes.request_to_join_id
        )
      }
      
      conn.commit()
      return {
        exit_code: addUserRes.exit_code,
        message: addUserRes.message
      }
    } catch (err) {
      conn.rollback()
      err.file = __filename
      err.func = 'addUserToGroup'
      throw err
    } finally {
      if (conn) conn.release()
    }
  },

  /**
   * Creates a new post of type 'group'. The post can be a shared post of a 
   * public group post or user post.
   * @param {number} userId 
   * @param {number} groupId
   * @param {Object} post An object with:
   * - content: string.
   * - image: Object. An object with:
   *   - path: Path of image in the local files.
   * @param {number} referencedPostId
   */
  createPost: async function(userId, groupId, post, referencedPostId = null) {
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
      groupId,
      postData.content ?? '', 
      postData.img_src ?? '', 
      postData.cloudinary_id ?? '',
      referencedPostId ?? 0,
      'group'
    ]
    const query = `call group_post_create(?, ?, ?, ?, ?, ?, ?);`
    
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
   * Return the permissions that every endpoint has.
   * @param {number} 
   * @returns {Promise<Array<object>>}
   *  * id: number
   *  * endpoint: string,
   *  * group_permission_id: number
   *  * name: string
   *  * codename: string
   */
   getEndpointPermissions: async function() {
    let query = `
      select 
        gep.id,
        gep.endpoint,
        gep.group_permission_id,
        gp.name,
        gp.codename
      from group_endpoint_permissions as gep
      inner join group_permissions as gp
      on gep.group_permission_id = gp.id;
    `
    try {
      let permissions = await mariadb.query(query)
      delete permissions.meta
      return permissions
    } catch(err) {
      err.file = __filename
      err.func = 'getEndpointPermissions'
      throw err
    }
  },

  /**
   * Returns information about the membership of a user related to a certain group.
   * @param {number} userId 
   * @param {number} groupId 
   * @returns {Promise<object>}
   *  * exit_code: number
   *  * membershipInfo: Object | undefined,
   *    * is_member: boolean,
   *    * is_owner: boolean,
   *    * active_notifications: boolean,
   *    * created_at: string | null
   */
  getMembershipInfo: async function(userId, groupId) {
    const query = `
      select
        true as is_member,
        case 
          when gm.user_id = ug.owner_user_id then true
          else false
        end as is_owner,
        gm.active_notifications,
        gm.created_at
      from group_memberships as gm
      inner join user_groups as ug
        on gm.group_id = ug.id
      where gm.user_id = ? and gm.group_id = ?
      limit 1;
    `
    try {
      // Verify if group exists.
      const q = `select id from user_groups where id = ?;`
      let groupExists = await mariadb.query(q, [groupId])
      groupExists = groupExists[0]
      if (groupExists === undefined) {
        return {
          exit_code: 1  // Group does not exist.
        }
      }

      let membershipInfoRes = await mariadb.query(query, [userId, groupId])
      membershipInfoRes = membershipInfoRes[0]

      if (membershipInfoRes) {
        return {
          exit_code: 0,
          membershipInfo: {
            is_member: !!membershipInfoRes.is_member,
            is_owner: !!membershipInfoRes.is_owner,
            active_notifications: !!membershipInfoRes.active_notifications,
            created_at: membershipInfoRes.created_at
          }
        }
      }

      return {
        exit_code: 0,
        membershipInfo: {
          is_member: false,
          is_owner: false,
          active_notifications: false,
          created_at: null
        }
      }
    } catch (err) {
      err.file = __filename
      err.func = 'getMembershipInfo'
      throw err
    }
  },

  /**
   * 
   * @param {number} groupId 
   * @param {number} userId
   * @returns {Promise<object>}
   *  * visibility: string
   *  * user_is_member: boolean | null
   */
  groupVisibility: async function(groupId, userId = null) {
    let query = `
      select 
        ug.visibility
    `
    let args = [groupId]
    if (userId) {
      query += `,
        case
        when (
            select id
            from group_memberships as gm
            where gm.user_id = ? and gm.group_id = ?
            limit 1
          ) is not null then true
          else false
        end as user_is_member
      `
      args.unshift(userId, groupId)
    }
    query += `
      from user_groups as ug
      where ug.id = ?;
    `
    try {
      let result = await mariadb.query(query, args)
      result = result[0]

      return {
        visibility: result.visibility,
        user_is_member: userId ? !!result.user_is_member : null
      }
    } catch (err) {
      err.file = __filename
      err.func = 'groupVisibility'
      throw err
    }
  }
}
