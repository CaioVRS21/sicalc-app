import { Component, OnInit } from '@angular/core';
import { ProdutosService, Produto } from '../service/produtos-service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-produtos',
  imports: [NgFor],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class Produtos implements OnInit{
  produtos: Produto[] = [];

  constructor (private produtosService: ProdutosService){}

  ngOnInit(): void {
    this.produtosService.listarProdutos().subscribe((data) => {
      this.produtos = data;
    })
  }
}
