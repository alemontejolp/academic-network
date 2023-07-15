# Views Module

Este módulo contiene todos los componentes que serán usados únicamente como vistas.

Estos componentes serán los que sean usados por en enrutador de Angular para desplegar vistas.

Cualquier componente cuyo único objetico sea servir como vista para el enrutador de Angular
debe ser registrado en este módulo.

Cada vista agregada debe ser documentada. Los datos que deben incluirse son:

* Descripción (qué hace y para qué sirve).
* Un enlace a su documentación en el índice.

## Documentación de las vistas.

### Índice.

* [Login](#Login)
* [SignUp](#SignUp)
* [AvailableGroups](#AvailableGroups)
* [MyGroups](#MyGroups)
* [Users](#users)
* [Followers](#followers)
* [Followed](#followed)
* [User Feed](#user-feed)
* [Post Details](#post-details)
* [Favorite Posts](#favorite-posts)
* [Profile view](#profile-view)
* [Create New Group](#create-new-group)

### Login.

**Descripción**: Se pregunta por el nombre de usuario, el cuál es validado en el backend, posteriormente se pregunta por la contraseña la cuál también es validada. Finalmente se guardan los datos de session y se continúa a la vista de feed de usuario.

### SignUp.

**Descripción**: Se pregunta datos del usuario para su registro, estos son: nombre, apellidos, correo institucional,
contraseña, confirmación de la contraseña, programa educativo y una descripción. El formulario es validado para que
todos los datos se guarden a excepción del campo de descripción que puede estar vacío.

### AvailableGroups

**Descripción**: Despliega una lista de los grupos disponibles actualmente en el sistema, además, 
contiene un input que permite escribir el nombre del grupo a buscar. Soporta paginación.

### MyGroups

**Descripción**: Despliega la lista de grupos dónde el estudiante ha sido inscrito, además,
contiene un input que permite escribir el nombre del grupo a buscar. Soporta paginación.

### Users

**Descripción**: Despliega la lista de todos los usuarios que hay en el sistema. Soporta paginación
y búsqueda.

### Followers

**Descripción**: Despliega la lista de los usuarios que siguen al usuario con una sesión activa, soporta búsqueda de usuarios
y paginación.

### Followed

**Descripción**: Despliega la lista de los usuario que el usuario con una sesión activa está siguiendo. Soporya búsqueda y
paginación.

### User Feed

**Descripción**: Despliega las publicaciones de interés para el usuario con una sesión activa, es decir, las publicaciones
de los usuarios a los que sigue y la de los grupos a los que el usuario pertenece.

### Post Details

**Descripción**: Desplega la vista detallada de una publicación. En esta vista se pueden ver los comentarios y comentar.

### Favorite Posts

**Descripción**: Desplega la lista de publicaciones que el usuario con una sesión activa ha marcado como favoritas.

### Profile view

**Descripción**: Desplega la información pública del usuario y las publicaciones que éste ha hecho.

### Create New Group

**Descripción**: Vista para crear un nuevo grupo y establecer su imagen. En esta vista también se pude actualizar
la información después de crear el grupo, siempre que la vista no se haya cerrado. Si la vista se cierra,
ya no se podrá actualizar la información del grupo y se tendrá que usar la vista correspondiente para eso.
