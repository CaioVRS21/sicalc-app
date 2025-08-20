import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Produtos } from './produtos/produtos';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'home', component: Home },
    { path: 'produtos', component: Produtos }
];
