-- This file contains the Data Base schema for Academy Network.

-- create database if not exists academic_network;

-- use academic_network;

create table if not exists user_types (
	id int unsigned primary key auto_increment,
    name varchar(255) not null
);

create table if not exists users (
	id int unsigned primary key auto_increment,
    firstname varchar(70) not null,
    lastname varchar(70) not null,
    username varchar(50) unique not null,
    email varchar(100) unique not null,
    passwd varchar(300) not null,
    profile_img_src varchar(700),
    description varchar(700),
    user_type_id int unsigned not null,
    active tinyint not null default 0,
    created_at date default curdate(),
    
    foreign key (user_type_id) references user_types(id)
);

-- ----------- Administrative purpuses -------------
create table if not exists admins (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null,
    
    foreign key(user_id) references users(id)
);

create table if not exists admin_privileges (
	id int unsigned primary key auto_increment,
    name varchar(100) not null
);

create table if not exists granted_privileges (
	id int unsigned primary key auto_increment,
    admin_id int unsigned not null,
    privilege_id int unsigned not null,
    
    foreign key(admin_id) references admins(id),
    foreign key(privilege_id) references admin_privileges(id)
);

create table if not exists admin_endpoints (
	id int unsigned primary key auto_increment,
    endpoint varchar(700) not null,
    privilege_id int unsigned not null,
    
    foreign key(privilege_id) references admin_privileges(id)
);

create table if not exists allowed_domains (
	id int unsigned primary key auto_increment,
    domain_name varchar(255) not null
);

create table if not exists public_user_types (
	id int unsigned primary key auto_increment,
    user_type_id int unsigned not null,
    
    foreign key (user_type_id) references user_types(id)
);

create table if not exists api_keys (
	id int unsigned primary key auto_increment,
    appname varchar(100) not null,
    api_key varchar(255) not null,
    owner_name varchar(100) not null,
    email varchar(100) not null,
    phone varchar(20)
);

-- ----------- END Administrative purpuses -------------

-- ----------- Users -------------

create table if not exists majors (
	id int unsigned primary key auto_increment,
    name varchar(100)
);

create table if not exists students_data (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null unique,
    student_id varchar(50) not null,
    major_id int unsigned not null,
    
    foreign key(user_id) references users(id),
    foreign key(major_id) references majors(id)
);

create table if not exists pending_for_confirm (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null,
    confirm_token varchar(750) not null,
    confirmed tinyint not null default 0,
    created_at date default curdate(),
    
    foreign key(user_id) references users(id)
);

create table if not exists passwd_recovery (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null,
    token varchar(750) not null,
    still_valid tinyint not null default 1,
    created_at date default curdate(),
    
    foreign key(user_id) references users(id)
);

create table if not exists posts (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null,
    content text,
    img_src varchar(700),
    cloudinary_id varchar(100),
    referenced_post_id int unsigned,
    post_type varchar(50) not null,
    like_counter int unsigned not null default 0,
    created_at date default curdate(),
    
    foreign key(user_id) references users(id)
);

create table if not exists post_comments (
	id int unsigned primary key auto_increment,
    post_id int unsigned not null,
    user_id int unsigned not null,
    content text,
    image_src varchar(700),
    cloudinary_id varchar(100),
    created_at date default curdate(),
    
    foreign key(post_id) references posts(id),
    foreign key(user_id) references users(id)
);

create table if not exists favorite_posts (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null,
    post_id int unsigned not null,
    created_at date default curdate(),
    
    foreign key(user_id) references users(id),
    foreign key(post_id) references posts(id)
);

create table if not exists followers (
	id int unsigned primary key auto_increment,
    target_user_id int unsigned not null,
    follower_user_id int unsigned not null,
    created_at date default curdate(),
    
    foreign key(target_user_id) references users(id),
    foreign key(follower_user_id) references users(id)
);

create table if not exists user_chats (
	id int unsigned primary key auto_increment,
    user_one_id int unsigned not null,
    user_two_id int unsigned not null,
    
    foreign key (user_one_id) references users(id),
    foreign key (user_two_id) references users(id)
);

create table if not exists user_chat_messages (
	id int unsigned primary key auto_increment,
    chat_id int unsigned not null,
    issuing_user_id int unsigned not null,
    message text not null,
    file_src varchar(700),
    created_at date default curdate(),
    
    foreign key (chat_id) references user_chats(id),
    foreign key (issuing_user_id) references users(id)
);

-- ----------- END Users -------------

-- ----------- Groups -------------

create table if not exists user_groups (
	id int unsigned primary key auto_increment,
    owner_user_id int unsigned not null,
    name varchar(100) not null,
    image_src varchar(700),
    cloudinary_id varchar(100),
    description varchar(700),
    visibility varchar(15) not null,
    created_at date default curdate(),
    
    foreign key (owner_user_id) references users(id)
);

create table if not exists group_tags (
	id int unsigned primary key auto_increment,
    group_id int unsigned not null,
    tag varchar(50) not null,
    
    foreign key (group_id) references user_groups(id)
);

create table if not exists group_permissions (
	id int unsigned primary key auto_increment,
    name varchar(100) not null,
    codename varchar(100) not null
);

create table if not exists group_endpoint_permissions (
	id int unsigned primary key auto_increment,
    endpoint varchar(700) not null,
    group_permission_id int unsigned not null,
    
    foreign key (group_permission_id) references group_permissions(id)
);

create table if not exists permissions_granted_to_groups (
	id int unsigned primary key auto_increment,
    group_id int unsigned not null,
    group_permission_id int unsigned not null,
    
    foreign key (group_id) references user_groups(id),
    foreign key (group_permission_id) references group_permissions(id)
);

create table if not exists group_memberships (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null,
    group_id int unsigned not null,
    active_notifications tinyint not null default 1,
    created_at date default curdate(),
    
    foreign key (user_id) references users(id),
    foreign key (group_id) references user_groups(id)
);

create table if not exists group_posts (
	id int unsigned primary key auto_increment,
    post_id int unsigned not null,
    group_id int unsigned not null,
    
    foreign key (post_id) references posts(id),
    foreign key (group_id) references user_groups(id)
);

create table if not exists group_chats (
	id int unsigned primary key auto_increment,
    group_id int unsigned not null,
    issuing_user_id int unsigned not null,
    message text,
    file_src varchar(700),
    created_at date default curdate(),
    
    foreign key (group_id) references user_groups(id),
    foreign key (issuing_user_id) references users(id)
);

-- This only applies for private groups.
create table if not exists requests_to_join_a_group (
	id int unsigned primary key auto_increment,
    user_id int unsigned not null,
    group_id int unsigned not null,
    created_at date default curdate(),
    
    foreign key (user_id) references users(id),
    foreign key (group_id) references user_groups(id)
);

-- ----------- ENDGroups -------------

-- ----------- Notifications -------------

create table if not exists notifications (
	id int unsigned primary key auto_increment,
    user_target_id int unsigned not null,
    message varchar(700) not null,
    notif_type varchar(100) not null,
    element_id int unsigned,
    created_at date default curdate(),
    
    foreign key(user_target_id) references users(id)
);

-- ----------- END Notifications -------------
