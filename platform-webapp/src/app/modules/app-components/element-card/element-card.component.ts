import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-element-card',
  templateUrl: './element-card.component.html',
  styleUrls: ['./element-card.component.css']
})
export class ElementCardComponent implements OnInit {

  @Input() defaultIcon: string;
  @Input() card: ElementCard;
  @Input() enableClickEvent: boolean = false;
  @Output() clickOverCard: EventEmitter<any> = new EventEmitter<any>();
  public activeClasses: string = 'card';

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    if(this.isClickeable() || this.enableClickEvent) {
      this.activeClasses += ' clickeable';
    }
  }

  isClickeable() {
    return (this.card.externalLink || this.card.internalLink);
  }

  clickHandler() {
    if(this.isClickeable()) {
      if(this.card.internalLink) {
        this.router.navigateByUrl(this.card.internalLink);
      } else if(this.card.externalLink) {
        window.open(this.card.externalLink, '_blank');
      }
    } else if(this.enableClickEvent) {
      this.clickOverCard.emit({
        card: this.card
      });
    }
  }

}
