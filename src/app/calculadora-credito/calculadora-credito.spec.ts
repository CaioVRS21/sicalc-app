import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculadoraCredito } from './calculadora-credito';
import { ProdutosService } from '../service/produtos-service/produtos-service';
import { SimulacoesService } from '../service/simulacoes-service/simulacoes-service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

describe('CalculadoraCredito', () => {
  let component: CalculadoraCredito;
  let fixture: ComponentFixture<CalculadoraCredito>;
  let produtosServiceSpy: jasmine.SpyObj<ProdutosService>;
  let simulacoesServiceSpy: jasmine.SpyObj<SimulacoesService>;

 beforeEach(async () => {
  produtosServiceSpy = jasmine.createSpyObj('ProdutosService', ['listarProdutos']);
  simulacoesServiceSpy = jasmine.createSpyObj('SimulacoesService', ['listarSimulacoes', 'salvarSimulacao']);

  // Adicione um retorno padrão para evitar erro de subscribe undefined
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
      }
    ]
  }).compileComponents();

    fixture = TestBed.createComponent(CalculadoraCredito);
    component = fixture.componentInstance;
    fixture.detectChanges(); // aqui o ngOnInit é disparado
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
      tipoCalculo: 'sac',
      tabelaAmortizacao: []
    }));

    component.calcular();

    expect(component.tabelaAmortizacao.length).toBe(12);
    expect(component.tabelaAmortizacao[0].amortizacao).toBeCloseTo(100);
    expect(component.tabelaAmortizacao[0].parcela).toBeGreaterThan(100);
  });
});