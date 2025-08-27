import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProdutosService, Produto } from '../service/produtos-service/produtos-service';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SimulacoesService } from '../service/simulacoes-service/simulacoes-service';
import { ToastService } from '../service/toast-service/toast-service';

@Component({
  selector: 'app-calculadora-credito',
  imports: [FormsModule, NgFor, CommonModule, NgIf, RouterLink],
  templateUrl: './calculadora-credito.html',
  styleUrl: './calculadora-credito.css'
})
export class CalculadoraCredito {
  tipoCalculo: 'price' | 'sac' = 'price';
  produtos: Produto[] = [];
  produtoNome: string = '';
  produtoSelecionadoId: number | null = null;
  valorDesejado: number | null = null;
  valorTotal: number | null = null;
  prazo: number | null = null;
  parcela: number | null = null;
  taxaMensal: number | null = null;
  amortizacao: number[] = []; 
  tabelaAmortizacao: { parcela: number; juros: number; amortizacao: number; saldo: number; }[] = [];
  prazoErroMsg: string | null = null;
  currentPage = 1;
  readonly pageSize = 12;

  constructor(
    private produtosService: ProdutosService,
    private simulacoesService: SimulacoesService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.produtosService.listarProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.produtoNome = produtos.length > 0 ? produtos[0].nome : '';
      }
    });
  }

  get produtoSelecionado(){
    return this.produtos.find(p => Number(p.id) === Number(this.produtoSelecionadoId));
  }

  isPrazoValido(): boolean {
    const produto = this.produtoSelecionado;
    if (!produto || !this.prazo) return true;
    return Number(this.prazo) <= Number(produto.prazoMaximoMeses);
  }

  onPrazoChange() {
    const produto = this.produtoSelecionado;
    if (!produto || this.prazo == null) {
     this.prazoErroMsg = null;
      return;
    }
   if (Number(this.prazo) > Number(produto.prazoMaximoMeses)) {
      this.prazoErroMsg = `Prazo máximo para "${produto.nome}" é ${produto.prazoMaximoMeses} meses.`;
    }
  }

  private validarPrazoAntesDeCalcular(): boolean {
    const produto = this.produtoSelecionado;
    if (produto && this.prazo && Number(this.prazo) > Number(produto.prazoMaximoMeses)){
      return false;
    }
    return true;
  }

  calcular() {
    if (!this.validarPrazoAntesDeCalcular()) return;
    if (this.tipoCalculo === 'price') {
      this.calcularParcela();
      const produto = this.produtos.find(p => Number(p.id) === Number(this.produtoSelecionadoId));
      if (produto && this.valorDesejado && this.prazo) {
        this.salvarSimulacao(
          produto,
          Number(produto.taxaAnual) / 12 / 100,
          this.tabelaAmortizacao[0]?.parcela ?? 0,
          this.prazo,
          this.valorDesejado,
          this.tabelaAmortizacao.reduce((acc, cur) => acc + cur.parcela, 0),
          this.tipoCalculo,
          this.tabelaAmortizacao
        );
      }
    } else if (this.tipoCalculo === 'sac') {
      this.calcularAmortizacaoSAC();
      const produto = this.produtos.find(p => Number(p.id) === Number(this.produtoSelecionadoId));
      if (produto && this.valorDesejado && this.prazo) {
        this.salvarSimulacao(
          produto,
          Number(produto.taxaAnual) / 12 / 100,
          this.tabelaAmortizacao[0]?.parcela ?? 0,
          this.prazo,
          this.valorDesejado,
          this.tabelaAmortizacao.reduce((acc, cur) => acc + cur.parcela, 0),
          this.tipoCalculo,
          this.tabelaAmortizacao
        );
      }
    } 
}

calcularParcela() {
  const produto = this.produtos.find(p => Number(p.id) === Number(this.produtoSelecionadoId));
  if (!produto || !this.valorDesejado || !this.prazo) {
    this.parcela = null;
    this.valorTotal = null;
    return;
  }

  const taxaMensal = Number(produto.taxaAnual) / 12 / 100;
  const prazo = this.prazo;
  const valorDesejado = this.valorDesejado;

  const parcela = valorDesejado * (taxaMensal * Math.pow(1 + taxaMensal, prazo)) / (Math.pow(1 + taxaMensal, prazo) - 1);

  this.taxaMensal = taxaMensal;
  this.parcela = parcela;
  this.valorTotal = parcela * prazo;
  this.produtoNome = produto.nome;

  this.tabelaAmortizacao = [];
  let saldoDevedor = valorDesejado;
  for (let mes = 1; mes <= prazo; mes++) {
    const juros = saldoDevedor * taxaMensal;
    const amortizacao = parcela - juros;
    saldoDevedor -= amortizacao;
    this.tabelaAmortizacao.push({
      parcela,
      juros,
      amortizacao,
      saldo: saldoDevedor > 0 ? saldoDevedor : 0
    });
  }
  this.resetPagination(); 
  console.log(`Parcela: ${this.parcela}, Taxa Mensal: ${this.taxaMensal}`);
}

salvarSimulacao(
  produto: Produto,
  taxaMensal: number,
  parcela: number,
  prazo: number,
  valorDesejado: number,
  valorTotal: number,
  tipoCalculo: 'price' | 'sac',
  tabelaAmortizacao: { parcela: number; juros: number; amortizacao: number; saldo: number; }[]
) {
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
        valorTotal: valorTotal,
        tipoCalculo: tipoCalculo,
        tabelaAmortizacao: [...tabelaAmortizacao]
      };
      this.simulacoesService.salvarSimulacao(novaSimulacao).subscribe({
        next: (res) => {
          this.toastService.success('Simulação salva com sucesso!');
            console.log('Simulação salva:', res);
          },
        error: (err) => {
          this.toastService.error('Erro ao salvar simulação.');
+            console.error('Erro ao salvar simulação:', err);
          }
      });
    },
    error: (err) => {
      console.error('Erro ao buscar simulações:', err);
      this.toastService.error('Erro ao buscar simulações.');
    }
  });
}

calcularAmortizacaoSAC() {
  const produto = this.produtos.find(p => Number(p.id) === Number(this.produtoSelecionadoId));
  if (!produto || !this.valorDesejado || !this.prazo) {
    this.parcela = null;
    return;
  }

  const i = Number(produto.taxaAnual) / 12 / 100; // juros mensal
  const n = this.prazo;
  const P = this.valorDesejado;

  const amortizacaoConstante = P / n;
  let saldoDevedor = P;
  const tabela: { parcela: number; juros: number; amortizacao: number; saldo: number; }[] = [];

  for (let mes = 1; mes <= n; mes++) {
    const juros = saldoDevedor * i;
    const parcela = amortizacaoConstante + juros;
    saldoDevedor -= amortizacaoConstante;

    tabela.push({
      parcela,
      juros,
      amortizacao: amortizacaoConstante,
      saldo: saldoDevedor > 0 ? saldoDevedor : 0
    });
}

this.tabelaAmortizacao = tabela;
this.currentPage = 1;
}

 onProdutoChange() {
    this.valorDesejado = null;
    this.prazo = null;
    this.tabelaAmortizacao = [];
    this.prazoErroMsg = null;
    this.currentPage = 1;
  }

  onValorChange() {
    this.prazo = null;
    this.tabelaAmortizacao = [];
    this.prazoErroMsg = null;
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.tabelaAmortizacao.length / this.pageSize));
  }

  get pagedResults(){
    const start = (this.currentPage - 1) * this.pageSize;
    return this.tabelaAmortizacao.slice(start, start + this.pageSize);
  }

  prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  resetPagination() { this.currentPage = 1; }
}