import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StringFormatService } from '../../../services/string-format/string-format.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-publication-card',
  templateUrl: './publication-card.component.html',
  styleUrls: ['./publication-card.component.css']
})
export class PublicationCardComponent implements OnInit {

  @Input() postId: number;
  @Input() profileImgSrc:string;
  @Input() profileName:string = '';
  @Input() publicationImgSrc:string;
  @Input() text:string = '';
  @Input() username:string;
  @Input() groupName: string;
  @Input() groupId: number; // to link the gorup in the view
  @Input() createdAt: string;
  @Input() likeCounter: number;
  @Input() liked: number;
  @Input() isSharedContent: boolean;
  @Input() subPostId: number;
  @Input() subProfileImgSrc:string;
  @Input() subProfileName:string = '';
  @Input() subPublicationImgSrc:string;
  @Input() subText:string = '';
  @Input() subUsername:string;
  @Input() subGroupName: string;
  @Input() subGroupId: number; // to link the gorup in the view
  @Input() subCreatedAt: string;
  @Input() activeButtons: Array<string> = [];
  @Output() favorite: EventEmitter<any> = new EventEmitter();
  @Output() share: EventEmitter<any> = new EventEmitter();
  @Output() comment: EventEmitter<any> = new EventEmitter();
  public altProfileImg = 'Ávatar de ' + this.profileName;
  public altPublicationImg = 'Publicación de ' + this.profileName;
  public defaultImageProfile = '/assets/account_circle-black-18dp.svg';

  constructor(
    public stringFormat: StringFormatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.stringFormat.splitByEOL(this.text))
  }

  favoriteEvent() {
    if(this.liked == null || this.liked == 0) {
      this.liked = 1;
      this.likeCounter++;
    } else {
      this.liked = 0;
      this.likeCounter--;
    }

    this.favorite.emit({
      publicationId: this.postId,
      favoriteStatus: this.liked
    })
  }

  shareEvent() {
    this.share.emit({
      publicationId: this.subPostId || this.postId
    })
  }

  commentEvent() {
    this.comment.emit({
      publicationId: this.postId
    })
  }

  isButtonInList(name) {
    //show it only if it is in list.
    for(let btnName of this.activeButtons) {
      if(btnName == name)
        return true
    }

    return false
  }

  dateFormat(date) {
    return this.stringFormat.dateFormat(date)
  }

  goToProfile(username) {
    this.router.navigateByUrl(`/users/${username}`);
  }

  goToGroup(groupId) {
    if(groupId) {
      this.router.navigateByUrl(`/group/${groupId}`);
    }
  }

}
