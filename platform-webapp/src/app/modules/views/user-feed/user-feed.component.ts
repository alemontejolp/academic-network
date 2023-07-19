import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Publication } from '../../classes/publication.model';
import { SessionService } from 'src/app/services/session/session.service';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { AnimationsService } from 'src/app/services/animations/animations.service';
import { GlobalEventsService } from 'src/app/services/global-events/global-events.service';
import { UtilitiesService } from 'src/app/services/utilities/utilities.service';

@Component({
  selector: 'app-user-feed',
  templateUrl: './user-feed.component.html',
  styleUrls: ['./user-feed.component.css']
})
export class UserFeedComponent implements OnInit {

  public publications: Publication[] = [];
  public voidTimeline: boolean;
  public emptyPostsResponse: boolean;
  private currentPage = 0;
  private pageSize = 20;
  private waitingForPosts = false;

  constructor(
    public router: Router,
    private session: SessionService,
    private academicNetwork: AcademicNetworkService,
    private notifications: NotificationsService,
    private animations: AnimationsService,
    private globalEvents: GlobalEventsService,
    private utilities: UtilitiesService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.globalEvents.onEndOfPage('user-feed-posts', '/user-feed', (e) => {
      console.log('END OF PAGE')
      this.getMorePosts();
    });

    //Call the timeline api.
    this.getMorePosts();
  }

  private makePost(postData) {
    this.waitingForPosts = true;
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.createUserPost(postData)
      .subscribe(res => {
        console.log(res)
        this.waitingForPosts = false;
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
        this.publications.unshift(newPost);
      });
  }

  getMorePosts() {
    console.log('current page:', this.currentPage)
    if(this.waitingForPosts)
      return;

    this.waitingForPosts = true;
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.getUserTimeline(this.pageSize, this.currentPage)
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
