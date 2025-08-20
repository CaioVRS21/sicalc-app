import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProdutosService, Produto } from '../service/produtos-service';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculadora-credito',
  imports: [FormsModule, NgFor, CommonModule, NgIf],
  templateUrl: './calculadora-credito.html',
  styleUrl: './calculadora-credito.css'
})
export class CalculadoraCredito {
  produtos: Produto[] = [];
  produtoNome: string = '';
  produtoSelecionadoId: number | null = null;
  valorDesejado: number | null = null;
  prazo: number | null = null;
  parcela: number | null = null;
  taxaMensal: number | null = null;

  constructor(private produtosService: ProdutosService) {}

  ngOnInit() {
    this.produtosService.listarProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.produtoNome = produtos.length > 0 ? produtos[0].nome : '';
      }
    });
  }

  calcularParcela() {
    const produto = this.produtos.find(p => Number(p.id) === Number(this.produtoSelecionadoId));
  if (!produto || !this.valorDesejado || !this.prazo) {
    this.parcela = null;
    return;
  }

  const taxaMensal = Number(produto.taxaAnual) / 12 / 100; // juros mensal
  const prazo = this.prazo;
  const valorDesejado = this.valorDesejado;

  // Fórmula do sistema Price
  const parcela = valorDesejado * (taxaMensal * Math.pow(1 + taxaMensal, prazo)) / (Math.pow(1 + taxaMensal, prazo) - 1);

  this.taxaMensal = taxaMensal;
  this.parcela = parcela;
  console.log(`Parcela: ${this.parcela}, Taxa Mensal: ${this.taxaMensal}`);
  }
}