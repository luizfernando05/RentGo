# RentGo - API para uma locadora de carros 🚗

![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)

Desenvolvimento de uma API e aplicação de testes unitários para uma aplicação de gerenciamento de aluguel de carros, a qual permite o cadastro, listagem, atualização e exclusão de usuários, clientes, carros (bem como a manipulação de itens relacionados a eles) e pedido.

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-%23F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

## 💻 Tecnologias Utilizadas

As tecnologias e ferramentas utilizadas nesse projeto incluem:

- `Node.js - v20.17.0`
- `TypeScript -  v5.6.3`
- `TS-Node: v10.9.2`
- `Express - v4.21.1`
- `MySQL2 - v3.11.3`
- `TypeORM - v0.3.20`
- `jsonwebtoken - v9.0.2`
- `bcryptjs - v2.4.3`
- `Swagger - v5.0.1`
- `dotenv - v16.4.5`
- `nodemon - v3.1.7`
- `UUID - v11.0.2`
- `ESLint: v9.13.0`
- `Prettier: v3.3.3`
- `Docker: v25.0.5`
- `AWS`
- `EC2`

## 🚀 Funcionalidades

- **CRUD de Usuários, Clientes, Carros e Pedidos**: Cadastrar, listar, atualizar e excluir.
- **Itens dos Carros**: Gerenciamento de itens associados a cada carro.
- **Paginação e Filtros**: Listagens com suporte a paginação e filtros, em algumas rotas.
- **Documentação**: Documentação da API acessível via Swagger.

Para visualizar a documentação, acesse: `http://localhost:{suaPorta}/api/v1/api-docs/`

## 🛠️ Como Utilizar a Aplicação

### Pré-requisitos

1. **Node.js** instalado (versão 14 ou superior).
2. **TypeScript** instalado.
3. **MySQL** instalado e rodando.
4. **Docker** instalado e rodando.

### Passo a Passo para Rodar a Aplicação em Máquina Local

1. **Clone o Repositório**:

   ```bash
   git clone https://github.com/luizfernando05/RentGo
   ```

2. **Instale as Dependências**: Execute o seguinte comando para instalar as dependências do projeto:

   ```bash
   npm install
   ```

3. **Configuração do Banco de Dados**: Crie um arquivo `.env` na raiz do projeto e adicione as variáveis de ambiente necessárias. Um exemplo de configuração pode ser encontrado no arquivo `.env.example` nesse repositório.

4. **Inicie os serviços com Docker e rode a aplicação**: A aplicação utiliza Docker para gerenciar os serviços. Para iniciar a aplicação em modo de desenvolvimento com hot-reload, execute:

   ```bash
   npm run dev
   ```

5. **Acesse a API**: A API estará disponível em `http://localhost:{suaPorta}/api/v1/`.

6. **Rodar migrations**: Rode as migrations com o comando:

   ```bash
   npm run migration:run
   ```

7. **Rodar os Seeds**: Rode os seeds para inserir dados dentro do banco, incluindo um User Admin:

   ```bash
   npm run seed:run
   ```

   O User Admin inserido após rodar o seed apresenta como informações para login o seguinte:

   ```bash
   {
      "email": "admin@admin.com",
      "password": "123456"
   }
   ```

8. **Rode os Testes**: Rode os testes unitário da API, incluindo informações a respeito da cobertura deles, com o seguinte comando:

   ```bash
   npm run test:coverage
   ```

   Ou, se preferir rodar apenas os Suites dos testes, rode o comando:

   ```bash
   npm test
   ```

   Obs: os códigos dos testes estão disponíveis na [pasta tests](./tests/) desse repositório.

Obs: Caso esteja usando o Postman para testar as rotas da API, está disponível neste repositório uma collection com a estrutura dos testes que podem ser feitos no Postamn em seu ambiente local. Para isso, basta importar a collection, [disponível aqui](./postman/) em seu Postman.

## 🌐 Endpoints Principais

### Rota de autenteicação

- **POST /api/v1/login**: Autenticar um usuário.

### Rota de usuários

- **POST /api/v1/user**: Cadastrar um novo usuário (_Usuários autenticados_).
- **GET /api/v1/user**: Listar todos os usuários (_Usuários autenticados_).
- **GET /api/v1/user/**: Buscar um usuário pelo ID (_Usuários autenticados_).
- **PATCH /api/v1/user/**: Atualizar informações de um usuário (_Usuários autenticados_).
- **DELETE /api/v1/user/**: Excluir um usuário (_Usuários autenticados_).

### Rota de clientes

- **POST /api/v1/client**: Cadastrar um novo cliente (_Usuários autenticados_).
- **GET /api/v1/client**: Listar todos os clientes (_Usuários autenticados_).
- **GET /api/v1/client/**: Buscar um cliente pelo ID (_Usuários autenticados_).
- **PATCH /api/v1/client/**: Atualizar informações de um cliente (_Usuários autenticados_).
- **DELETE /api/v1/client/**: Excluir um cliente (_Usuários autenticados_).

### Rota de carros

- **POST /api/v1/cars**: Cadastrar um carro (_Usuários autenticados_).
- **GET /api/v1/cars**: Listar todos os carros (_Usuários autenticados_).
- **GET /api/v1/cars/{id}**: Buscar um carro pelo ID (_Usuários autenticados_).
- **PATCH /api/v1/cars/{id}**: Atualizar um carro (_Usuários autenticados_).
- **DELETE /api/v1/cars/{id}**: Excluir um carro (_Usuários autenticados_).

### Rota de pedidos

- **POST /api/v1/orders**: Criar um novo pedido (_Usuários autenticados_).
- **GET /api/v1/orders**: Listar todos os pedidos (_Usuários autenticados_).
- **GET /api/v1/orders/**: Buscar um pedido pelo ID (_Usuários autenticados_).
- **PUT /api/v1/orders/**: Atualizar informações de um pedido (_Usuários autenticados_).
- **DELETE /api/v1/orders/**: Excluir um pedido (_Usuários autenticados_).

Obs: Algumas rotas, como as de cars, orders, user e cliets, requerem que o usuário esteja autenticado, para testá-las faça login na rota pública `POST /api/v1/login` e insira as informações do User Admin disponíveis após rodar o seed.

### Exemplo de Requisição

1. Endpoint: `POST /api/v1/user`

   ```bash
   {
      "full_name": "João Silva",
      "email": "joao.silva@example.com",
      "password": "senha123"
   }
   ```

2. Endpoint: `PATCH /api/v1/user/{id}`

   ```bash
   {
      "full_name": "João Silva Atualizado",
      "email": "joao.silva.new@example.com",
      "password": "senha123"
   }
   ```

3. Endpoint: `POST /api/v1/login`

   ```bash
   {
   "email": "joao.silva@example.com",
   "password": "senha123"
   }
   ```

4. Endpoint: `POST /api/v1/client`

   ```bash
   {
      "name": "Maria Souza",
      "birthday": "1990-08-15",
      "email": "maria.souza@example.com",
      "phone": "123456789",
      "cpf": "78113959246"
   }
   ```

5. Endpoint: `PATCH /api/v1/client/{id}`

   ```bash
   {
      "phone": "987654321"
   }
   ```

6. Endpoint: `POST /api/v1/cars`

   ```bash
   {
      "plate": "ABC1234",
      "brand": "Tesla",
      "model": "Model S",
      "km": 20000,
      "year": 2021,
      "price": 800000,
      "status": "ativo",
      "items": [ "autopilot", "câmbio automático", "câmera de ré", "ar-condicionado" ]
   }
   ```

7. Endpoint: `PATCH /api/v1/cars/{id}`

   ```bash
   {
      "price": 24000
   }
   ```

8. Endpoint: ` POST /api/v1/orders`

   ```bash
   {
      "clientId": "123e4567-e89b-12d3-a456-426655440000",
      "carId": "22ed1a08-cfe8-4833-b8a0-945a0264beb6"
   }
   ```

   Obs: mude os `clientId` e `carId` por valores que sejam válidos em seu ambiente.

9. Endpoint: `PUT /api/v1/orders/{id}`

   ```bash
   {
      "cep": "59650-000",
      "status": "Aprovado"
   }
   ```

## 🗂️ Estrutura de Arquivos

```bash
.
├── src/
│   ├── application/
│   │   ├── params/
│   │   │    ├── ListCarsParams.type.ts
│   │   │    ├── ListClientParams.type.ts
│   │   │    └── ListUserParams.type.ts
│   │   ├── services/
│   │   │    ├── auth/
│   │   │    │   └── LoginService.ts
│   │   │    ├── car/
│   │   │    │   ├── CreateCarService.ts
│   │   │    │   ├── DeleteCarService.ts
│   │   │    │   ├── ListCarService.ts
│   │   │    │   ├── ShowCarService.ts
│   │   │    │   └── UpdateCarService.t
│   │   │    ├── client/
│   │   │    │   ├── CreateClientService.ts
│   │   │    │   ├── DeletClientService.ts
│   │   │    │   ├── ListClientService.ts
│   │   │    │   ├── ReadClientService.ts
│   │   │    │   └── UpdateClientService.ts
│   │   │    ├── order/
│   │   │    │   ├── CreateOrderService.ts
│   │   │    │   ├── DeleteOrderSerice.ts
│   │   │    │   ├── FindOrderService.ts
│   │   │    │   ├── ListOrderService.ts
│   │   │    │   └── UpdateOrderService.ts
│   │   │    ├── user/
│   │   │    │   ├── CreateUserSerice.ts
│   │   │    │   ├── DeleteUserService.ts
│   │   │    │   ├── LisUserService.ts
│   │   │    │   ├── SelectUserByIdService.ts
│   │   │    │   └── UpdateUserService.ts
│   ├── domain/
│   │   ├── entities/
│   │   │    ├── Car.ts
│   │   │    ├── CarItem.ts
│   │   │    ├── Client.ts
│   │   │    ├── Order.ts
│   │   │    └── User.ts
│   │   ├── repositories/
│   │   │    ├── CarRepository.ts
│   │   │    ├── ClientRepository.ts
│   │   │    ├── OrderRepository.ts
│   │   │    └── UserRepository.ts
│   ├── http/
│   │   ├── controller/
│   │   │    ├── AuthController.ts
│   │   │    ├── CarController.ts
│   │   │    ├── ClientController.ts
│   │   │    ├── OrderController.ts
│   │   │    └── UserController.ts
│   │   ├── dtos/
│   │   │    ├── CreateCar.dto.ts
│   │   │    ├── CreateClient.dto.ts
│   │   │    ├── CreateOrder.dto.ts
│   │   │    ├── CreateUser.dto.ts
│   │   │    ├── UpdateCar.dto.ts
│   │   │    ├── UpdateClient.dto.ts
│   │   │    ├── UpdateOrder.dto.ts
│   │   │    └── UpdateUser.dto.ts
│   │   ├── middleware/
│   │   │    └── Auth.ts
│   ├── infra/
│   │   ├── config/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── compose.yaml
│   │   └── data-source.ts
│   ├── routes/
│   │   └── route.ts
│   ├── index.ts
│   └── swagger.json
├── .editorconfig
├── .eslint.config.mjs
├── .gitignore
├── .nvmrc
├── .tsconfig.json
├── .prettierrc
├── package.json
├── README.md
└── .env.example
```
