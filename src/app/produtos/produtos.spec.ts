import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Produtos } from './produtos';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ProdutosService } from '../service/produtos-service/produtos-service';
import { of } from 'rxjs';

describe('Produtos', () => {
  let component: Produtos;
  let fixture: ComponentFixture<Produtos>;
  let produtosServiceMock: any;

  beforeEach(async () => {
    produtosServiceMock = {
      listarProdutos: jest.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [
        Produtos,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ProdutosService, useValue: produtosServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() },
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Produtos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls listarProdutos once on init', () => {
  expect(produtosServiceMock.listarProdutos).toHaveBeenCalledTimes(1);
});
});
