import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroment } from '../../../enviroments/enviroment';

export interface Simulacao {
  id?: number;
  produtoNome: string;
  taxaMensal: number;
  parcela: number;
  prazo: number;
  valorDesejado: number;
  valorTotal: number;
}

@Injectable({ providedIn: 'root' })
export class SimulacoesService {
  private apiUrl = `${enviroment.simulacoesApiUrl}/simulacoes`;

  constructor(private http: HttpClient) {}

  listarSimulacoes(): Observable<Simulacao[]> {
    return this.http.get<Simulacao[]>(this.apiUrl);
  }

  salvarSimulacao(simulacao: Simulacao): Observable<Simulacao> {
    return this.http.post<Simulacao>(this.apiUrl, simulacao);
  }
}