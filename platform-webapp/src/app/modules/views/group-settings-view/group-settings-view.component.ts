import { Component, OnInit } from '@angular/core';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { GroupPermission, AvailableGroupPermission } from '../../classes/academic-network.model';
import { ActivatedRoute } from '@angular/router';
import { ElementCard } from '../../classes/student.model';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session/session.service';
import { GroupInformation } from '../../classes/academic-network.model';
import { AnimationsService } from 'src/app/services/animations/animations.service';

@Component({
  selector: 'app-group-settings-view',
  templateUrl: './group-settings-view.component.html',
  styleUrls: ['./group-settings-view.component.css']
})
export class GroupSettingsViewComponent implements OnInit {

  public permissions: GroupPermission[] = [];
  public groupSettingsFormDisabled: boolean = false;
  public groupImageFormDisabled: boolean = false;
  public groupId: number;
  public groupCard: ElementCard = {
    icon:'',
    text: [{text:'', style:'h2'}],
    internalLink: null,
    externalLink: null
  };
  public groupInformation: GroupInformation;

  constructor(
    private academicNetwork: AcademicNetworkService,
    private notifications: NotificationsService,
    private route: ActivatedRoute,
    private router: Router,
    private session: SessionService,
    private animations: AnimationsService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.route.params.subscribe(params => {
      this.groupId = parseInt(params['id']);
      this.setAvailablePermissions();
      this.setGroupCard();
    })
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

  applySettings(event) {
    if(event.invalid) {
      this.notifications.error(
        'Los siguientes campos son requeridos',
        this.prettyFieldNames(event.invalidFields).join(', '));
      return;
    }

    //Call api to update group.
    //Update this.groupCard.text[0].text with the correspondent returned value.
    //from the API call.
    this.notifications.info('No disponible', 'Característica no implementada');
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

  applyImage(event) {
    if(event.invalid) {
      this.notifications.error(
        'No hay imagen',
        'Debes seleccionar una imagen para continuar');
      return;
    }

    this.academicNetwork.updateGroupImage(this.groupId, event.image)
      .subscribe(res => {
        if(res.code == 0) {
          this.groupCard.icon = res.data.image_src;
          this.notifications.success(
            'Éxito', 'La imagen se ha actualizado');
        } else if(res.code == 1) {
          this.notifications.error(
            'Error', 'El grupo no existe');
        }
      })
  }

  setGroupCard() {
    this.animations.globalProgressBarActive = true;
    this.groupSettingsFormDisabled = true;
    this.academicNetwork.getGroupInformation(this.groupId)
      .subscribe(res => {
        this.animations.globalProgressBarActive = false;
        this.groupSettingsFormDisabled = false;
        if(res.code == 0) {
          this.groupInformation = res.data;
          this.groupCard.icon = res.data.group_data.group_image_src || '/assets/people-black-18dp.svg';
          this.groupCard.text[0].text = res.data.group_data.group_name;
        }
      })
  }

  goToGroup() {
    this.router.navigateByUrl(`/group/${this.groupId}`);
  }
}
