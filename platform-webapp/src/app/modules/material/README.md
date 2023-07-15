# Material Design Module.

En este módulo se agregan todos los módulos de Angular Material a usar en la aplicación. 

Este módulo es importado en el módulo `AppComponentsModule` en `~/src/app/modules/app-components`
y a su vez es exportado por ese módulo. Tal modulo es importado por `ViewsModule` en `~/src/app/modules/views`
el cual exporta a `AppComponentsModule`. `ViewsModule` es importado por `AppModule`, el módulo principal, lo cuál
hace que los componentes de Angular Material sean alcansables en toda la aplicación y no hace falta importarlos de nuevo,
a menos que un módulo en la misma altura o inferor a `AppComponentsModule` los requiera. En ese caso, ese módulo
necesitará imporar a `MaterialModule`.
