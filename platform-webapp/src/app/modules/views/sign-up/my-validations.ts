import { ValidatorFn, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';

/*
  Valida que las dos contraseñas sean
  iguales, caso contrario, se envia 
  el objeto con la bandera y su valor.
*/
export const passwordMatch: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  return formGroup.get('passwd').value === formGroup.get('password2').value ?
    null : { 'passwordMismatch': true };
}

/*
  Se quitan los espacios en blanco
  de izquierda a derecha para validarlos.
*/
export const whiteSpaces = (control: AbstractControl) => {
  return control.value.toString().trim() === '' ? {hasWhiteSpaces: true} : null
}