-- use academic_network;

-- Validate the new user's data based on certain rules and if pass, create them.
-- Rules:
-- email not repeated.
-- username not repeated.
-- user type available.
-- email domain name allowed.

drop procedure if exists sp_user_create;
delimiter $$
create procedure sp_user_create (
	firstname varchar(70),
    lastname varchar(70),
    username varchar(50),
    email varchar(100),
    passwd varchar(300),
    profile_img_src varchar(700),
    description varchar(700),
    user_type_id int unsigned,
    domain_name varchar(255)
)
sp_user_create_label:begin
	declare exist_email int unsigned;
    declare exist_username int unsigned;
    declare exist_user_type int unsigned;
    declare exist_domain int unsigned;
    
    select id into exist_domain from allowed_domains as dom
    where dom.domain_name = domain_name limit 1;
    
    if exist_domain is null then
		select 
			1 as exit_code,
			"Domain name not allowed" as message;
		leave sp_user_create_label;
    end if;
    
    select id into exist_email from users as u
    where u.email = email limit 1;
    
    if exist_email is not null then
		select 
			2 as exit_code,
            "Email already exists" as message;
		leave sp_user_create_label;
	end if;
    
    select id into exist_username from users as u
    where u.username = username limit 1;
    
    if exist_username is not null then
		select 
			3 as exit_code,
            "Username already exists" as message;
		leave sp_user_create_label;
	end if;
    
    select id into exist_user_type from user_types as ut
    where ut.id = user_type_id limit 1;
    
    if exist_user_type is null then
		select 
			4 as exit_code,
            "This user-type id doesn't exist" as message;
		leave sp_user_create_label;
	end if;
    
	insert into users 
    (firstname, lastname, username, email,
    passwd, profile_img_src, description, user_type_id)
    values 
    (firstname, lastname, username, email,
    passwd, profile_img_src, description, user_type_id);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;
-- Create a new student.
drop procedure if exists sp_create_student;
delimiter $$
create procedure sp_create_student (
	user_id int unsigned,
    student_id varchar(50),
    major_id int unsigned
)
sp_create_student_label:begin
	declare exist_user_id int unsigned;
    declare exist_major_id int unsigned;
    declare exist_student int unsigned;
    declare exist_student_id int unsigned;
    
    select id into exist_student from students_data as sd
    where sd.user_id = user_id limit 1;
    
    if exist_student is not null then
		select
			1 as exit_code,
            "User already registered as student" as message;
		leave sp_create_student_label;
	end if;
    
    select id into exist_user_id from users as u
    where u.id = user_id limit 1;
    
    if exist_user_id is null then
		select
			2 as exit_code,
            "User doesn't exist" as message;
		leave sp_create_student_label;
	end if;
    
    select id into exist_major_id from majors as m
    where m.id = major_id limit 1;
    
    if exist_major_id is null then
		select
			3 as exit_code,
            "Major doesn't exist" as message;
		leave sp_create_student_label;
	end if; 
    
    select id into exist_student_id from students_data as sd
    where sd.student_id = student_id limit 1;
    
    if exist_student_id is not null then
		select
			4 as exit_code,
            "Student id already exists." as message;
		leave sp_create_student_label;
	end if; 
    
    insert into students_data (user_id, student_id, major_id)
    values (user_id, student_id, major_id);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;

-- Create a new user type if not repeated.
drop procedure if exists sp_user_type_create;
delimiter $$
create procedure sp_user_type_create (
	name varchar(255)
)
sp_user_type_create_label:begin
	declare exist_name int unsigned;
    
    select id into exist_name from user_types as ut
    where ut.name = name limit 1;
    
    if exist_name is not null then
		select
			1 as exit_code,
            "This name already exists" as message;
		leave sp_user_type_create_label;
	end if;
    
    insert into user_types (name)
    values (name);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;

-- Create a new allowed domain if isn't repeated.
drop procedure if exists sp_domain_create;
delimiter $$
create procedure sp_domain_create (
	domain_name varchar(255)
)
sp_domain_create_label:begin
	declare exist_domain int unsigned;
    
    select id into exist_domain from allowed_domains as dom
    where dom.domain_name = domain_name limit 1;
    
    if exist_domain is not null then
		select 
			1 as exit_code,
			"Domain name already exists" as message;
		leave sp_domain_create_label;
    end if;
    
    insert into allowed_domains (domain_name)
    values (domain_name);
    
    select
		0 as exit_code,
        last_insert_id() as id,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists sp_create_api_key;
delimiter $$
create procedure sp_create_api_key (
	appname varchar(100),
    owner_name varchar(100),
    email varchar(100),
    phone varchar(20)
)
sp_create_api_key_label:begin
	declare exist_email int unsigned;
    declare api_key varchar(255);
    
    select id into exist_email from api_keys as ak
    where ak.email = email limit 1;
    
    select sha2(concat(appname, owner_name, email, phone, now()), 256)
    into api_key;
    
    insert into api_keys (appname, api_key, owner_name, email, phone)
    values (appname, api_key, owner_name, email, phone);
    
    select
		0 as exit_code,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists sp_add_api_key;
delimiter $$
create procedure sp_add_api_key (
	appname varchar(100),
    owner_name varchar(100),
    email varchar(100),
    phone varchar(20),
    api_key varchar(255)
)
sp_add_api_key_label:begin
	declare exist_email int unsigned;
    declare exist_email_and_apikey int unsigned;
    -- declare api_key varchar(255);
    
    -- select id into exist_email from api_keys as ak
    -- where ak.email = email limit 1;
    select id into exist_email_and_apikey from api_keys as ak
    where ak.email = email and ak.api_key = api_key limit 1;

    if exist_email_and_apikey is not null then
        select 
			1 as exit_code,
			"The email is already associated with the API Key" as message;
		leave sp_add_api_key_label;
    end if;
    
    -- select sha2(concat(appname, owner_name, email, phone, now()), 256)
    -- into api_key;
    
    insert into api_keys (appname, api_key, owner_name, email, phone)
    values (appname, api_key, owner_name, email, phone);
    
    select
		0 as exit_code,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists group_permission_create;
delimiter $$
create procedure group_permission_create (
	name varchar(100),
    codename varchar(100)
)
gpc_label:begin
	declare name_exists int;
    declare codename_exists int;
    
    select id into name_exists from group_permissions as gp
    where gp.name = name limit 1;
    if name_exists is not null then
		select
			1 as exit_code,
            "Name already exists.";
		leave gpc_label;
	end if;
    
    select id into codename_exists from group_permissions as gp
    where gp.codename = codename limit 1;
    if codename_exists is not null then
		select
			2 as exit_code,
            "Codename already exists.";
		leave gpc_label;
	end if;
    
    insert into group_permissions (name, codename)
    values(name, codename);
    
    select
		0 as exit_code,
        "Done" as message,
        last_insert_id() as id;
end $$
delimiter ;

drop procedure if exists group_create;
delimiter $$
create procedure group_create (
	user_id int unsigned,
    gname varchar(100),
    image_src varchar(700),
    description varchar(700),
    visibility varchar(15)
)
gc_label:begin
	declare exists_user int unsigned;
    declare user_group_id int unsigned;
    
    select id into exists_user from users where id = user_id limit 1;
    if exists_user is null then
		select
			1 as exit_code,
            "User does not exist" as message;
		leave gc_label;
	elseif visibility != "public" and visibility != "private" then
		select
			2 as exit_code,
            "Visibility not allowed" as message;
		leave gc_label;
	end if;
    
    insert into user_groups 
		(owner_user_id, name, image_src, description, visibility)
	values
		(user_id, gname, image_src, description, visibility);
        
	set user_group_id = last_insert_id();
    
    insert into group_memberships(user_id, group_id) 
    values (user_id, user_group_id);
	
    select
		0 as exit_code,
        "Done" as message,
        user_group_id as id;
end $$
delimiter ;

drop procedure if exists group_grant_permission;
delimiter $$
create procedure group_grant_permission (
	group_id int unsigned,
    permission_id int unsigned
)
ggp_label:begin
    declare e_permission int unsigned;
    declare perm_already_granted int unsigned;
    
    select id into e_permission from group_permissions where id = permission_id limit 1;
    
    if e_permission is null then
		select
			1 as exit_code,
            "Permission does not exist" as message;
		leave ggp_label;
	end if;
    
    select id into perm_already_granted from permissions_granted_to_groups as pgtg
    where pgtg.group_permission_id = permission_id and pgtg.group_id = group_id limit 1;
    
    if perm_already_granted is not null then
		select
			2 as exit_code,
            "Permission already granted" as message;
		leave ggp_label;
	end if;
    
    insert into permissions_granted_to_groups
		(group_id, group_permission_id)
	values
		(group_id, permission_id);
        
	select
		0 as exit_code,
        "Done" as message,
        last_insert_id() as id;
end $$
delimiter ;

drop procedure if exists group_add_tag;
delimiter $$
create procedure group_add_tag (
	group_id int unsigned,
    tag varchar(50)
)
gat_label:begin    
    insert into group_tags 
		(group_id, tag)
	values
		(group_id, tag);
	
    select
		0 as exit_code,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists group_switch_notifications;
delimiter $$
create procedure group_switch_notifications (
	user_id int unsigned,
    group_id int unsigned,
    state bool
)
gsn_label:begin
    declare current_state bool;
    
    select active_notifications into current_state from group_memberships as gp
    where gp.user_id = user_id and gp.group_id = group_id limit 1;
    
    if current_state is null then
		select 
			1 as exit_code,
			"User doesn't exist in the group memberships or the group doesn't exist" as message;
        leave gsn_label;
    elseif current_state = state then
		select 
			2 as exit_code,
            "Group notifications are already in that state" as message;
		leave gsn_label;
    end if;
    
    update group_memberships as gp
	set active_notifications = state
	where gp.user_id = user_id and gp.group_id = group_id 
    limit 1;

	select
		0 as exit_code,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists group_add_user;
delimiter $$
create procedure group_add_user (
	user_id int unsigned,
	group_id int unsigned
)
gau_label:begin    
	declare exists_group int unsigned;
    declare user_already_member int unsigned;
    declare group_visibility varchar(15);
    declare group_owner_user_id int unsigned;
    declare group_name varchar(100);
    declare user_username varchar(50);
    
    select id into exists_group from user_groups
	where id = group_id
	limit 1;
    
    if exists_group is null then
		select
			1 as exit_code,
            "Group does not exist" as message;
		leave gau_label;
	end if;
    
    select id into user_already_member from group_memberships as gm
	where gm.user_id = user_id and gm.group_id = group_id
	limit 1;
    
    if user_already_member is not null then
		select
			2 as exit_code,
            "The user is already a member of the group" as message;
		leave gau_label;
	end if;
    
    select visibility into group_visibility from user_groups
    where user_groups.id = group_id;
    
    if group_visibility = 'private' then
		insert into requests_to_join_a_group(user_id, group_id) 
		values (user_id, group_id);
        
        select owner_user_id into group_owner_user_id
        from user_groups where id = group_id
        limit 1;
        select name into group_name
        from user_groups where id = group_id
        limit 1;
        select username into user_username
        from users where id = user_id
        limit 1;
        
		select 
			3 as exit_code,
			"The request was sent to the group owner" as message,
            group_owner_user_id,
            group_name,
            user_username,
            last_insert_id() as request_to_join_id;
		leave gau_label;
    end if;
    
    insert into group_memberships(user_id, group_id) 
	values (user_id, group_id);
	
    select
		0 as exit_code,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists group_post_create;
delimiter $$
create procedure group_post_create (
	user_id int unsigned,
    group_id int unsigned,
    content text,
    img_src varchar(700),
    cloudinary_id varchar(100),
    referenced_post_id int,
    post_type varchar(50)
)
gpc_label:begin    
	declare user_member_of_group int unsigned;
    declare ref_post_id_of_shared_post int unsigned; --  ref == referenced
    declare ref_post_visibility varchar(15);
    declare new_post_id int unsigned;
    
    select id into user_member_of_group 
    from group_memberships as gm
    where gm.user_id = user_id and gm.group_id = group_id
    limit 1;
    
    if user_member_of_group is null then
		select
			1 as exit_code,
            "User is not member of group" as message;
		leave gpc_label;
	end if;
    
    --  Creates a new group post.
    if referenced_post_id = 0 then
		insert into posts(user_id, content, img_src, cloudinary_id, post_type) 
		values (user_id, content, img_src, cloudinary_id, post_type);
    end if;
    --  Shares a user post or public group post as group post.
    if referenced_post_id > 0 then
		--  Verify that referenced post do not belongs to a private group.
		select user_groups.visibility into ref_post_visibility
		from posts 
        inner join group_posts on posts.id = group_posts.post_id
		inner join user_groups on group_posts.group_id = user_groups.id
		where posts.id = referenced_post_id limit 1;
        
        if ref_post_visibility is not null and ref_post_visibility = 'private' then
			select
				2 as exit_code,
				"The post cannot be shared, it belongs to a private group." as message;
			leave gpc_label;
        end if;
    
		--  Verify is the referenced post id is a shared post, if is true,  
        --  it is necessary extract the id of the original post.
		select posts.referenced_post_id into ref_post_id_of_shared_post 
        from posts where id = referenced_post_id
		limit 1;
        
        if ref_post_id_of_shared_post is not null then
			set referenced_post_id = ref_post_id_of_shared_post;
        end if;
        
        insert into posts(user_id, content, referenced_post_id, post_type) 
		values (user_id, content, referenced_post_id, post_type);
    end if;

    select last_insert_id() into new_post_id;
    
    insert into group_posts(post_id, group_id)
		values (new_post_id, group_id);
    
    select
		0 as exit_code,
        new_post_id as post_id,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists user_post_create;
delimiter $$
create procedure user_post_create (
	user_id int unsigned,
    content text,
    img_src varchar(700),
    cloudinary_id varchar(100),
    referenced_post_id int,
    post_type varchar(50)
)
upc_label:begin    
    declare ref_post_id_of_shared_post int unsigned; --  ref == referenced
    declare ref_post_visibility varchar(15);
    declare new_post_id int unsigned;

    --  Creates a new user post.
    if referenced_post_id = 0 then
		insert into posts(user_id, content, img_src, cloudinary_id, post_type) 
		values (user_id, content, img_src, cloudinary_id, post_type);
    end if;
    --  Shares a user post or public group post as user post.
    if referenced_post_id > 0 then
		--  Verify that referenced post do not belongs to a private group.
		select user_groups.visibility into ref_post_visibility
		from posts 
        inner join group_posts on posts.id = group_posts.post_id
		inner join user_groups on group_posts.group_id = user_groups.id
		where posts.id = referenced_post_id limit 1;
        
        if ref_post_visibility is not null and ref_post_visibility = 'private' then
			select
				1 as exit_code,
				"The post cannot be shared, it belongs to a private group." as message;
			leave upc_label;
        end if;
    
		--  Verify is the referenced post id is a shared post, if is true,  
        --  it is necessary extract the id of the original post.
		select posts.referenced_post_id into ref_post_id_of_shared_post 
        from posts where id = referenced_post_id
		limit 1;
        
        if ref_post_id_of_shared_post is not null then
			set referenced_post_id = ref_post_id_of_shared_post;
        end if;
        
        insert into posts(user_id, content, referenced_post_id, post_type) 
		values (user_id, content, referenced_post_id, post_type);
    end if;

    select last_insert_id() into new_post_id;
    
    select
		0 as exit_code,
        new_post_id as post_id,
        "Done" as message;
end $$
delimiter ;

drop procedure if exists endpoint_permission_create;
delimiter $$
create procedure endpoint_permission_create (
	endpoint varchar(700),
    group_permission_id int unsigned
)
epc_label:begin
    declare endpoint_with_group_id_exists int;
    
    select id into endpoint_with_group_id_exists 
    from group_endpoint_permissions as gep
    where 
		gep.endpoint = endpoint and
		gep.group_permission_id = group_permission_id
    limit 1;
    
    if endpoint_with_group_id_exists is not null then
		select
			1 as exit_code,
            "The endpoint already has the group permission id." as message;
		leave epc_label;
	end if;
    
    insert into 
		group_endpoint_permissions(endpoint, group_permission_id)
    values (endpoint, group_permission_id);
    
    select
		0 as exit_code,
        "Done" as message,
        last_insert_id() as id;
end $$
delimiter ;

-- TODO: Document this SP. It was originally created for docker initialization.
drop procedure if exists sp_add_major;
delimiter $$
create procedure sp_add_major(
    major_name varchar(100)
)
sp_add_major_label:begin
    declare major_exists int unsigned;
    
    select id into major_exists
    from majors as m
    where m.name = major_name limit 1;

    if major_exists is not null then
        select
            1 as exit_code,
            "The major already exists" as message;
        leave sp_add_major_label;
    end if;

    insert into majors(name) values(major_name);
    select
        0 as exit_code,
        "Done" as message,
        last_insert_id() as id;
end $$
delimiter ;


drop procedure if exists sp_add_follwer;
delimiter $$
create procedure sp_add_follwer(
    target_user_id int unsigned,
    follower_user_id int unsigned
)
sp_add_follwer_label:begin
    declare target_user_exists int unsigned;
    declare follower_user_exists int unsigned;
    declare relationship_exists int unsigned;

    select id into target_user_exists
    from users where id = target_user_id limit 1;

    if target_user_exists is null then
        select
            1 as exit_code,
            "Target user does not exists" as message;
        leave sp_add_follwer_label;
    end if;

    select id into follower_user_exists
    from users where id = follower_user_id limit 1;

    if follower_user_exists is null then
        select
            2 as exit_code,
            "Follower user does not exists" as message;
        leave sp_add_follwer_label;
    end if;

    select id into relationship_exists
    from followers as f 
        where 
            f.target_user_id = target_user_id and
            f.follower_user_id = follower_user_id limit 1;
    
    if relationship_exists is not null then
        select
            3 as exit_code,
            "The requesting user is already following the target user" as message;
        leave sp_add_follwer_label;
    end if;

    insert into followers(target_user_id, follower_user_id) values(target_user_id, follower_user_id);
    select
        0 as exit_code,
        "Done" as message,
        last_insert_id() as id;
end $$
delimiter ;
