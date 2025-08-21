import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Produtos } from './produtos';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('Produtos', () => {
  let component: Produtos;
  let fixture: ComponentFixture<Produtos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Produtos, // Seu componente standalone
        HttpClientTestingModule
      ],
      providers: [
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
});
