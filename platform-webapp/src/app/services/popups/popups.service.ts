import { Injectable } from '@angular/core';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PopupsService {

  constructor() { }

  //Información de la librería swal.
  //Descripción de las propiedades del objeto como parámetro:
  //1. icon = agrega un icono (success, error, warning, info y question)
  //2. title = título de la alerta.
  //3. text = descripción del mensaje/alerta.
  //4. footer = footer de la alerta.


  //Métodos.

  //Mensaje de error.
  error(title, text, footer?): void {

    swal.fire({
      icon: 'error',
      title: `<strong> ${title} </strong>`,
      text: text,
      footer: footer
    });
  }

  //Mensaje éxitoso.
  success(title, text, footer?): void {
    swal.fire({
      icon: 'success',
      title: `<strong> ${title} </strong>`,
      text: text,
      footer: footer
    });
  }

}
