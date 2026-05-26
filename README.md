# Cadastro de Clientes — Altis

Sistema fullstack para cadastro, listagem, edição e exclusão de clientes, com validações no frontend e no backend.

Projeto avaliativo desenvolvido para a Altis Sistemas.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 21 + Bootstrap 5 + ngx-mask |
| Backend | Java 17 + Spring Boot 4 + Spring Data JPA + Hibernate Validator |
| Banco de dados | Oracle Database 21c Express Edition |

---

## Funcionalidades

### Cadastro de clientes (CRUD completo)
- **Criar** novo cliente com nome, CPF, telefone WhatsApp, endereço (CEP, logradouro, número, complemento, bairro, cidade, UF) e observações.
- **Listar** todos os clientes, com busca por nome (case-insensitive) **ou** CPF parcial.
- **Editar** qualquer cliente existente (formulário reutilizado).
- **Excluir** com confirmação.

### Validações (espelhadas no frontend e no backend)
| Campo | Regra |
|---|---|
| Nome | Obrigatório, mínimo **10** caracteres, máximo 150 |
| CPF | Obrigatório, válido pelo **algoritmo oficial** dos dígitos verificadores, **único** no sistema |
| Telefone | Obrigatório, **10 ou 11 dígitos**, **único** no sistema |
| Observações | Máximo **100** caracteres |

### Detalhes
- Máscaras de CPF (`000.000.000-00`), telefone (`(00) 00000-0000`) e CEP (`00000-000`) no formulário.
- Erros do backend (HTTP 400/409) são exibidos no campo específico do formulário (não em popup genérico).
- Filtro com **debounce de 300ms** — não chama a API a cada tecla.
- Toast verde de sucesso após cadastrar/atualizar/excluir.
- Roteamento com **lazy loading** dos componentes.

---

## Estrutura do repositório

```
altis-cadastro-clientes/
├── backend/                Spring Boot — API REST
│   ├── pom.xml
│   └── src/main/java/br/com/altis/cadastroclientes/
│       ├── CadastroClientesApplication.java
│       ├── config/CorsConfig.java
│       ├── controller/ClienteController.java
│       ├── service/ClienteService.java
│       ├── repository/ClienteRepository.java
│       ├── entity/{Cliente, Endereco}.java
│       ├── dto/{ClienteRequestDTO, ClienteResponseDTO, EnderecoDTO}.java
│       └── exception/{GlobalExceptionHandler, DuplicateResourceException, ResourceNotFoundException}.java
├── frontend/               Angular — UI
│   └── src/app/
│       ├── pages/cliente-lista/      (listagem + filtro + ações)
│       ├── pages/cliente-form/       (form de novo/editar)
│       ├── services/cliente.service.ts
│       ├── validators/cpf.validator.ts
│       └── models/cliente.model.ts
├── docs/
│   └── 01_setup_oracle.sql           (cria o usuário PROJETO no XEPDB1)
└── README.md
```

---

## Pré-requisitos

- **Java 17+** (testado também em Java 19)
- **Node.js 20 LTS** e **npm**
- **Angular CLI** — `npm i -g @angular/cli`
- **Oracle Database 21c Express Edition** rodando localmente (porta 1521, PDB `XEPDB1`)
- **Git**

---

## Configuração e execução — passo a passo

### 1. Clonar o projeto

```bash
git clone https://github.com/kauanythalodaviramos/altis-cadastro-clientes.git
cd altis-cadastro-clientes
```

### 2. Criar o schema no Oracle

Conectado como `SYSTEM` no PDB `XEPDB1`, rodar o script de setup. Ele cria o usuário `PROJETO` com senha `Altis_2026` e os privilégios mínimos:

```bash
sqlplus SYSTEM/<sua-senha-system>@//localhost:1521/XEPDB1 @docs/01_setup_oracle.sql
```

### 3. Subir o backend

```bash
cd backend
./mvnw spring-boot:run        # Linux/Mac
# ou
.\mvnw.cmd spring-boot:run    # Windows
```

A API sobe em `http://localhost:8080`. Hibernate cria a tabela `CLIENTES` automaticamente (`spring.jpa.hibernate.ddl-auto=update`).

> Para usar credenciais diferentes do default, exporte `DB_USERNAME` e `DB_PASSWORD` antes:
> ```bash
> $env:DB_USERNAME = "outro_user"; $env:DB_PASSWORD = "outra_senha"
> ```

### 4. Subir o frontend

Em outro terminal:

```bash
cd frontend
npm install
ng serve
```

O Angular sobe em `http://localhost:4200`. Abre no navegador e usa.

---

## API REST

Base URL: `http://localhost:8080/api/clientes`

| Método | Path | Descrição | Status sucesso |
|---|---|---|---|
| `POST` | `/api/clientes` | Cria cliente | `201 Created` |
| `GET` | `/api/clientes` | Lista todos (ordenado por nome) | `200 OK` |
| `GET` | `/api/clientes?filtro=texto` | Filtra por nome **ou** CPF parcial | `200 OK` |
| `GET` | `/api/clientes/{id}` | Busca por id | `200 OK` |
| `PUT` | `/api/clientes/{id}` | Atualiza cliente | `200 OK` |
| `DELETE` | `/api/clientes/{id}` | Remove cliente | `204 No Content` |

### Códigos de erro
| Status | Quando |
|---|---|
| `400 Bad Request` | Validação falhou (CPF inválido, nome curto, etc.) |
| `409 Conflict` | CPF ou telefone já cadastrado por outro cliente |
| `404 Not Found` | Cliente com o id informado não existe |
| `500 Internal Server Error` | Erro inesperado |

### Formato do erro
Quando há erro de validação, a resposta é JSON estruturado com mensagens por campo:

```json
{
  "timestamp": "2026-05-26T10:29:50.27",
  "status": 400,
  "error": "Bad Request",
  "message": "Dados invalidos",
  "errors": {
    "cpf": "CPF invalido",
    "nome": "Nome deve ter no minimo 10 e no maximo 150 caracteres"
  }
}
```

O frontend usa esse `errors` para colocar mensagens nos campos específicos do formulário.

### Exemplo de payload (POST/PUT)

```json
{
  "nome": "Maria das Dores Silva",
  "cpf": "52998224725",
  "telefone": "11955554444",
  "endereco": {
    "cep": "20010000",
    "logradouro": "Rua da Carioca",
    "numero": "50",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Rio de Janeiro",
    "uf": "RJ"
  },
  "observacoes": "Cliente preferencial"
}
```

CPF e telefone podem ser enviados com ou sem máscara — o backend normaliza para apenas dígitos antes de salvar.

---

## Decisões de projeto

### Backend
- **DTOs separados** das entities (`ClienteRequestDTO`, `ClienteResponseDTO`) — não expõe a entity JPA diretamente na API.
- **`Endereco` como `@Embeddable`** — endereço é parte do cliente (não tem identidade própria), sem precisar de tabela separada.
- **`@CPF` do Hibernate Validator** já valida o algoritmo oficial — não precisei reimplementar.
- **`GlobalExceptionHandler`** centraliza o tratamento de exceções e retorna JSON padronizado.
- **CPF/telefone armazenados sem máscara** (só dígitos) — formatação é responsabilidade da camada de apresentação.

### Frontend
- **Standalone components** (padrão do Angular 17+).
- **Reactive Forms** com `FormBuilder` — validações declarativas, dirty/touched corretos.
- **Validador customizado de CPF** espelha exatamente o algoritmo do `@CPF` do backend.
- **Signals** para estado local (`carregando`, `salvando`, `mensagem`).
- **Lazy loading** das rotas — bundle inicial menor.

### Segurança
- Credenciais do banco vêm de variáveis de ambiente (`DB_USERNAME`, `DB_PASSWORD`) com fallback pros valores de desenvolvimento local.
- CORS restrito a `http://localhost:4200`.

---

## O que ficou de fora (e por quê)

- **Testes unitários** — projeto avaliativo com prazo muito curto; priorizei entregar o core funcional + validações sólidas. A estrutura de DTOs/Service deixa o código pronto pra ser testado.
- **Autenticação/autorização** — não estava no escopo.
- **Paginação** — para escala maior do que dezenas de registros seria essencial.
- **Migrações versionadas (Flyway/Liquibase)** — `ddl-auto=update` é suficiente para dev; em produção deve ser substituído.
