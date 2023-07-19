import { Component, OnInit } from '@angular/core';
import { Publication } from '../../classes/publication.model';
import { Router } from '@angular/router';
import { ElementCard } from '../../classes/student.model';
import { MatDialog } from '@angular/material/dialog';
import { GroupPreferences } from '../../classes/dialogs.model';
import { GroupPreferencesComponent } from '../../app-components/dialogs/group-preferences/group-preferences.component';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { SessionService } from 'src/app/services/session/session.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { PopupsService } from 'src/app/services/popups/popups.service';
import { GroupData, MembershipInformation } from '../../classes/academic-network.model';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { GlobalEventsService } from 'src/app/services/global-events/global-events.service';
import { AnimationsService } from 'src/app/services/animations/animations.service';
import { UtilitiesService } from 'src/app/services/utilities/utilities.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  public publications: Publication[] = [];
  public voidTimeline: boolean;
  public groupCard: ElementCard = new ElementCard();
  public defaultIcon: string = '/assets/people-black-18dp.svg';
  public groupPreferences: GroupPreferences = new GroupPreferences(true);
  public groupData: GroupData = new GroupData();
  public groupId: number;
  public membershipInfo: MembershipInformation = new MembershipInformation();
  private page: number = 0;
  private pageSize: number = 20;
  private waitingForPosts: boolean = false;
  public noMorePosts: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private academicNetwork: AcademicNetworkService,
    private session: SessionService,
    private route: ActivatedRoute,
    private popups: PopupsService,
    private notifications: NotificationsService,
    private globalEvents: GlobalEventsService,
    private animations: AnimationsService,
    private utilities: UtilitiesService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.route.params.subscribe(params => {
      let groupId = params['id'];
      this.groupId = parseInt(groupId);
      this.setGroupInformation(groupId);
      this.setMembershipInfo(groupId)
      this.getMorePosts();
      this.globalEvents.onEndOfPage('group-posts', '/group/:number', (event) => {
        console.log('Current page:', this.page);
        this.getMorePosts();
      });
    })
  }

  newPublicationHandler(event) {
    console.log(event);
    let postData = {
      content: event.text,
      image: event.image
    };
    this.createPost(postData, this.groupId);
  }

  favoriteEventHandler(event) {
    console.log(event)
    this.utilities.setFavoriteStatus(event).subscribe();
  }

  commentEventHandler(event) {
    console.log(event)
    this.router.navigateByUrl(`/post/${event.publicationId}`)
  }

  shareEventHandler(event) {
    console.log(event)
    this.utilities.startProcessToSharePost(event)
      .subscribe((newPost: Publication) => {
        if(newPost.group_id == this.groupId) {
          this.publications.unshift(newPost);
        }
      });
  }

  openPreferences() {
    console.log(this.groupPreferences)
    const dialogRef = this.dialog.open(GroupPreferencesComponent, {
      width: '400px',
      data: this.groupPreferences.clone()
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('dialog was closed');
      console.log(result);
      if(result) {
        if(result.action == 'save-preferences') {
          this.groupPreferences = result.data;
          let state = (this.groupPreferences.listenForNotifications) ? 1 : 0;
          this.academicNetwork.swicthGroupNotifications(this.groupId, state)
            .subscribe(res => {
              if (res.code == 0) {
                this.notifications.success(
                  'Preferencias actualizadas',
                  'Las preferencias de para este grupo se han guardado exitosamente');
              }
            });
        } else if(result.action == 'leave-group') {
          //call api to leave the group.
          //redirect to /group/available
          alert('haz dejado el grupo');
          this.router.navigateByUrl('/group/available');
        }
      }
    })
  }

  setGroupInformation(groupId) {
    this.academicNetwork.getGroupInformation(groupId)
      .subscribe(data => {
        if(data.code == 0) {
          //Store group data
          this.groupData = data.data.group_data;
          //Set group card
          this.groupCard.icon = data.data.group_data.group_image_src
          this.groupCard.text = [
            {
              text: data.data.group_data.group_name,
              style: 'h2'
            },
            {
              text: data.data.group_data.group_description,
              style: 'p'
            },
            {
              text: data.data.group_data.group_visibility == 'public' ? 'Público' : 'Privado',
              style: 'p'
            },
            {
              text: moment(data.data.group_data.group_created_at).format('MMMM DD, YYYY'),
              style: 'p'
            }
          ];
        } else if(data.code == 1) {
          this.popups.error(
            'Grupo no encontrado',
            'Lo sentimos, el grupo al que estás intentando acceder no existe.'
          );
        }
      });
  }

  isUserOwner() {
    let userData = this.session.get_userdata()
    if(userData.username == this.groupData.owner_username) {
      return true;
    }
    return false;
  }

  goToSettings() {
    this.router.navigateByUrl(`/group/${this.groupId}/settings`)
  }

  setMembershipInfo(groupId) {
    this.academicNetwork.getMembershipInfo(groupId)
      .subscribe(res => {
        if (res.code == 0) {
          this.membershipInfo = res.data;
          this.groupPreferences.listenForNotifications = res.data.active_notifications;
        }
      })
  }

  isMember() {
    return this.membershipInfo.is_member
  }

  getMorePosts() {
    if (this.waitingForPosts) {
      return;
    }
    
    this.waitingForPosts = true;
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.getGroupPosts(this.groupId, this.pageSize, this.page)
      .subscribe(res => {
        console.log(res)
        this.waitingForPosts = false;
        this.animations.globalProgressBarActive = false;

        if (res.code == 0) {
          this.publications = this.publications.concat(res.data.group_posts);
          if (res.data.total_records == 0) {
            this.voidTimeline = true;
          }
          if (!res.data.group_posts.length) {
            this.noMorePosts = true;
          } else {
            this.page++;
          }
        } else if (res.code == 1) {
          this.notifications.info(
            'El grupo no existe',
            'Se intentó recuperar publicaciones de un grupo inexistente');
        } else if (res.code == 2) {
          this.notifications.info(
            'Grupo privado',
            'Sólo los miembros de este grupo pueden ver sus publicaciones');
        }
      });
  }

  createPost(postData, groupId) {
    this.waitingForPosts = true;
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.createGroupPost(postData, groupId)
      .subscribe(res => {
        this.waitingForPosts = false;
        this.animations.globalProgressBarActive = false;
        switch(res.code) {
          case 0: //success
            this.publications.unshift(res.data);
          break;
          case 1: //group does not exist.
            this.notifications.error(
              'No se pudo crear la publicación',
              'El grupo no existe');
          break;
          case 2: //group doesn't have create-post permission.
            this.notifications.info(
              'No se pudo crear la publicación.',
              'El grupo no tiene permiso de publicación');
          case 3: //No data was sent.
            this.notifications.info(
              'No se pudo crear la publicación.',
              'No se enviaron datos');
          break;
          case 4: //user is not member of the group.
            this.notifications.error(
              'No se pudo crear la publicación.',
              'El usuario no es parte del grupo');
          break;
          case 5: //shared post belongs to a private group.
            this.notifications.info(
              'No se pudo crear la publicación.',
              'El grupo al que pertenece la publicación compartida es privado');
          break;
        }
      });
  }
}
