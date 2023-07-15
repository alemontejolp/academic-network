import { Component, OnInit, ViewChild } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { SessionService } from 'src/app/services/session/session.service';
import { Router } from '@angular/router';
import { PaginatorData } from '../../classes/components.models';
import { ElementCardBoxComponent } from '../../app-components/element-card-box/element-card-box.component';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';

@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrls: ['./my-groups.component.css']
})
export class MyGroupsComponent implements OnInit {

  public defaultIcon: string = '/assets/people-black-18dp.svg';
  public myGroups: ElementCard[];
  public paginator: PaginatorData = {
    length: null,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30]
  }
  public searchVal: string = '';
  private currentSearchVal: string = '';
  private currentPageSize: number = 10;
  @ViewChild('elementCardBox') elementCardBox: ElementCardBoxComponent;

  constructor(
    private router: Router,
    private session: SessionService,
    private academicNetwork: AcademicNetworkService
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.searchGroups();
  }

  pageHandler(event) {
    this.currentPageSize = event.pageSize;
    this.searchGroups(this.currentSearchVal, this.currentPageSize, event.pageIndex);
  }

  searchGroups(search = '', offset = this.paginator.pageSize, page = 0, asc = 1) {
    this.academicNetwork.searchGroups('user', search, offset, page, asc)
      .subscribe(res => {
        let groups = [];
        if(res.code == 0) {
          this.paginator.length = res.data.total_records;
          for(let g of res.data.groups) {
            groups.push({
              icon: g.image_src,
              text: [{text: g.name, style: 'h2'}],
              internalLink: `/group/${g.id}`,
              externalLink: null
            })
          }
          this.myGroups = groups;
        }
      });
  }

  submitSearch() {
    this.currentSearchVal = this.searchVal;
    this.searchGroups(this.currentSearchVal, this.currentPageSize, 0);
    this.elementCardBox.firstPage();
  }

}
