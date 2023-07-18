import { Component, OnInit } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { SessionService } from 'src/app/services/session/session.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service'; 
import { AnimationsService } from 'src/app/services/animations/animations.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  public imageFormDisabled: boolean = false;
  public settingsFormDisabled: boolean = true;
  public userCard: ElementCard;
  public userSettingFormGroup: FormGroup

  constructor(
    private session: SessionService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private academicNetwork: AcademicNetworkService,
    private animations: AnimationsService,
    private notifications: NotificationsService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.userSettingFormGroup = this._formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      description: ['', Validators.required]
    })

    let userdata = this.session.get_userdata();
    this.userCard = {
      icon: userdata.profile_img_src || '/assets/account_circle-black-18dp.svg',
      text: [],
      internalLink: null,
      externalLink: null
    };

    this.userSettingFormGroup.get('firstname')
      .setValue(userdata.firstname);
    this.userSettingFormGroup.get('lastname')
      .setValue(userdata.lastname)
    this.userSettingFormGroup.get('description')
      .setValue(userdata.description)
  }

  applyImage(event) {
    console.log(event)
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.updateProfileImage(event.image).subscribe(res => {
      this.animations.globalProgressBarActive = false;
      if(res.code == 0) {
        this.notifications.success('Éxito', '¡Tu imagen de perfil fue actualizada!')
      } else {
        this.notifications.error('Algo no ha salido bien', res.messages.join(' | '))
      }
    })
  }

  submitSettingsHandler(event) {
    if(this.userSettingFormGroup.valid) {
      console.log('update user data')
      console.log(this.userSettingFormGroup.get('firstname').value)
    }
  }
}
