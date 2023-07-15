import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleFieldFormN2optionsComponent } from './single-field-form-n2options.component';

describe('SingleFieldFormN2optionsComponent', () => {
  let component: SingleFieldFormN2optionsComponent;
  let fixture: ComponentFixture<SingleFieldFormN2optionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleFieldFormN2optionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleFieldFormN2optionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
