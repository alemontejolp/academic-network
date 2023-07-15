import { Component, OnInit } from '@angular/core';
import { Publication } from '../../classes/publication.model';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session/session.service';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { AnimationsService } from 'src/app/services/animations/animations.service';
import { GlobalEventsService } from 'src/app/services/global-events/global-events.service';
import { UtilitiesService } from 'src/app/services/utilities/utilities.service';

@Component({
  selector: 'app-favorite-posts',
  templateUrl: './favorite-posts.component.html',
  styleUrls: ['./favorite-posts.component.css']
})
export class FavoritePostsComponent implements OnInit {

  private page: number = 0;
  private pageSize: number = 20;
  private waitingForPosts: boolean;

  public publications: Array<Publication> = [];
  public voidTimeline: boolean;
  public noMorePosts: boolean;

  constructor(
    public router: Router,
    private session: SessionService,
    private academicNetwork: AcademicNetworkService,
    private animations: AnimationsService,
    private globalEvents: GlobalEventsService,
    private utilities: UtilitiesService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.getMorePosts();
    this.globalEvents.onEndOfPage('favorite-posts', '/post/favorites', (event) => {
      console.log('CURRENT PAGE:', this.page);
      this.getMorePosts();
    })
  }

  favoriteEventHandler(event) {
    console.log(event)
  }

  commentEventHandler(event) {
    console.log(event)
    this.router.navigateByUrl(`/post/${event.publicationId}`)
  }

  shareEventHandler(event) {
    console.log(event)
    this.utilities.startProcessToSharePost(event)
      .subscribe();
  }

  getMorePosts() {
    if (this.waitingForPosts) {
      return;
    }
    
    this.waitingForPosts = true;
    this.animations.globalProgressBarActive = true;
    this.academicNetwork.getFavoritePosts(this.pageSize, this.page)
      .subscribe(res => {
        console.log(res)
        this.waitingForPosts = false;
        this.animations.globalProgressBarActive = false;

        if (res.code == 0) {
          this.publications = this.publications.concat(res.data.favorite_posts);
          if (res.data.total_records == 0) {
            this.voidTimeline = true;
          }
          if (!res.data.favorite_posts.length) {
            this.noMorePosts = true;
          } else {
            this.page++;
          }
        }
      });
  }

}
