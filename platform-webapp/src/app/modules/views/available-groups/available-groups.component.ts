import { Component, OnInit, ViewChild } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { PaginatorData } from '../../classes/components.models';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { ElementCardBoxComponent } from '../../app-components/element-card-box/element-card-box.component';
import { SessionService } from 'src/app/services/session/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-available-groups',
  templateUrl: './available-groups.component.html',
  styleUrls: ['./available-groups.component.css']
})
export class AvailableGroupsComponent implements OnInit {

  public defaultIcon: string = '/assets/people-black-18dp.svg';
  public availableGroups: ElementCard[] = [];
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
    private academicNetwork: AcademicNetworkService,
    private session: SessionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if(!this.session.get_userdata()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.searchGroups()
  }

  pageHandler(event) {
    this.currentPageSize = event.pageSize;
    this.searchGroups(this.currentSearchVal, this.currentPageSize, event.pageIndex);
  }

  searchGroups(search = '', offset = this.paginator.pageSize, page = 0, asc = 1) {
    this.academicNetwork.searchGroups('all', search, offset, page, asc)
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
          this.availableGroups = groups;
        }
      });
  }

  submitSearch() {
    this.currentSearchVal = this.searchVal;
    this.searchGroups(this.currentSearchVal, this.currentPageSize, 0);
    this.elementCardBox.firstPage();
  }
}
