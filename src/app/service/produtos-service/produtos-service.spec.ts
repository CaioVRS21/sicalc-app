import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProdutosService, Produto } from './produtos-service';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../../enviroments/enviroment';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let httpClientMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ProdutosService,
        { provide: HttpClient, useValue: httpClientMock } 
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

    httpClientMock.get.mockReturnValue(of(mockProdutos));

    service.listarProdutos().subscribe(produtos => {
      expect(produtos).toEqual(mockProdutos);
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(`${enviroment.produtosApiUrl}/produtos`);
  });

  it('should create a new product', () => {
    const novoProduto: Produto = { id: 2, nome: 'Produto 2', taxaAnual: 8, prazoMaximoMeses: 24 };

    httpClientMock.post.mockReturnValue(of(novoProduto));

    service.cadastrarProduto(novoProduto).subscribe(produto => {
      expect(produto).toEqual(novoProduto);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(`${enviroment.produtosApiUrl}/produtos`, novoProduto);
  });
});
