import { Component, OnInit } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { Publication } from '../../classes/publication.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { PopupsService } from 'src/app/services/popups/popups.service';
import { SessionService } from 'src/app/services/session/session.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { AnimationsService } from 'src/app/services/animations/animations.service';
import { GlobalEventsService } from 'src/app/services/global-events/global-events.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {

  public user: ElementCard = new ElementCard();
  public profileDefaultIcon: string = "/assets/account_circle-black-18dp.svg";
  public publications: Publication[] = [];
  public displayPublicationForm: boolean;
  public target_username: string;

  public voidTimeline: boolean;
  public emptyPostsResponse: boolean;
  private currentPage = 0;
  private pageSize = 5;
  private waitingForPosts = false;

  constructor(
    public router: Router,
    private academicNetwork: AcademicNetworkService,
    private route: ActivatedRoute,
    private popups: PopupsService,
    private session: SessionService,
    private notifications: NotificationsService,
    private animations: AnimationsService,
    private globalEvents: GlobalEventsService,
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.route.params.subscribe(params => {
      let username = params['username'];
      this.target_username = username;
      this.academicNetwork
        .getUserPublicData(username)
          .subscribe(res => {
            console.log(res)
            if(res.code == 0) {
              this.setUserData(res.data);
              this.updatePublicationForm(res.data.username);
            } else if(res.code == 1) {
              this.popups.error(
                'El usuario no existe.',
                'Si llegasta hasta aquí a través de una URL,' +
                ' revisa si el nombre de usario de la URL es correcto.');
            }
          });

      this.globalEvents.onEndOfPage('user-profile-posts', '/users/:string', (e) => {
        console.log('END OF PAGE')
        this.getMorePosts();
      });
  
      //Call the timeline api.
      this.getMorePosts();
    });
  }

  setUserData(userData) {
    this.user = {
      icon: userData.profile_img_src,
      text: [
        {
          text: `${userData.firstname} ${userData.lastname}`,
          style: 'h2'
        },
        {
          text: userData.major,
          style: 'p'
        },
        {
          text: `@${userData.username}`,
          style: 'p'
        },
        {
          text: userData.type_user,
          style: 'p'
        },
        {
          text: userData.created_at,
          style: 'p'
        },
        {
          text: userData.description,
          style: 'p'
        }
      ],
      internalLink: null,
      externalLink: null
    }
  }

  favoriteEventHandler(event) {
    console.log(event)
  }

  commentEventHandler(event) {
    console.log(event)
    this.router.navigateByUrl(`/post/${event.publicationId}`)
  }

  updatePublicationForm(username) {
    let userData = this.session.get_userdata();
    if(userData) {
      if(userData.username == username) {
        this.displayPublicationForm = true;
        return;
      }
    }
    this.displayPublicationForm = false;
  }

  newPublicationHandler(event) {
    if(!event.text && !event.image) {
      this.notifications.info(
        'Publicación vacía',
        'Debes escribir algo o agregar una imagen para publicar');
      return;
    }

    let postData = {
      content: event.text,
      image: event.image
    };

    this.makePost(postData);
  }

  private makePost(postData) {
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.createUserPost(postData)
      .subscribe(res => {
        console.log(res)
        this.animations.globalProgressBarActive = false;
        if(res.code == 0) {
          this.notifications.success(
            'Publicación creada',
            'Tu publicación se ha creado');
          this.publications.unshift(res.data);
        } else if(res.code == 1) {
          this.notifications.info(
            'Publicación vacía',
            'Debes escribir algo o agregar una imagen para publicar');
        } else if(res.code == 2) {
          this.notifications.info(
            'No se puede compartir',
            'La publicación pertenece a un grupo privado');
        }
      });
  }

  getMorePosts() {
    console.log('current page:', this.currentPage)
    if(this.waitingForPosts)
      return;

    this.waitingForPosts = true;
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.getPostsOfUser(this.target_username, this.pageSize, this.currentPage)
      .subscribe(res => {
        this.waitingForPosts = false;
        this.animations.globalProgressBarActive = false;
        if(res.code == 0) {
          this.publications = this.publications.concat(res.data.posts);

          if(res.data.total_records == 0) {
            this.voidTimeline = true;
          } else {
            this.voidTimeline = false;
          }

          if(res.data.posts.length) {
            this.currentPage++;
            this.emptyPostsResponse = false;
          } else {
            this.emptyPostsResponse = true;
          }
        }
      })
  }

}
