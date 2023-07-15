import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritePostsComponent } from './favorite-posts.component';

describe('FavoritePostsComponent', () => {
  let component: FavoritePostsComponent;
  let fixture: ComponentFixture<FavoritePostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoritePostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoritePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
