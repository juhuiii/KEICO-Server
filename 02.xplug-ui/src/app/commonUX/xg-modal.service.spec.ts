import { TestBed } from '@angular/core/testing';

import { XgModalService } from './xg-modal.service';

describe('XgModalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: XgModalService = TestBed.get(XgModalService);
    expect(service).toBeTruthy();
  });
});
