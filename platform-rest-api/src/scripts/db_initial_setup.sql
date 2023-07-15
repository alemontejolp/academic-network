-- This script will setup the DB with some values to test the current endpoints.
-- Ensure you have created the DB, tables and SPs previously.
-- use academic_network;

-- declare @student_type_id int unsigned;
-- declare @type_student_is_public int unsigned;

-- Creates the student type. Id will be 1.
call sp_user_type_create("Estudiante");
call sp_user_type_create("Profesor");
call sp_user_type_create("Administrativo");

-- Makes public the above type.
select id into @student_type_id
from user_types where name = "Estudiante" limit 1;

select id into @type_student_is_public
from public_user_types where user_type_id = @student_type_id limit 1;

if (@type_student_is_public is null) && (@student_type_id is not null) then
  insert into public_user_types (user_type_id) values(@student_type_id);
end if;
-- Allows the ucaribe.edu.mx domain for signup.
-- call sp_domain_create("ucaribe.edu.mx");

-- Creates a majors.
-- insert into majors(name) 
-- values("Ingeniería en datos"), ("Ingeniería en desarrollo de software"),
-- ("Ingeniería ambiental"), ("Ingeniería industrial");

-- Creates an API key to send it in the request headers.
-- call sp_create_api_key('Academy Network web client', 'Ale', 'ale@ucaribe.edu.mx', '9999999999');

-- Selects the API key previously created. 
-- Copy and paste this hash in the x-api-key header of your requests in postman.
-- select api_key from api_keys;

-- Creates group permissions.
call group_permission_create("Permitir publicaciones", "allow_posts");
call group_permission_create("Permitir comentarios", "allow_comments");

-- Creates permissions for endpoints.
call endpoint_permission_create("/v1/api/social-network/groups/group/:number/post", 1);
call endpoint_permission_create("/v1/api/social-network/groups/post/:number/make-comment", 2);
