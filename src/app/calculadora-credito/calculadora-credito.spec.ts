import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraCredito } from './calculadora-credito';

describe('CalculadoraCredito', () => {
  let component: CalculadoraCredito;
  let fixture: ComponentFixture<CalculadoraCredito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculadoraCredito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculadoraCredito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
