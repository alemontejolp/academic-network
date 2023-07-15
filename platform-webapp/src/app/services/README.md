# Services

En este directorio se encuentran todos los servicios globales alcanzables en
cualquier lado de la aplicación.

Todos los servicios deben ser ampliamente documentados para que puedan ser usados por otros programadores.

Los datos que se deben incluir son:

* Nombre del servicio (título 3).
* Nombre de la clase.
* Descripción del servicio.
* Atributos públicos.
  * Nombre.
  * Descripción.
  * Tipo.
* Métodos públicos.
  * Nombre del método.
  * Descripción.
  * Parámetros en orden y su tipo.
  * Tipo de dato de retorno.
* Se debe agregar un enlace a su documentación en el índice.

## Documentación.

### Índice.

* [Session](#session)
* [Sign-Up](#sign-up)
* [Notifications](#notifications)
* [StringFormat](#stringformat)
* [AnimationService](#animationservice)

### Session.

**Clase**: SessionService

**Descripción**: Maneja los datos de sesión del usuario. Todos los datos son almancenados en la memoria con `sessionStorage` con lo cual
sólo estan disponibles mientras el navegador esté corriendo.

**Atributos públicos**: Ninguno.

**Métodos públicos**:

* `set_userdata`
  * **Descripción**: Agrega atributos al objeto de datos del usuario.
  * **Parámetros**: 
    * `field`: String representando el nombre del campo.
    * `val`: Algún dato de cuaqluier tipo.
  * **Tipo de dato de retorno**: `Void`.
* `get_userdata`
  * **Descripción**: Retorna el objeto de datos de sesión del usuario.
  * **Parámetros**: `Void`.
  * **Tipo de dato de retorno**: `Object`.
* `end_session`
  * **Descripción**: Vacía los datos de sesión del usuario en la memoria y navega hacia la vista del login.
  * **Parámetros**: `Void`.
  * **Tipo de dato de retorno**: `Void`.

  ### Sign-Up
  
  **Clase**: SignUpService

  **Descripción**: Hace el registro de los datos del usuario para que pueda ser almacenado en la base de datos.

  **Atributos públicos**:

    **Nombre**: `students`.
    **Descripción**: Almacena la lista de estudiantes registrados.
    **Tipo**: `Student`.

    **Nombre**: `careers`.
    **Descripción**: Almacena la lista de carreras de los estudiantes.
    **Tipo**: `Career`.

    **Métodos públicos**:

    * `getCareers`
      * **Descripción**: Devuelve la lista de carreras registradas en la institución.
      * **Parámetros**: `void`.
      * **Tipo de dato de retorno**: `Career[]`.

    * `getStudents`
      * **Descripción**: Devuelve la lista de estudiantes registrados en la institución.
      * **Parámetros**: `void`.
      * **Tipo de dato de retorno**: `Student[]`.

    * `newStudent`
      * **Descripción**: Devuelve un objeto vacío de tipo estudiante.
      * **Parámetros**: `void`.
      * **Tipo de dato de retorno**: `Student`.

    * `addNewStudent`
      * **Descripción**: Agrega un nuevo estudiante a la lista.
      * **Parámetros**: `student`: Objeto de tipo estudiante que almacena los datos de registro.
      * **Tipo de dato de retorno**: `void`.

  ### Notifications

  **Clase**: NotificationsService

  **Descripción**: Contiene métodos de notificaciones que nos permite dar mensajes al usuario.

  **Atributos públicos**: Ninguno.

  **Métodos públicos**:

    * `error`
      * **Descripción**: Muestra una alerta de error al usuario.
      * **Parámetros**: 
      * `title`: String representando el título de la alerta.
      * `text`: Mensaje de la alerta.
      * `footer?`: parámetro opcional que puede contener un footer en la alerta. 
      * **Tipo de dato de retorno**: `void`.

    * `success`
      * **Descripción**: Muestra una alerta de éxito al usuario.
      * **Parámetros**: 
      * `title`: String representando el título de la alerta.
      * `text`: Mensaje de la alerta.
      * `footer?`: parámetro opcional que puede contener un footer en la alerta. 
      * **Tipo de dato de retorno**: `void`.

### StringFormat.

**Clase**: StringFormatService

**Descripción**: Realiza deversos tipos de procesamintos sobre strings.

**Atributos públicos**: Ninguno.

**Métodos públicos**:

* `splitByEOF`
  * **Descripción**: Divide un string a partir de los saltos de línea que contiene y elimina los saltos extra.
  * **Parámetros**: 
    * `text`: String que será procesado.
  * **Tipo de dato de retorno**: `Array<string>`.

### AnimationService.

**Clase**: AnimationService

**Descripción**: Maneja las animaciones globales en la aplicación.

**Atributos públicos**:

* `globalProgressBarActive`
  * **Descripción**:
    Activa o desactiva la barra de carga indeterminada situada en la parte superior
    de la aplicación. Puede usarse para indicar que hay un proceso que requiere
    que el usuario espere, pero cuyo tiempo de terminación es indiferente.
  * **Tipo**: boolean

**Métodos públicos**: Ninguno.
