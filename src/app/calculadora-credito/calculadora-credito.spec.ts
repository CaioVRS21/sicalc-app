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
  let produtosService: any;
  let simulacoesService: any;
  let toastService: any;

  beforeEach(async () => {
   produtosService = {
     listarProdutos: jest.fn()
   };
   simulacoesService = {
     listarSimulacoes: jest.fn(),
     salvarSimulacao: jest.fn()
   };

   produtosService.listarProdutos.mockReturnValue(of([]));

   toastService = {
     success: jest.fn(),
     error: jest.fn(),
     info: jest.fn(),
     warning: jest.fn()
   };

   await TestBed.configureTestingModule({
     imports: [FormsModule, CalculadoraCredito],
     providers: [
       { provide: ProdutosService, useValue: produtosService },
       { provide: SimulacoesService, useValue: simulacoesService },
       { provide: ToastService, useValue: toastService },
       {
         provide: ActivatedRoute,
         useValue: {
           snapshot: { paramMap: new Map() },
           params: of({}),
           queryParams: of({})
         }
       }
     ]
   }).compileComponents();

     fixture = TestBed.createComponent(CalculadoraCredito);
     component = fixture.componentInstance;
     fixture.detectChanges(); 

    produtosService.listarProdutos.mockReturnValue(of([]));
    component.ngOnInit();
    expect(component.produtoNome).toBe('');

    produtosService.listarProdutos.mockReturnValue(of([{id:1,nome:'X',taxaAnual:1,prazoMaximoMeses:1}]));
    component.ngOnInit();
    expect(component.produtoNome).toBe('X');

    component.produtos = [{id:1,nome:'P',taxaAnual:1,prazoMaximoMeses:1}];
    component.produtoSelecionadoId = 1;
    expect(component.produtoSelecionado).toBeDefined();

    component.produtoSelecionadoId = 999;
    expect(component.produtoSelecionado).toBeUndefined();

    simulacoesService.listarSimulacoes.mockClear();
    component.produtos = [{
      id: 1, prazoMaximoMeses: 6,
      nome: '',
      taxaAnual: null
    }];
    component.produtoSelecionadoId = 1;
    component.prazo = 7;
    component.calcular();
    expect(simulacoesService.listarSimulacoes).not.toHaveBeenCalled();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
  const mockProdutos = [{ id: 1, nome: 'Produto Teste', taxaAnual: 10, prazoMaximoMeses: 12 }];
  produtosService.listarProdutos.mockReturnValue(of(mockProdutos));

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

    simulacoesService.listarSimulacoes.mockReturnValue(of([]));
    simulacoesService.salvarSimulacao.mockReturnValue(of({
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


    simulacoesService.listarSimulacoes.mockReturnValue(of([]));
    simulacoesService.salvarSimulacao.mockReturnValue(of({
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
    component.prazo = 13; 

    component.onPrazoChange();
    expect(component.prazoErroMsg).toContain('Prazo máximo');

    expect(component.isPrazoValido()).toBe(false);
    simulacoesService.listarSimulacoes.mockClear();
    component.calcular();
    expect(simulacoesService.listarSimulacoes).not.toHaveBeenCalled();
  });

  it('should paginate table correctly (pageSize = 12)', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 24 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 2400;
    component.prazo = 24;
    component.tipoCalculo = 'price';

    simulacoesService.listarSimulacoes.mockReturnValue(of([]));
    simulacoesService.salvarSimulacao.mockReturnValue(of({
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
    expect(component.pagedResults.length).toBe(component.pageSize);
    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.pagedResults.length).toBe(12);
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should call toastService.success once when salvarSimulacao succeeds', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 12 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 1200;
    component.prazo = 12;
    component.tipoCalculo = 'price';

    simulacoesService.listarSimulacoes.mockReturnValue(of([]));
    simulacoesService.salvarSimulacao.mockReturnValue(of({ 
    id: 1,
    produtoNome: 'Teste',
    taxaMensal: 1,
    parcela: 100,
    prazo: 12,
    valorDesejado: 1200,
    valorTotal: 1200,
    tipoCalculo: 'price',
    tabelaAmortizacao: [] }));

    const successSpy = jest.spyOn(toastService, 'success');

    component.calcular();

    expect(successSpy).toHaveBeenCalledTimes(1);
  });

  it('should call toastService.error when salvarSimulacao fails', () => {
    component.produtos = [{ id: 1, nome: 'Teste', taxaAnual: 12, prazoMaximoMeses: 12 }];
    component.produtoSelecionadoId = 1;
    component.valorDesejado = 1200;
    component.prazo = 12;
    component.tipoCalculo = 'price';

    simulacoesService.listarSimulacoes.mockReturnValue(of([]));
    simulacoesService.salvarSimulacao.mockReturnValue(throwError(() => new Error('fail')));

    const errorSpy = jest.spyOn(toastService, 'error');

    component.calcular();

    expect(errorSpy).toHaveBeenCalled();
  });

  it('calcularParcela does nothing when missing inputs', () => {
  component.produtos = []; component.produtoSelecionadoId = null;
  component.valorDesejado = null; component.prazo = null;
  component.calcularParcela();
  expect(component.parcela).toBeNull();
  expect(component.valorTotal).toBeNull();
  expect(component.tabelaAmortizacao.length).toBe(0);
});

it('calcularParcela computes expected values for price', () => {
  component.produtos = [{ id: 1, nome: 'P', taxaAnual: 12, prazoMaximoMeses: 12 }];
  component.produtoSelecionadoId = 1;
  component.valorDesejado = 1200;
  component.prazo = 12;
  component.calcularParcela();
  expect(component.parcela).toBeGreaterThan(0);
  expect(component.valorTotal).toBeCloseTo(component.parcela! * 12, 2);
  expect(component.taxaMensal).toBeCloseTo(0.01, 6); 
});

it('calcularAmortizacaoSAC produces constant amortizacao and final saldo zero', () => {
  component.produtos = [{ id: 1, nome: 'P', taxaAnual: 12, prazoMaximoMeses: 3 }];
  component.produtoSelecionadoId = 1;
  component.valorDesejado = 300;
  component.prazo = 3;
  component.calcularAmortizacaoSAC();
  expect(component.tabelaAmortizacao[0].amortizacao).toBeCloseTo(100);
  expect(component.tabelaAmortizacao.length).toBe(3);
  expect(component.tabelaAmortizacao[2].saldo).toBeCloseTo(0, 2);
});

it('salvarSimulacao shows error when listarSimulacoes fails', () => {
  simulacoesService.listarSimulacoes.mockReturnValue(throwError(() => new Error('fail')));
  const errSpy = jest.spyOn(toastService, 'error');
  component.produtos = [{ id:1, nome:'P', taxaAnual:12, prazoMaximoMeses:12 }];
  component.produtoSelecionadoId = 1; component.valorDesejado = 100; component.prazo = 1;
  component.calcular(); 
  expect(errSpy).toHaveBeenCalled();
});

it('shows error when salvarSimulacao POST fails', () => {
  simulacoesService.listarSimulacoes.mockReturnValue(of([]));
  simulacoesService.salvarSimulacao.mockReturnValue(throwError(() => new Error('post fail')));
  const errSpy = jest.spyOn(toastService, 'error');
  component.produtos = [{ id:1, nome:'P', taxaAnual:12, prazoMaximoMeses:12 }];
  component.produtoSelecionadoId = 1; component.valorDesejado = 100; component.prazo = 1;
  component.calcular();
  expect(errSpy).toHaveBeenCalled();
});

it('produtoSelecionado returns undefined for unknown id', () => {
  component.produtos = [{ id: 1, nome: 'P', taxaAnual: 1, prazoMaximoMeses: 1 }];
  component.produtoSelecionadoId = 999;
  expect(component.produtoSelecionado).toBeUndefined();
});

it('onProdutoChange resets dependent fields', () => {
  component.valorDesejado = 100; component.prazo = 12; component.tabelaAmortizacao = [{} as any];
  component.onProdutoChange();
  expect(component.valorDesejado).toBeNull();
  expect(component.prazo).toBeNull();
  expect(component.tabelaAmortizacao.length).toBe(0);
});

it('pagination next/prev do not exceed bounds', () => {
  // cria tabela com 25 linhas -> totalPages = 3 (12 per page)
  component.tabelaAmortizacao = new Array(25).fill(0).map((_,i)=>({parcela:i} as any));
  component.resetPagination();
  expect(component.totalPages).toBe(3);
  component.nextPage(); component.nextPage(); component.nextPage(); // várias invocações
  expect(component.currentPage).toBe(component.totalPages);
  component.prevPage(); component.prevPage(); component.prevPage();
  expect(component.currentPage).toBe(1);
});

it('submit button is disabled when prazo invalido', () => {
  component.produtos = [{ id:1, nome:'P', taxaAnual:12, prazoMaximoMeses: 6 }];
  component.produtoSelecionadoId = 1;
  component.valorDesejado = 100;
  component.prazo = 7;
  fixture.detectChanges();
  const btn = fixture.nativeElement.querySelector('button[type="submit"]');
  expect(btn.disabled).toBe(true);
});

it('logs success when salvarSimulacao succeeds', () => {
  simulacoesService.listarSimulacoes.mockReturnValue(of([]));
  simulacoesService.salvarSimulacao.mockReturnValue(of({ id:1 }));
  const logSpy = jest.spyOn(console, 'log').mockImplementation();
  component.produtos = [{ id:1, nome:'P', taxaAnual:12, prazoMaximoMeses:12 }];
  component.produtoSelecionadoId = 1; component.valorDesejado = 100; component.prazo = 1;
  component.calcular();
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Simulação salva'), expect.any(Object));
  logSpy.mockRestore();
});

it('logs error and shows toast when listarSimulacoes fails (console.error)', () => {
  simulacoesService.listarSimulacoes.mockReturnValue(throwError(() => new Error('fetch fail')));
  const consoleErr = jest.spyOn(console, 'error').mockImplementation();
  const toastErr = jest.spyOn(toastService, 'error');

  component.produtos = [{ id:1, nome:'P', taxaAnual:12, prazoMaximoMeses:12 }];
  component.produtoSelecionadoId = 1; component.valorDesejado = 100; component.prazo = 1;
  component.calcular();

  expect(toastErr).toHaveBeenCalledWith('Erro ao buscar simulações.');
  expect(consoleErr).toHaveBeenCalledWith('Erro ao buscar simulações:', expect.any(Error));

  consoleErr.mockRestore();
  toastErr.mockRestore();
});

it('logs error and shows toast when salvarSimulacao POST fails (console.error)', () => {
  simulacoesService.listarSimulacoes.mockReturnValue(of([]));
  simulacoesService.salvarSimulacao.mockReturnValue(throwError(() => new Error('post fail')));
  const consoleErr = jest.spyOn(console, 'error').mockImplementation();
  const toastErr = jest.spyOn(toastService, 'error');

  component.produtos = [{ id:1, nome:'P', taxaAnual:12, prazoMaximoMeses:12 }];
  component.produtoSelecionadoId = 1; component.valorDesejado = 100; component.prazo = 1;
  component.calcular();

  expect(toastErr).toHaveBeenCalledWith('Erro ao salvar simulação.');
  expect(consoleErr).toHaveBeenCalledWith('Erro ao salvar simulação:', expect.any(Error));

  consoleErr.mockRestore();
  toastErr.mockRestore();
});
it('onPrazoChange clears message when no produto or prazo is null', () => {
  // no produto selected
  component.produtos = [];
  component.prazo = null;
  component.onPrazoChange();
  expect(component.prazoErroMsg).toBeNull();

  // product exists but prazo null
  component.produtos = [{ id: 1, nome: 'X', taxaAnual: 10, prazoMaximoMeses: 12 }];
  component.produtoSelecionadoId = 1;
  component.prazo = null;
  component.onPrazoChange();
  expect(component.prazoErroMsg).toBeNull();
});

it('isPrazoValido returns true when no product or no prazo', () => {
  component.produtos = [];
  component.prazo = 12;
  expect(component.isPrazoValido()).toBe(true);

  component.produtos = [{ id:1, nome:'P', taxaAnual:1, prazoMaximoMeses:6 }];
  component.produtoSelecionadoId = 1;
  component.prazo = null;
  expect(component.isPrazoValido()).toBe(true);
});

it('logs Parcela and Taxa Mensal when calcularParcela runs with valid inputs', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation();

  component.produtos = [{ id: 1, nome: 'Calc', taxaAnual: 12, prazoMaximoMeses: 12 }];
  component.produtoSelecionadoId = 1;
  component.valorDesejado = 1200;
  component.prazo = 12;

  component.calcularParcela();

  expect(logSpy).toHaveBeenCalled();
  expect(logSpy.mock.calls[0][0]).toEqual(expect.stringContaining('Parcela:'));
  expect(logSpy.mock.calls[0][0]).toEqual(expect.stringContaining('Taxa Mensal:'));

  logSpy.mockRestore();
  });
});