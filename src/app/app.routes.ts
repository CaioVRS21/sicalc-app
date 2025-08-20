import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Produtos } from './produtos/produtos';
import { CadastroProduto } from './cadastro-produto/cadastro-produto';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'home', component: Home },
    { path: 'produtos', component: Produtos },
    { path: 'cadastro-produto', component: CadastroProduto}
];
