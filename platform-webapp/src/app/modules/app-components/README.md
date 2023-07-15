# App Components Module

Este módulo contiene todos los componentes que no son vistas en la aplicación, componentes generales que pueden ser 
reutilizados en varias secciones de la app. Cualquier compoenente que no sea una vista debe ser registrado
en este módulo.

Todos los componentes agregados deben ser documentados en profundidad para que puedan ser usados por otros programadores.

Los datos que se deben incluir en la documentación de cada componente son:

* Nombre del compoenente (como título 3).
* Descripción (como es, qué hace, para qué sirve).
* Entradas. Descripción de ellas y sus tipos.
* Salidas. Descripción de ellas y sus tipos.
* Selector.
* Un enlace a su documentación debe ser agregado al índice.

## Índice.
* [TagComponents](#tagcomponents)
  * [Single-Field Form n2options](#single-field-form-n2options)
  * [ElementCard](#elementcard)
  * [ElementCardBox](#elementcardbox)
  * [TextAndImageForm](#textandimageform)
  * [CommentBox](#commentBox)
  * [PublicationCard](#publicationCard)
  * [PublicationDisplay](#publicationdisplay)
  * [GroupSettings](#globalprogresscaractive)
  * [ImagePicker](#imagepicker)
* [Dialogs](#dialogs)
  * [GroupPreferences](#grouppreferences)
  * [ImageSquareCropper](#imagesquarecropper)
  * [SharePost](#SharePost)

### TagComponents

#### Single-Field Form n2options.

**Descripción**: Pequeño recuadro centrado responsivo de 400px de ancho con un único campo de entrada de texto (modificable: text, password, email, etc)
y dos botones (izquierdo y derecho) que que sirven para preguntar algo al usuario.

**Entradas**:
* `label`: La etiqueta del input. String.
* `placeholder`: El placeholder del input. String.
* `left-btn`: Leyenda del botón izquierdo. String.
* `right-btn`: leyenda del botón derecho. String.
* `type`: Tipo de la entrada de texto. String.
* `required`: Booleano indicando si es requerido.
* `forward-btn`: El botón que se considera el de avanzar (`left`|`right`). String.
* `error-msg`: El mensaje de error que se desplegará cuando `required` = `true` y el campo esté vacío.

**Salidas**:
* `btn-pressed`: Evento que retorna un objeto indicando el valor en el campo de texto al momento de ser presionado y el botón presionado. Si se presiona la tecla de retorno en el campo de texto en lugar de uno de los botones, se indicará en el campo `btn`.
  * `value`: el valor en el campo de texto.
  * `btn`: El botón presionado (`left`|`right`|`return`)

**Selector**: `app-single-field-form-n2options`

#### ElementCard

**Descripción**: Se encarga de imprimir una tarjeta de elemento con un icono y una lista de textos.

**Entradas**:
* `defaultIcon`: `string` La imágen por defecto que se mostrará en caso de no proveer una imagen en el objeto card.
* `card`: `ElementCard` La información del card.
* `enableClickEvent`: `boolean` Por defecto `true`, sirve para que sin pasarle links, el card sea clickeable.

**Salidas**:
* `clickOverCard`: `EventListener<Object>`
  * `card`: `ElementCard` El card actual. Se dispara cuando se hace click sobre el card.

**Selector**: `app-element-card`.

#### ElementCardBox

**Descripción**: Se encarga de almacenar e imprimir una colección de tarjetas de elementos.

**Entradas**: 
* `data`: Información almacenda para ser desplegada: Object[].

**Salidas**: Ninguno.

**Selector**: `app-element-card-box`.

#### TextAndImageForm.

**Descripción**: Formulario con una caja de texto de tamaño auto-ajustable al texto contenido con soporte para adjuntar una imágen.
El envío del contenido se dispara mediante "enter" o el botón dedicado.

**Entradas**:
* `textInputLabel`: Label para la caja de texto. String.
* `textInputPlaceholder`: Placeholder para la caja de texto. String.

**Salidas**:
* `newContent`: Evento que se dispara cuando el contenido del formulario se envía. Datos de retorno del evento son:
  * `text`: Un `string` representando el contenido de la caja de texto.
  * `image`: Un objeto de tipo `File` representando la imágen.

**Selector**: `app-text-and-image-form`.

#### CommentBox.

**Descripción**: Caja para desplegar comentarios y crear comentarios. Los comentarios soportan texto e imagen.

**Entradas**:
* `comments`: Arreglo de tipo `Comment` (revisar en las interfaces para publicaciones).

**Salidas**:
* `moreComments`: Evento que se dispara cuando se presiona el botón para recuperar más comentarios. No retorna datos.
* `newComment`: Evento que se dispara cuando se envía un nuevo comentario. Datos de retorno:
  * `text`: `string` representanto el texto del comentario.
  * `image`: Objeto `File` representando la imágen adjuntada.

**Selector**: `app-comment-box`.

#### PublicationCard.

**Descripción**: Card para desplegar la información de una publicación.

**Entradas**:
* `profileImgSrc`: `string`. La URL de la imagen de perfil del usuario autor de la publicación.
* `profileName`: `string`. Nombre completo del usuario autor.
* `publicationImgSrc`: `string`. URL de la imagen de la publicación.
* `text`: `string`. Texto de la publicación.
* `username`: `string`. Nombre de usuario en la plataforma.
* `groupName`: `string`. Nombre del grupo en el que se hizo la publicación.
* `groupId`: `number`. Id del grupo en el que se hizo la publicación.
* `createdAt`: `string`. Texto indicando la fecha de creación de la publicación.
* `likeCounter`: `number`. La cantidad de likes que tiene la publicación.
* `liked`: `number`. 1 =  el usuario logeado añadió a favoritos la publicación,
  0 = caso contrario.
* `isSharedContent`: `boolean`. Si la publicación está compartiendo otra publicación.
* `subPostId`: `number`. Id de la publicación compartida. Requerido `isSharedContent` = `true`.
* `subProfileImgSrc`: `string`. URL de la imágen de perfil del usuario autor 
  de la publicación referenciada.
* `subProfileName`:`string`. Nombre completo del usuario autor de la publicación referenciada.
* `subPublicationImgSrc`:`string`. URL de la imagen de la publicación referenciada.
* `subText`:`string`. Texto de la publicación referenciada.
* `subUsername`:`string`. Nombre de usuario del autor de la publicación referenciada.
* `subGroupName`: `string`. Nombre del grupo en el que se hizo la publicación referenciada.
* `subGroupId`: `number`; Id del grupo en el que se hizo la publicación referenciada.
* `subCreatedAt`: `string`; Fecha en la que se hizo la publicación referenciada.
* `activeButtons`: `Array<string>`. Los botones que serán desplegados. 
  Si no se proporciona este dato, se mostrarán todos. 
  Valores váildos: `"['share', 'favorite', 'comment']"`

**Salidas**:
* `favorite`: Cuando se hace clic en el botón de "favorito".
  * `publicationId`: ID de la publicación compartida.
  * `favoriteStatus`: Si es usuario marcó como favorita la publicación (`1`|`0`).
* `share`: Evento que se dispara cuando el usuario da clic en el botón de compartir la publicación.
  * `publicationId`: ID de la publicación compartida.
* `comment`: Evento que se dispara cuando el usuario da clic en el botón comentar la publicación.
  * `publicationId`: ID de la publicación compartida.

**Selector**: `app-publication-card`.

#### PublicationDisplay.

**Descripción**: Componente que muestra un `PublicationCard` a partir de un objeto de clase `Publication`.

**Entradas**:
* `publication`: `Publication`. La publicación a mostrar.
* `activeButtons`: `Array<string>`. Los botones que serán desplegados. 
  Si no se proporciona este dato, se mostrarán todos. 
  Valores váildos: `"['share', 'favorite', 'comment']"`

**Salidas**:
* `favorite`: Cuando se hace clic en el botón de "favorito".
  * `publicationId`: ID de la publicación compartida.
  * `favoriteStatus`: Si es usuario marcó como favorita la publicación (`1`|`0`).
* `share`: Evento que se dispara cuando el usuario da clic en el botón de compartir la publicación.
  * `publicationId`: ID de la publicación compartida.
* `comment`: Evento que se dispara cuando el usuario da clic en el botón comentar la publicación.
  * `publicationId`: ID de la publicación compartida.

**Selector**: `app-publication-display`.

#### GroupSettings

**Descripción**:
  Despluega un formulario, con validaciones por defecto o personalizables, útil para
  recolectar información de configuración sobre los grupos.

* **Entradas**:
  * `formGroup`: `FormGroup`. 
    Instancia con las validaciones para los campos de tipo `FormControl`.
    Los campos tienen los siguiente nombres:
      * `nameCtrl`: 
        Control de tipo input text. El nombre del grupo.
      * `descriptionCtrl`:
        Control de tipo textarea. La descripción del grupo.
      * `privacyCtrl`:
        Control de tipo radio button. Si el grupo es público o provado.
      * `tagCtrl`:
        Las etiquetas para el grupo.
  * `applyBtnLabel`: `string`.
    El texto que muestro el botón para mandar la información
    del formulario.
  * `permissions`: `GroupPermission[]`.
    Arreglo con los permisos disponibles para elegir.
  * `btnDisabled`: `boolean`.
    Si el botón para mandar los datos del formulario está desactivado.
    Esta opción también afecta a los demás controles de formulario.

* **Salidas**

* `apply`:
    Evento que se dispara cuando se presiona el botón para mandar
    los datos del formulario.
    * `invalid`: `boolean`.
      Si el formulrio no pasa alguna de las validaciones.
    * `invalidFields`: `string[]`.
      El nombre de los controles que fallaron la validación.
    * `formData`: `Object`.
      * `nameCtrl`: `string`.
        El nombre del grupo.
      * `descriptionCtrl`: `string`.
        La descripción del grupo.
      * `privacyCtrl`: `string`.
        Si el grupo es público o provado.
      * `tagCtrl`: `GroupTag[]`.
        Las etiquetas para el grupo.
      * `permissions`: `GroupPermission[]`.
        El estado de los permisos seleccionados.
* **Selector**: `app-group-settings`.

#### ImagePicker

**Descripción**:
  Componente que descpliega un formulario para elegir una imagen de
  cualquier dimencion y recortarla en un cuadrado para redondearla
  y usarse como ícono.

* **Entradas**:
  * `formGroup`: `FormGroup`. 
    Instancia con las validaciones para los campos de tipo `FormControl`.
    Los campos tienen los siguiente nombres:
      * `imageCtrl`: 
        Control de tipo input file. La imagen a usar.
  * `cropImageIndication`: `string`. 
    Indicación que verá el usuario cuando tenga que recortar su imagen.
    Por defecto `"Recorta tu imagen."`.
  * `applyBtnLabel`: `string`.
    El texto que muestro el botón para mandar la información
    del formulario.
  * `applyBtnDisabled`: `boolean`.
    Si el botón para mandar los datos del formulario está desactivado.

* **Salidas**

* `apply`:
    Evento que se dispara cuando se presiona el botón para recortar.
    * `invalid`: `boolean`.
    * `image`: `Blob`. La imagen recortada.
* **Selector**: `app-image-picker`.

### Dialogs

#### GroupPreferences

**Descripción**:
  Dialogo que despliega diferentes formularios para configurar
  un grupo a nivel de miembro.

* **Entradas**
  * `data`: `GroupPreferences`

* **Salidas**

Objeto con los siguientes campos

  * `action`: `string`. Sus valores pueden ser: ["cancel" | "save-preferences" | "leave-group"]
  * `data`: `GroupPreferences`

#### ImageSquareCropper

**Descripción**:
  Dialogo de despliega un modal donde se puede recortar la imagen
  proveida en los argumentos.

* **Entradas**:
  * `data`: `ImageSquareCropper`.

* **Salidas**

Objeto con los siguiente atributos:

* `image`: `blob`. La imagen recortada.
* `imageTrustedUrl`: `string`. Una representación en base64 de la imagen
recortada. Sanitizada con las herramientas de angular.

* **Selector**: `app-image-picker`.

#### SharePost

**Descripción**:
  Despliega un modal que permite compartir una publicación. En el se puede
  especificar el destino en el que se va a publicar (un grupo o el perfil)
  y un texto adicional.

* **Entradas**:
  * `data`: `SharePostDialog`.

* **Salidas**

Objeto de tipo: `SharePostDialogResult`

* `action`: `string`. Puede ser [share|cancel]
* `content`: `string | null`. El texto que se adjunto a la publicación.
* `groupId`: `int | null`. El destino de la publicación, 0 para el perfil.
* `postId`: `int | null`. El id de la publicación a compartir.

* **Selector**: `app-share-post`.