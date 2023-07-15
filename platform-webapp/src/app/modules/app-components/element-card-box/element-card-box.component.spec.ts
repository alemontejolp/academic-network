import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementCardBoxComponent } from './element-card-box.component';

describe('ElementCardBoxComponent', () => {
  let component: ElementCardBoxComponent;
  let fixture: ComponentFixture<ElementCardBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementCardBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementCardBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
