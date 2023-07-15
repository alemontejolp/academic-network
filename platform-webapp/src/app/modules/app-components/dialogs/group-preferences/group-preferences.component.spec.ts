import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPreferencesComponent } from './group-preferences.component';

describe('GroupPreferencesComponent', () => {
  let component: GroupPreferencesComponent;
  let fixture: ComponentFixture<GroupPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
