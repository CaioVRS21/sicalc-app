# SISC APP - SISTEMA DE SIMULAÇAO DE CRÉDITO 

Projeto criado em angular com Angular 20.1.6 ([Angular CLI](https://github.com/angular/angular-cli) )

## Para instalar as dependências

Como o angular é muito rigido com as versões de suas dependências, rode o seguinte comando para que todas as partes do projeto sejam instaladas sem demais problemas

```bash
npm i --legacy-peer-deps
```

## Servidor em Develop

Para iniciar o servidor utilize o seguinte comando:

```bash
ng serve
```

E para rodar na rede

```bash
ng serve --host 0.0.0.0 --port 4200
```


Para inicializar os mocks de back-end utilize os seguintes comandos:
```bash
json-server --watch mock/mockDataBase.json --port 3000
json-server --watch mock/mockSimulacoesDB.json --port 3001
```

VALE LEMBRAR QUE NO ARQUIVO ENVIROMENT.TS DEVE SER UTILIZADO O IP DE SUA MÁQUINA

Exemplo:
    produtosApiUrl: 'http://SEU.IP.AQUI:3000',
    simulacoesApiUrl: 'http://SEU.IP.AQUI:3001'



Quando o servidor estiver funcionando, digite em seu browser `http://localhost:4200/`. A aplicação recarregará a cada atualização do código.


Para uma lista completa de comandos (como por exemplo `components`, `directives`, or `pipes`), digite no terminal:

```bash
ng generate --help
```

## Rodando testes unitários

Para executar testes com o [Karma](https://karma-runner.github.io) use o seguinte comando:

```bash
ng test
```

E para testar e olhar a cobertura de código:
```bash
ng test --code-coverage
```
