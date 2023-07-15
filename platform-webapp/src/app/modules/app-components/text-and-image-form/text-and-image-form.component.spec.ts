import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAndImageFormComponent } from './text-and-image-form.component';

describe('TextAndImageFormComponent', () => {
  let component: TextAndImageFormComponent;
  let fixture: ComponentFixture<TextAndImageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextAndImageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextAndImageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
