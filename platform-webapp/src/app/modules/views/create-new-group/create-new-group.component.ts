import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { SessionService } from 'src/app/services/session/session.service';
import { Router } from '@angular/router';
import { AnimationsService } from 'src/app/services/animations/animations.service';
import { ElementCard } from '../../classes/student.model';
import { AvailableGroupPermission, GroupPermission } from '../../classes/academic-network.model'
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-create-new-group',
  templateUrl: './create-new-group.component.html',
  styleUrls: ['./create-new-group.component.css']
})
export class CreateNewGroupComponent implements OnInit {
  public permissions: GroupPermission[] = [];
  public groupSettingsFormGroup: FormGroup;
  public imageFormGroup: FormGroup;
  public groupCreatedFlag: boolean = false;
  public groupId: number;
  public createGroupForwardBtnDisabled: boolean = false;
  public createGroupforwardBtnLabel: string = 'Crear grupo';
  public applyImageBtnDisabled: boolean = true;
  public imageUpdateFinished: boolean = false;
  public imageUpdatingOk: boolean = false;
  public groupCard: ElementCard = new ElementCard();
  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private _formBuilder: FormBuilder,
    private notifications: NotificationsService,
    private academicNetwork: AcademicNetworkService,
    private session: SessionService,
    private router: Router,
    private animations: AnimationsService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.groupSettingsFormGroup = this._formBuilder.group({
      nameCtrl: ['', Validators.required],
      descriptionCtrl: ['', Validators.required],
      privacyCtrl: ['', Validators.required],
      tagCtrl: ['', Validators.required]
    });

    this.imageFormGroup = this._formBuilder.group({
      imageCtrl: ['', Validators.required]
    })

    this.setAvailablePermissions()
  }

  applySettingsHandler(event) {
    this.createGroupForwardBtnDisabled = true;
    if(!event.invalid) {
      //valid
      let permissions = [];
      for(let p of event.formData.permissions) {
        if(p.granted) {
          permissions.push(p.id);
        }
      }

      let tags = [];
      for(let t of event.formData.tagCtrl) {
        tags.push(t.tag);
      }

      let groupData = {
        group_name: event.formData.nameCtrl,
        description: event.formData.descriptionCtrl,
        visibility: event.formData.privacyCtrl,
        permissions: permissions,
        tags: tags
      };

      //this.stepper.next();

      //If group was already created, just apply changes to the group.
      if(this.groupCreatedFlag) {
        //Call API to update groups.
        this.notifications.info(
          'Actualizando grupo',
          'Esta caractrística aún no está disponible.');
        this.stepper.next();
        return;
      }

      //If groups has not been created, create it.
      //Call API to create the group.
      this.animations.globalProgressBarActive = true;
      this.academicNetwork.createGroup(groupData)
        .subscribe(res => {
          this.animations.globalProgressBarActive = false;
          this.createGroupForwardBtnDisabled = false;
          if(res.code == 0) {
            this.stepper.next();
            this.groupCreatedFlag = true;
            this.groupId = res.data.group_id;
            this.applyImageBtnDisabled = false;
            this.setGroupCardInfo();
            this.notifications.success('Éxito', 'Tu grupo se ha crado correctamente.');
            this.createGroupforwardBtnLabel = 'Aplicar cambios';
          } else if(res.code == 1) {
            this.notifications.error('Error', 'Parece que tu usuario no existe. :/ Reporta este problema.');
          } else if(res.code == 3) {
            this.notifications.error('Error', 'Alguno de los permisos no existe. :/ Reporta este problema.');
          }
        });
    } else{
      //invalid
      this.createGroupForwardBtnDisabled = false;
      this.notifications.error(
        'Los siguientes campos son requeridos',
        this.prettyFieldNames(event.invalidFields).join(', '));
    }
  }

  prettyFieldNames(invalidFields) {
    let fields = [];
    for(let field of invalidFields) {
      let prettyName = '';
      switch(field) {
        case 'nameCtrl':
          prettyName = 'nombre del grupo';
          break;
        case 'descriptionCtrl':
          prettyName = 'descripción del grupo'
          break;
        case 'privacyCtrl':
          prettyName = 'privacidad'
          break;
        case 'tagCtrl':
          prettyName = 'etiquetas'
          break;
      }
      fields.push(prettyName);
    }

    return fields;
  }

  applyImageHandler(event) {
    if(event.invalid) {
      this.notifications.error('Imagen faltante', 'Debes elegir una imagen.');
      return;
    }

    this.applyImageBtnDisabled = true;
    this.animations.globalProgressBarActive = true;
    //this.stepper.next();
    this.academicNetwork.updateGroupImage(this.groupId, event.image)
      .subscribe(res => {
        this.applyImageBtnDisabled = false;
        this.animations.globalProgressBarActive = false;
        this.imageUpdateFinished = true;
        if(res.code == 0) {
          this.stepper.next();
          this.imageUpdatingOk = true;
          this.groupCard.icon = res.data.image_src;
          this.notifications.success('Éxito', 'La imagen ha sido actualizada.');
        } else if(res.code == 1) {
          this.notifications.error('Error', 'El grupo no existe.');
        } else if(res.code == 2) {
          this.notifications.error('Permiso denegado', 'No eres el propierario del grupo.');
        }
      });
  }

  goToView(viewName) {
    switch(viewName) {
      case 'group':
        this.router.navigateByUrl(`/group/${this.groupId}`);
        break;
      case 'user-feed':
        this.router.navigateByUrl('/user-feed');
        break;
    }
  }

  setGroupCardInfo() {
    this.groupCard.text = [
      { text: this.groupSettingsFormGroup.get('nameCtrl').value, style: 'h2' }
    ];
  }

  setAvailablePermissions() {
    let availablePermissions: AvailableGroupPermission[];
    this.academicNetwork.getAvailableGroupPermissions()
      .subscribe(res => {
        if(res.code == 0) {
          availablePermissions = res.data.group_permissions
          for(let p of availablePermissions) {
            this.permissions.push({
              name: p.name,
              codename: p.codename,
              id: p.id,
              granted: 0
            });
          }
        }
      })
  }
}
