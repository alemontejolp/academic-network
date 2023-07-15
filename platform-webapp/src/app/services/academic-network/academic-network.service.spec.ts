import { TestBed } from '@angular/core/testing';

import { AcademicNetworkService } from './academic-network.service';

describe('AcademicNetworkService', () => {
  let service: AcademicNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcademicNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
