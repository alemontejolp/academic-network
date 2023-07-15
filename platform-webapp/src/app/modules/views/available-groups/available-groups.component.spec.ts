import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableGroupsComponent } from './available-groups.component';

describe('AvailableGroupsComponent', () => {
  let component: AvailableGroupsComponent;
  let fixture: ComponentFixture<AvailableGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailableGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
