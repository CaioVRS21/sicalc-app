import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProdutosService } from '../service/produtos-service/produtos-service';

@Component({
  selector: 'app-cadastro-produto',
  imports: [FormsModule, RouterLink],
  templateUrl: './cadastro-produto.html',
  styleUrl: './cadastro-produto.css'
})
export class CadastroProduto {
  produto = {
    nome: '',
    taxaAnual: null,
    prazoMaximoMeses: null
  };

  constructor(private produtosService: ProdutosService) {}

  onSubmit() {
    this.produtosService.listarProdutos().subscribe({
    next: (produtos) => {
      const maxId = produtos.length > 0
        ? Math.max(...produtos.map(p => Number(p.id)))
        : 0;
      const novoProduto = {
        ...this.produto,
        id: maxId + 1
      };
      this.produtosService.cadastrarProduto(novoProduto).subscribe({
        next: (res) => {
          console.log('Produto cadastrado:', res);
          this.produto = { nome: '', taxaAnual: null, prazoMaximoMeses: null };
        },
        error: (err) => {
          console.error('Erro ao cadastrar produto:', err);
        }
      });
    },
    error: (err) => {
      console.error('Erro ao buscar produtos:', err);
    }
  });
  }
}