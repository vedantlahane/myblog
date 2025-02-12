import { TestBed } from '@angular/core/testing';

import { FetchblogService } from './fetchblog.service';

describe('FetchblogService', () => {
  let service: FetchblogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchblogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
