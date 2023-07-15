import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  //Cláves para los diferentes datos guardados en el
  //sessionStorage. Pueden ser strings arbitrarios.
  private keys = {
    'userdata': 'yag6s7ghasd7igas78tdqyfa65fravhjqgwd87gdsayg76asgqya',
    'session_token': 'shdbdshbjhdfbjekuncjnvjdncjkejnjkenrjndjnjcncjkn'
  };

  constructor(
    private router: Router
  ) { }

  //Establece un campo en el conjunto de datos de usuario.
  set_userdata(field, val) {
    //Recuperar los datos existentes.
    let userdata = this.get_userdata();
    //Si no hay, crear un objeto vacío para guardar.
    if (!userdata) {
      userdata = { };
    }
    //Establecer el dato.
    userdata[field] = val;
    sessionStorage.setItem(this.keys.userdata, JSON.stringify(userdata));
  }

  //Recupera los datos del usuario en memoria como JSON,
  //si no hay retorna null.
  get_userdata() {
    let data = sessionStorage.getItem(this.keys.userdata);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  //Vacía los datos de sesión en memoria y regresa a la vista de login.
  end_session() {
    sessionStorage.clear()
    //Incluir una instrucción para volver a la vista de login.
  }

  // Guarda token del registro en session storage.
  saveToken(sessionToken: string) {
    sessionStorage.setItem(this.keys.session_token, sessionToken);
  }

  getToken(): string {
    return sessionStorage.getItem(this.keys.session_token);
  }

  needsUserAuth() {
    if(!this.get_userdata()) {
      this.router.navigateByUrl('/login');
    }
  }
}
