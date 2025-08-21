import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProdutosService, Produto } from './produtos-service';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../../enviroments/enviroment';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        ProdutosService,
        { provide: HttpClient, useValue: httpSpy } 
      ]
    });

    service = TestBed.inject(ProdutosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products', () => {
    const mockProdutos: Produto[] = [
      { id: 1, nome: 'Produto 1', taxaAnual: 10, prazoMaximoMeses: 12 }
    ];

    // Configura o spy para retornar um observable
    httpSpy.get.and.returnValue(of(mockProdutos));

    service.listarProdutos().subscribe(produtos => {
      expect(produtos).toEqual(mockProdutos);
    });

    // Verifica se o endpoint correto foi chamado
    expect(httpSpy.get.calls.first().args[0]).toBe(`${enviroment.produtosApiUrl}/produtos`);
  });

  it('should create a new product', () => {
    const novoProduto: Produto = { id: 2, nome: 'Produto 2', taxaAnual: 8, prazoMaximoMeses: 24 };

    httpSpy.post.and.returnValue(of(novoProduto));

    service.cadastrarProduto(novoProduto).subscribe(produto => {
      expect(produto).toEqual(novoProduto);
    });

    // Verifica se o endpoint e o body foram chamados corretamente
    expect(httpSpy.post.calls.first().args[0]).toBe(`${enviroment.produtosApiUrl}/produtos`);
    expect(httpSpy.post.calls.first().args[1]).toEqual(novoProduto);
  });
});
