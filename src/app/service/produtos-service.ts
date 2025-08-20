import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroment } from '../../enviroments/enviroment';

export interface Produto {
  id: number,
  nome: string,
  taxaAnual: null,
  prazoMaximoMeses: null
}

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = `${enviroment.apiUrl}/produtos`
  // produto = {
  //   nome: '',
  //   taxaAnual: null,
  //   prazoMaximoMeses: null
  // };

  constructor(private http: HttpClient){}

  listarProdutos(): Observable<Produto[]>{
    return this.http.get<Produto[]>(this.apiUrl);
  }

  cadastrarProduto(produto: Produto): Observable<Produto> {
  return this.http.post<Produto>(this.apiUrl, produto);
  }
}
