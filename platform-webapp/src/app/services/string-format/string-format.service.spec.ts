import { TestBed } from '@angular/core/testing';

import { StringFormatService } from './string-format.service';

describe('StringFormatService', () => {
  let service: StringFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StringFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
