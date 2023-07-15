import { Component, OnInit, ViewChild } from '@angular/core';
import { ElementCard } from '../../classes/student.model';
import { PaginatorData } from '../../classes/components.models';
import { ElementCardBoxComponent } from '../../app-components/element-card-box/element-card-box.component';
import { AcademicNetworkService } from 'src/app/services/academic-network/academic-network.service';
import { SessionService } from 'src/app/services/session/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  public defaultIcon: string = '/assets/account_circle-black-18dp.svg';
  public users: ElementCard[];
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

    this.searchUsers();
  }

  submitSearch() {
    this.currentSearchVal = this.searchVal;
    this.searchUsers(this.currentSearchVal, this.currentPageSize, 0);
    this.elementCardBox.firstPage();
  }

  searchUsers(search = '', offset = this.paginator.pageSize, page = 0, asc = 1) {
    this.academicNetwork.searchUsers('all', search, offset, page, asc)
      .subscribe(res => {
        let users = [];
        if(res.code == 0) {
          this.paginator.length = res.data.total_records;
          for(let u of res.data.users) {
            users.push({
              icon: u.profile_img_src,
              text: [{text: u.firstname + ' ' + u.lastname, style: 'h2'}],
              internalLink: `/users/${u.username}`,
              externalLink: null
            })
          }
          this.users = users;
        }
      });
  }

  pageHandler(event) {
    console.log(event)
    this.currentPageSize = event.pageSize;
    this.searchUsers(this.currentSearchVal, this.currentPageSize, event.pageIndex);
  }

}
