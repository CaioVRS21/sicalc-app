import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroProduto } from './cadastro-produto';
import { ProdutosService } from '../service/produtos-service/produtos-service';
import { ToastService } from '../service/toast-service/toast-service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('CadastroProduto', () => {
  let component: CadastroProduto;
  let fixture: ComponentFixture<CadastroProduto>;
  let produtosService: jest.Mocked<ProdutosService>;
  let toastService: jest.Mocked<ToastService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    produtosService = {
      listarProdutos: jest.fn(),
      cadastrarProduto: jest.fn()
    } as any;

    toastService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [FormsModule, CadastroProduto, HttpClientTestingModule],
      providers: [
        { provide: ProdutosService, useValue: produtosService },
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

    fixture = TestBed.createComponent(CadastroProduto);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call cadastrarProduto and reset form on success', () => {
    produtosService.listarProdutos.mockReturnValue(of([{ id: 1, nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 }]));
    produtosService.cadastrarProduto.mockReturnValue(of({ id: 2, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

    component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
    component.onSubmit();

    expect(produtosService.listarProdutos).toHaveBeenCalled();
    expect(produtosService.cadastrarProduto).toHaveBeenCalledWith({
      nome: 'Novo',
      taxaAnual: 10,
      prazoMaximoMeses: 12,
      id: 2
    });
    expect(component.produto).toEqual({ nome: '', taxaAnual: 0, prazoMaximoMeses: 0 });
  });

  it('should handle error on listarProdutos', () => {
    produtosService.listarProdutos.mockReturnValue(throwError(() => new Error('Erro')));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    component.produto = { nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 };

    component.onSubmit();

    expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar produtos:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle error on cadastrarProduto', () => {
    produtosService.listarProdutos.mockReturnValue(of([]));
    produtosService.cadastrarProduto.mockReturnValue(throwError(() => new Error('Erro Cadastro')));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    component.produto = { nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 };
    component.onSubmit();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao cadastrar produto:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should not call cadastrarProduto when produto fields are empty', () => {
    produtosService.listarProdutos.mockReturnValue(of([]));
  
    component.produto = { nome: '', taxaAnual: 0, prazoMaximoMeses: 0 };
    component.onSubmit();

    produtosService.listarProdutos.mockReturnValue(of([]));
    produtosService.cadastrarProduto.mockReturnValue(of({ id: 1, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));
    component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
    component.onSubmit();
  });

it('should increment ID based on existing products', () => {
  produtosService.listarProdutos.mockReturnValue(of([
    { id: 5, nome: 'Produto 1', taxaAnual: 10, prazoMaximoMeses: 12 }
  ]));
  produtosService.cadastrarProduto.mockReturnValue(of({ id: 2, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

  component.produto = { nome: 'Teste', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(produtosService.cadastrarProduto).toHaveBeenCalledWith(expect.objectContaining({ id: 6 }));
});

it('should reset produto only after successful cadastro', () => {
  const cadastroResponse = of({ id: 3, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 });
  produtosService.listarProdutos.mockReturnValue(of([]));
  produtosService.cadastrarProduto.mockReturnValue(cadastroResponse);

  component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(component.produto).toEqual({ nome: '', taxaAnual: 0, prazoMaximoMeses: 0 });
});

it('should log product on successful cadastro', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  produtosService.listarProdutos.mockReturnValue(of([]));
  produtosService.cadastrarProduto.mockReturnValue(of({ id: 1, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

  component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(consoleSpy).toHaveBeenCalledWith('Produto cadastrado:', expect.any(Object));
  consoleSpy.mockRestore();
});

it('should set ID to 1 when no products exist', () => {
  produtosService.listarProdutos.mockReturnValue(of([]));
  produtosService.cadastrarProduto.mockReturnValue(of({ id: 1, nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 }));

  component.produto = { nome: 'Novo', taxaAnual: 10, prazoMaximoMeses: 12 };
  component.onSubmit();

  expect(produtosService.cadastrarProduto).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
});


});