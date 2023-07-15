import { TestBed } from '@angular/core/testing';

import { PublicationFormaterService } from './publication-formater.service';

describe('PublicationFormaterService', () => {
  let service: PublicationFormaterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicationFormaterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
