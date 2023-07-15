# AcademicNetworkWebApp

## Índice.

* [Sobre el proyecto](#Sobre-el-proyecto)
* [Directorios de interés](#Directorios-de-interés)
  * [Módulos](#Módulos)
  * [Servicios](#Servicios)
* [Notas útiles](#Notas-útiles)

## Sobre el proyecto.

Esta es la aplicación cliente para el proyecto AcademyNetwork, el cuál es un proyecto de software libre para acercar a los
estudiantes con los profesores y personal administrativo de una escula, proveyendo de los servicios comunes de redes sociales.

## Directorios de interés.

### Módulos.
Este proyecto separa sus funcionalidades en dirferentes módulos para mejorar el mantenimiento del mismo y su fácil modificación.

Los módulos que usa son:

* MaterialModule: Exporta los componentes de Angular Material a utilizar.
* AppComponensModule: Exporta todos los componentes que no son vistas en la aplicación. Estos componentes son fácilmente reutilizables.
* ViewsModule: Exporta los componentes que serán usados como vistas. Estos componentes son los usados por el enrutador en Angular para desplegar vistas.
* Interfaces: Exporta las interfaces a utilizar en la aplicación.

Estos módulos se encuntran en `src/app/modules/`

En cada directorio de módulo se encuentran los componentes que exportan.

Revisar sus directorios para más información.

### Servicios.

Los servicios globales se guardan en `src/app/services`. Si un servicio será únicamente usado en un módulo o un compoenente, el servivicio deberá ser
guardado en el directorio de ese módulo o componente y registrado en el módulo o componente en el que será usado.

## Notas útiles.

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 10.0.0.

### Instalar dependencias.

Ejecutar `npm ci` después de clonar el repositorio para descargar las dependencias del proyecto.

Para agregar una nueva dependencia usar `npm install [nombre-paquete]`.

### Development server.

Ejecutar `ng serve` para un servidor de desarrollo. Ir a `http://localhost:4200/`. La aplicación automáticamente se recargará si hay cambios en los archivos.

### Code scaffolding.

Ejecutar `ng generate component component-name` Para generar un nuevo componente. También se puede usar `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build.

Ejecutar `ng build` Para compilar el proyecto. El resultado de la compilación se guardará en el directorio `dist/`. Usar la opción `--prod` para una compilación para producción.

### Running unit tests.

Ejecutar `ng test` para ejecutar pruebas unitarias vía [Karma](https://karma-runner.github.io).

### Running end-to-end tests.

Ejecutar `ng e2e` para correr las pruebas end-to-end vía [Protractor](http://www.protractortest.org/).

### Further help.

Para obtener más ayuda con Angular CLI use `ng help` o revise el [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
