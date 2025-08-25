import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculadoraCredito } from './calculadora-credito';
import { ProdutosService } from '../service/produtos-service/produtos-service';
import { SimulacoesService } from '../service/simulacoes-service/simulacoes-service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../service/toast-service/toast-service';

describe('CalculadoraCredito', () => {
  let component: CalculadoraCredito;
  let fixture: ComponentFixture<CalculadoraCredito>;
  let produtosServiceSpy: jasmine.SpyObj<ProdutosService>;
  let simulacoesServiceSpy: jasmine.SpyObj<SimulacoesService>;
  let toastService: ToastService;

 beforeEach(async () => {
  produtosServiceSpy = jasmine.createSpyObj('ProdutosService', ['listarProdutos']);
  simulacoesServiceSpy = jasmine.createSpyObj('SimulacoesService', ['listarSimulacoes', 'salvarSimulacao']);

  produtosServiceSpy.listarProdutos.and.returnValue(of([]));

  await TestBed.configureTestingModule({
    imports: [FormsModule, CalculadoraCredito],
    providers: [
      { provide: ProdutosService, useValue: produtosServiceSpy },
      { provide: SimulacoesService, useValue: simulacoesServiceSpy },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: new Map() },
          params: of({}),
          queryParams: of({})
        }
      },
      ToastService
    ]
  }).compileComponents();

    fixture = TestBed.createComponent(CalculadoraCredito);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges(); 
});


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
  const mockProdutos = [{ id: 1, nome: 'Produto Teste', taxaAnual: 10, prazoMaximoMeses: 12 }];
  produtosServiceSpy.listarProdutos.and.returnValue(of(mockProdutos));

  component.ngOnInit();

  expect(component.produtos).toEqual(mockProdutos);
  expect(component.produtoNome).toBe('Produto Teste');
});

  it('should calculate Price table correctly', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 12 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 1200;
    component.prazo = 12;
    component.tipoCalculo = 'price';

    // Mock services for salvarSimulacao
    simulacoesServiceSpy.listarSimulacoes.and.returnValue(of([]));
    simulacoesServiceSpy.salvarSimulacao.and.returnValue(of({
  id: 1,
  produtoNome: 'Teste',
  taxaMensal: 1,
  parcela: 100,
  prazo: 12,
  valorDesejado: 1200,
  valorTotal: 1200,
  tipoCalculo: 'price',
  tabelaAmortizacao: []
}));

    component.calcular();

    expect(component.parcela).toBeGreaterThan(0);
    expect(component.tabelaAmortizacao.length).toBe(12);
    expect(component.tabelaAmortizacao[0].parcela).toBeDefined();
  });

  it('should calculate SAC table correctly', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 12 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 1200;
    component.prazo = 12;
    component.tipoCalculo = 'sac';


    simulacoesServiceSpy.listarSimulacoes.and.returnValue(of([]));
    simulacoesServiceSpy.salvarSimulacao.and.returnValue(of({
      id: 1,
      produtoNome: 'Teste',
      taxaMensal: 1,
      parcela: 100,
      prazo: 12,
      valorDesejado: 1200,
      valorTotal: 1200,
      tipoCalculo: 'sac',
      tabelaAmortizacao: []
    }));

    component.calcular();

    expect(component.tabelaAmortizacao.length).toBe(12);
    expect(component.tabelaAmortizacao[0].amortizacao).toBeCloseTo(100);
    expect(component.tabelaAmortizacao[0].parcela).toBeGreaterThan(100);
  });

  it('should prevent calculate when prazo exceeds product limit', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 12 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 1000;
    component.prazo = 13; // inválido

    // onPrazoChange deve setar mensagem de erro
    component.onPrazoChange();
    expect(component.prazoErroMsg).toContain('Prazo máximo');

    // garantir que validar bloqueia o cálculo
    expect(component.isPrazoValido()).toBeFalse();
    simulacoesServiceSpy.listarSimulacoes.calls.reset();
    component.calcular();
    expect(simulacoesServiceSpy.listarSimulacoes).not.toHaveBeenCalled();
  });

  it('should paginate table correctly (pageSize = 12)', () => {
    // usar prazo 24 para gerar 24 linhas
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 24 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 2400;
    component.prazo = 24;
    component.tipoCalculo = 'price';

    // simular salvar/listar
    simulacoesServiceSpy.listarSimulacoes.and.returnValue(of([]));
    simulacoesServiceSpy.salvarSimulacao.and.returnValue(of({
      id: 1,
      produtoNome: 'Teste',
      taxaMensal: 1,
      parcela: 100,
      prazo: 12,
      valorDesejado: 1200,
      valorTotal: 1200,
      tipoCalculo: 'price',
      tabelaAmortizacao: []
    }));

    component.calcular();

    expect(component.tabelaAmortizacao.length).toBe(24);
    expect(component.totalPages).toBe(2);
    // página inicial
    expect(component.pagedResults.length).toBe(component.pageSize);
    // avançar página
    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.pagedResults.length).toBe(12);
    // voltar página
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should call toastService.success once when salvarSimulacao succeeds', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 12 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 1200;
    component.prazo = 12;
    component.tipoCalculo = 'price';

    simulacoesServiceSpy.listarSimulacoes.and.returnValue(of([]));
    simulacoesServiceSpy.salvarSimulacao.and.returnValue(of({ 
    id: 1,
    produtoNome: 'Teste',
    taxaMensal: 1,
    parcela: 100,
    prazo: 12,
    valorDesejado: 1200,
    valorTotal: 1200,
    tipoCalculo: 'price',
    tabelaAmortizacao: [] }));

    const successSpy = spyOn(toastService, 'success');

    component.calcular();

    expect(successSpy).toHaveBeenCalledTimes(1);
  });

  it('should call toastService.error when salvarSimulacao fails', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 12 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 1200;
    component.prazo = 12;
    component.tipoCalculo = 'price';

    simulacoesServiceSpy.listarSimulacoes.and.returnValue(of([]));
    simulacoesServiceSpy.salvarSimulacao.and.returnValue(throwError(() => new Error('fail')));

    const errorSpy = spyOn(toastService, 'error');

    component.calcular();

    expect(errorSpy).toHaveBeenCalled();
  });
});