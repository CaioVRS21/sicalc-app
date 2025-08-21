import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SimulacoesService, Simulacao } from './simulacoes-service';
import { enviroment } from '../../../enviroments/enviroment';

describe('SimulacoesService', () => {
  let service: SimulacoesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SimulacoesService]
    });
    service = TestBed.inject(SimulacoesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch simulations', () => {
    const mockSimulacoes: Simulacao[] = [
      {
        id: 1,
        produtoNome: 'Produto Teste',
        taxaMensal: 0.01,
        parcela: 100,
        prazo: 12,
        valorDesejado: 1200,
        valorTotal: 1300,
        tipoCalculo: 'price',
        tabelaAmortizacao: []
      }
    ];

    service.listarSimulacoes().subscribe(simulacoes => {
      expect(simulacoes).toEqual(mockSimulacoes);
    });

    const req = httpMock.expectOne(`${enviroment.simulacoesApiUrl}/simulacoes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSimulacoes);
  });

  it('should save a new simulation', () => {
    const novaSimulacao: Simulacao = {
      id: 2,
      produtoNome: 'Produto Novo',
      taxaMensal: 0.02,
      parcela: 200,
      prazo: 24,
      valorDesejado: 4800,
      valorTotal: 5200,
      tipoCalculo: 'sac',
      tabelaAmortizacao: []
    };

    service.salvarSimulacao(novaSimulacao).subscribe(simulacao => {
      expect(simulacao).toEqual(novaSimulacao);
    });

    const req = httpMock.expectOne(`${enviroment.simulacoesApiUrl}/simulacoes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novaSimulacao);
    req.flush(novaSimulacao);
  });
});