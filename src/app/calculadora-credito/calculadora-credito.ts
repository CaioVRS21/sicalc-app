import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProdutosService, Produto } from '../service/produtos-service/produtos-service';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SimulacoesService } from '../service/simulacoes-service/simulacoes-service';

@Component({
  selector: 'app-calculadora-credito',
  imports: [FormsModule, NgFor, CommonModule, NgIf, RouterLink],
  templateUrl: './calculadora-credito.html',
  styleUrl: './calculadora-credito.css'
})
export class CalculadoraCredito {
  produtos: Produto[] = [];
  produtoNome: string = '';
  produtoSelecionadoId: number | null = null;
  valorDesejado: number | null = null;
  valorTotal: number | null = null;
  prazo: number | null = null;
  parcela: number | null = null;
  taxaMensal: number | null = null;

  constructor(
    private produtosService: ProdutosService,
    private simulacoesService: SimulacoesService
  ) {}

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
    this.valorTotal = null;
    return;
  }

  const taxaMensal = Number(produto.taxaAnual) / 12 / 100; // juros mensal
  const prazo = this.prazo;
  const valorDesejado = this.valorDesejado;

  // Fórmula do sistema Price
  const parcela = valorDesejado * (taxaMensal * Math.pow(1 + taxaMensal, prazo)) / (Math.pow(1 + taxaMensal, prazo) - 1);

  this.taxaMensal = taxaMensal;
  this.parcela = parcela;
  this.valorTotal = parcela * prazo;
  this.produtoNome = produto.nome;

  this.simulacoesService.listarSimulacoes().subscribe({
    next: (simulacoes) => {
      const maxId = simulacoes.length > 0
        ? Math.max(...simulacoes.map(s => Number(s.id || 0)))
        : 0;
      const novaSimulacao = {
        id: maxId + 1,
        produtoNome: produto.nome,
        taxaMensal: taxaMensal,
        parcela: parcela,
        prazo: prazo,
        valorDesejado: valorDesejado,
        valorTotal: this.valorTotal ? this.valorTotal : 0
      };
      this.simulacoesService.salvarSimulacao(novaSimulacao).subscribe({
        next: (res) => console.log('Simulação salva:', res),
        error: (err) => console.error('Erro ao salvar simulação:', err)
      });
    },
    error: (err) => console.error('Erro ao buscar simulações:', err)
  });

  console.log(`Parcela: ${this.parcela}, Taxa Mensal: ${this.taxaMensal}`);
  }
}