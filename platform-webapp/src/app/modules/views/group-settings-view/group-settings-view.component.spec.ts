import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSettingsViewComponent } from './group-settings-view.component';

describe('GroupSettingsViewComponent', () => {
  let component: GroupSettingsViewComponent;
  let fixture: ComponentFixture<GroupSettingsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSettingsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSettingsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
