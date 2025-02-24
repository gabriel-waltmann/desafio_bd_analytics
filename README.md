# Desafio BD Analytics

## 💻 Sobre
Projeto backend para controle de acesso a rotas.

## 🔨 Tarefas
✔️ Configurar Nodejs <br>
✔️ Configurar Docker <br>
✔️ Configurar Banco de Dados (Postgres)<br>
✔️ Configurar TypeORM <br>
✔️ Configurar integração com AWS Cognito <br>
✔️ Criar rotas de /auth, /me, /edit-account e /users <br>
✔️ Criar testes unitários e de integração <br>
✔️ Incluir instruções de inicialização no README.md  <br>

## 🔧 Tecnologias
✔️ Nodejs <br>
✔️ TypeORM <br>
✔️ Postgres <br>
✔️ Swagger UI <br>
✔️ Jest <br>
✔️ Docker / Docker compose <br>

## 🚀 Como rodar o projeto
1. Clone o projeto: git clone git@github.com:gabriel-waltmann/desafio_bd_analytics.git
2. Acesse no terminal: cd desafio_bd_analytics
3. Instale os pacotes: npm install 
4. Rode os containers: docker-compose up -d
5. Aplique as migrations: npm run typeorm migration:run
6. Teste as rotas no Postman: https://www.postman.com/martian-robot-359941/workspace/desafio-db-analytics

## 🧪 Como rodar os testes 
1. Acesse no terminal: cd desafio_bd_analytics
2. Caso tenha feito as instruções acima, desative os containers de dev: docker-compose down
3. Caso não tenha feito as instruções acima, instale os pacotes: npm install
4. Rode os containers de teste: docker-compose -f docker-compose.test.yml up -d 
5. Aplique as migrations: npm run typeorm migration:run
6. Para rodas os testes, há as seguintes opções:
- Todos os testes: npm run test
- Apenas testes unitários: npm run test:unit
- Apenas teste e2e: npm run test:e2e

## License - [MIT](./LICENSE)
[![licence mit](https://img.shields.io/badge/licence-MIT-blue.svg)](./LICENSE)

## ✏️ Developer by Gabriel Waltmann
[<img src="https://img.icons8.com/color/512/linkedin-2.png" alt="linkedin" height="50"></a>](https://www.linkedin.com/in/gabrielwaltmann/)
[<img src="https://avatars.githubusercontent.com/u/9919?v=4" alt="github" height="50">](https://github.com/gabriel-waltmann)

<br/>

Copyright © 2024 Gabriel Waltmann. All rights reserved 
