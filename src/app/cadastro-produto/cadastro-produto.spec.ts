import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroProduto } from './cadastro-produto';
import { ProdutosService } from '../service/produtos-service/produtos-service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('CadastroProduto', () => {
  let component: CadastroProduto;
  let fixture: ComponentFixture<CadastroProduto>;
  let produtosServiceSpy: jasmine.SpyObj<ProdutosService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    produtosServiceSpy = jasmine.createSpyObj('ProdutosService', ['listarProdutos', 'cadastrarProduto']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, CadastroProduto, HttpClientTestingModule],
      providers: [
        { provide: ProdutosService, useValue: produtosServiceSpy },
        {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: new Map() }, // ou conforme seu uso real
          params: of({}), // se seu componente usa `this.route.params.subscribe()`
          queryParams: of({}) // se usa query params
        }
      }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroProduto);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Só se você quiser testar chamadas HTTP reais
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call cadastrarProduto and reset form on success', () => {
    produtosServiceSpy.listarProdutos.and.returnValue(of([{ id: 1, nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 }]));
    produtosServiceSpy.cadastrarProduto.and.returnValue(of({ id: 2, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

    component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
    component.onSubmit();

    expect(produtosServiceSpy.listarProdutos).toHaveBeenCalled();
    expect(produtosServiceSpy.cadastrarProduto).toHaveBeenCalledWith({
      nome: 'Novo',
      taxaAnual: 10,
      prazoMaximoMeses: 12,
      id: 2
    });
    expect(component.produto).toEqual({ nome: '', taxaAnual: 0, prazoMaximoMeses: 0 });
  });

  it('should handle error on listarProdutos', () => {
  produtosServiceSpy.listarProdutos.and.returnValue(throwError(() => new Error('Erro')));
  spyOn(console, 'error');

  // Defina produto com valores válidos
  component.produto = { nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 };

  component.onSubmit();

  expect(console.error).toHaveBeenCalledWith('Erro ao buscar produtos:', jasmine.any(Error));
});

  it('should handle error on cadastrarProduto', () => {
    produtosServiceSpy.listarProdutos.and.returnValue(of([]));
    produtosServiceSpy.cadastrarProduto.and.returnValue(throwError(() => new Error('Erro Cadastro')));
    spyOn(console, 'error');
    component.produto = { nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 };
    component.onSubmit();
    expect(console.error).toHaveBeenCalledWith('Erro ao cadastrar produto:', jasmine.any(Error));
  });

  it('should not call cadastrarProduto when produto fields are empty', () => {
  produtosServiceSpy.listarProdutos.and.returnValue(of([]));
  
  component.produto = { nome: '', taxaAnual: 0, prazoMaximoMeses: 0 };
  component.onSubmit();

  produtosServiceSpy.listarProdutos.and.returnValue(of([]));
  produtosServiceSpy.cadastrarProduto.and.returnValue(of({ id: 1, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));
  component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();
});

it('should increment ID based on existing products', () => {
  produtosServiceSpy.listarProdutos.and.returnValue(of([
    { id: 5, nome: 'Produto 1', taxaAnual: 10, prazoMaximoMeses: 12 }
  ]));
  produtosServiceSpy.cadastrarProduto.and.returnValue(of({ id: 2, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

  component.produto = { nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(produtosServiceSpy.cadastrarProduto).toHaveBeenCalledWith(jasmine.objectContaining({ id: 6 }));
});

it('should reset produto only after successful cadastro', () => {
  const cadastroResponse = of({ id: 3, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 });
  produtosServiceSpy.listarProdutos.and.returnValue(of([]));
  produtosServiceSpy.cadastrarProduto.and.returnValue(cadastroResponse);

  component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(component.produto).toEqual({ nome: '', taxaAnual: 0, prazoMaximoMeses: 0 });
});

it('should log product on successful cadastro', () => {
  spyOn(console, 'log');
  produtosServiceSpy.listarProdutos.and.returnValue(of([]));
  produtosServiceSpy.cadastrarProduto.and.returnValue(of({ id: 1, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

  component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(console.log).toHaveBeenCalledWith('Produto cadastrado:', jasmine.any(Object));
});

it('should set ID to 1 when no products exist', () => {
  produtosServiceSpy.listarProdutos.and.returnValue(of([]));
  produtosServiceSpy.cadastrarProduto.and.returnValue(of({ id: 1, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

  component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(produtosServiceSpy.cadastrarProduto).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1 }));
});


});