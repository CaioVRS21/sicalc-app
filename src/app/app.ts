import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Produtos } from "./produtos/produtos";
import { Home } from "./home/home";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Produtos, Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sicalc-app');
}
