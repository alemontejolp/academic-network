import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Publication } from '../../classes/publication.model';
import { PublicationFormaterService } from '../../../services/publication-formater/publication-formater.service'

@Component({
  selector: 'app-publication-display',
  templateUrl: './publication-display.component.html',
  styleUrls: ['./publication-display.component.css']
})
export class PublicationDisplayComponent implements OnInit {

  constructor(
    public pubFmt: PublicationFormaterService
  ) { }

  @Input() publication: Publication;
  @Input() activeButtons: Array<string> = [];

  @Output() favorite: EventEmitter<any> = new EventEmitter<any>();
  @Output() comment: EventEmitter<any> = new EventEmitter<any>();
  @Output() share: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
  }

  favoriteEventHandler(event) {
    this.favorite.emit(event);
  }

  commentEventHandler(event) {
    this.comment.emit(event);
  }

  shareEventHandler(event) {
    this.share.emit(event);
  }

}
