import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSquareCropperComponent } from './image-square-cropper.component';

describe('ImageSquareCropperComponent', () => {
  let component: ImageSquareCropperComponent;
  let fixture: ComponentFixture<ImageSquareCropperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageSquareCropperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageSquareCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
