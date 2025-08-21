import { TestBed } from '@angular/core/testing';

import { SimulacoesService } from './simulacoes-service';

describe('SimulacoesService', () => {
  let service: SimulacoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulacoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
