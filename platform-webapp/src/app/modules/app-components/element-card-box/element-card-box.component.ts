import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { PaginatorData } from '../../classes/components.models';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-element-card-box',
  templateUrl: './element-card-box.component.html',
  styleUrls: ['./element-card-box.component.css']
})
export class ElementCardBoxComponent implements OnInit {

  @Input() defaultIcon: string;
  @Input() data: ElementCard[];
  @Input() paginatorData: PaginatorData;
  @Output() page: EventEmitter<any> = new EventEmitter();
  @ViewChild('paginator') paginator: MatPaginator;

  constructor() { }

  ngOnInit(): void {
  }

  pageHandler(event) {
    this.page.emit(event);
  }

  firstPage() {
    this.paginator.firstPage();
  }

}
