import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../services/session/session.service';
import { Router } from '@angular/router';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { PopupsService } from 'src/app/services/popups/popups.service';
import { ElementCard } from '../../classes/student.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public displayName: string;
  public username: string;
  public profileDefaultIcon: string = "/assets/account_circle-black-18dp.svg";
  public user: ElementCard = new ElementCard();

  constructor(
    private session: SessionService,
    private router: Router,
    private academicNetwork: AcademicNetworkService,
    private popups: PopupsService
  ) { }

  ngOnInit(): void {
    //Si hay una sesión iniciada, no se puede estar
    //en la vista de login.
    if(this.session.get_userdata()) {
      this.router.navigateByUrl('/user-feed');
      return;
    }

    this.set_form_visibility('passwd', 'hide');
    this.set_form_visibility('username', 'show');
  }

  //Si el usuario presiona el boton de registrar
  //lo manda al formulario correspondiente.
  showSignUp(user_form_data) {
    if(user_form_data.btn == 'left') {
      this.router.navigate(['/sign-up']);
    }
  }

  catch_user(user_form_data) {
    //Las siguientes líneas son un ejemplo y deben ser cambiadas por
    //la lógica correspondiente para iniciar sesión.
    //Recordar modularizar el código (separar en funciones).
    console.log(user_form_data);
    if(user_form_data.btn == 'right' || user_form_data.btn == 'return') {
      this.academicNetwork.getUserPublicData(user_form_data.value)
        .subscribe(res => {
          if(res.code == 0) {
            this.displayName = res.data.firstname + ' ' + res.data.lastname;
            this.username = res.data.username;
            this.setUserCard(res.data);
            this.set_form_visibility('username', 'hide');
            this.set_form_visibility('passwd', 'show');
          } else if(res.code == 1) {
            this.popups.error(
              'Usuario no encontrado',
              'Es probable que no hayas escrito bien tu usuario o email. Intenta de nuevo.',
              'Prueba con tu matrícula o correo institucional.');
          }
        })
    }
  }

  //Muestra un formulario para que
  //el usuario pueda ingresar su contraseña
  //si el input del username no está vacío.
  catchPassword(user_form_data) {
    //Regresar.
    if(user_form_data.btn == 'left') {
      this.set_form_visibility('passwd', 'hide');
      this.set_form_visibility('username', 'show');
      return;
    }
    //Caso contrario, iniciar sesión y seguir a la vista del feed.
    this.academicNetwork.signin(
      this.username,
      user_form_data.value)
        .subscribe(res => {
          if(res.code == 0) {
            //Ok. Guardar el token y los datos necesarios del usuario.
            this.session.saveToken(res.data.session_token);
            this.session.set_userdata('username', res.data.username);
            this.session.set_userdata('firstname', res.data.firstname);
            this.session.set_userdata('lastname', res.data.lastname);
            this.session.set_userdata('profile_img_src', res.data.profile_img_src);
            this.session.set_userdata('description', res.data.description);
            this.router.navigateByUrl('/user-feed');
          } else if(res.code == 1) {
            this.popups.error(
              'Credenciales incorrectas',
              'Revisa si tu usuario y contraseña son correctos.',
              '¿Seguro que el usuario que introdujiste es tuyo?');
          }
        })
  }

  /**
   * Oculta o muestra los formularios.
   * @param form:string [username|passwd]
   * @param state:string [hide|show]
   */
  set_form_visibility(form, state) {

    let comp;

    if(form == 'username') {
      comp = document.querySelector('div.get-username');
    } else if(form == 'passwd') {
      comp = document.querySelector('div.get-password');
    }

    if(state == 'hide') {
      comp.classList.add('inactive');
    } else if(state == 'show') {
      comp.classList.remove('inactive');
    }
  }

  setUserCard(userData) {
    this.user = {
      icon: userData.profile_img_src,
      text: [
        {
          text: `${userData.firstname} ${userData.lastname}`,
          style: 'h2'
        },
        {
          text: `@${userData.username}`,
          style: 'p'
        }
      ],
      internalLink: null,
      externalLink: null
    }
  }

}
