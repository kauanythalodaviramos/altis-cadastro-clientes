# Cadastro de Clientes — Altis

Aplicação fullstack completa com **cadastro de clientes multi-usuário**, **álbum de fotos** com sistema de emoções/tags/likes e **lootbox animado**, e **configurações** de acessibilidade (tema, fonte, 3 idiomas).

Projeto avaliativo desenvolvido para a Altis Sistemas.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 21 + Bootstrap 5.3 + ngx-mask + ngx-translate |
| Backend | Java 17+ + Spring Boot 4 + Spring Security 6 + Spring Data JPA + Hibernate Validator + jjwt 0.12 |
| Banco de dados | Oracle Database 21c Express Edition |
| Autenticação | JWT (HS256) + BCrypt + middleware stateless |

---

## Funcionalidades

### Cadastro de usuário e autenticação
- **Registro** com nome, email e senha (BCrypt hash).
- **Login** com email/senha retorna JWT.
- **Persistência da sessão** via localStorage (sobrevive a F5).
- **Logout** limpa token e redireciona.
- **Multi-tenancy**: cada usuário só vê seus próprios clientes, fotos, emoções e tags.

### Cadastro de clientes (CRUD completo)
- Nome (mín. 10), CPF (validação oficial + único por usuário), telefone WhatsApp (10-11 dígitos, único por usuário), endereço estruturado, observações (máx. 100).
- Validações **espelhadas no frontend e backend**.
- Filtro inteligente por nome OU CPF (com debounce 300ms).
- Editar, excluir (com confirmação), atualização automática da lista.

### Tela de Configurações

**Perfil** (`/configuracoes/perfil`)
- Editar nome, email (exige senha atual), foto de perfil (JPG/PNG/WebP até 5MB).
- Modal "Alterar senha" com confirmação.
- Avatar circular aparece no navbar quando definido.

**Acessibilidade** (`/configuracoes/acessibilidade`)
- **Tema**: Claro ou Escuro (Bootstrap `data-bs-theme`, transição suave).
- **Tamanho de fonte**: 4 níveis (14/16/18/20px) com preview em tempo real.
- **Idioma**: Português, Inglês ou Espanhol — TODOS os textos da UI mudam instantaneamente.
- Preferências persistem em localStorage, aplicadas no boot (sem flash visual).

### Álbum de fotos (`/album`)

**Galeria** (`/album/galeria`)
- Grid responsivo de fotos com sidebar de filtros à esquerda.
- Filtros combinados: emoções (chips coloridos), tags (chips), cliente, favoritismo (Amadas/Medianas/Menos), ordenação.
- Upload de foto via modal com preview, escolha de emoção, cliente opcional, tags (criação inline).
- Botão coração com **animação de pulse** (1 → 1.45 → 1) ao curtir.
- Click no card abre modal detalhe com imagem grande, edição de metadados e exclusão.

**Lootbox** (`/album/lootbox`) — *o show*
- Filtros para definir o pool de fotos elegíveis.
- Botão "Abrir caixinha" dispara:
  1. Caixa balança 3 vezes (`caixaShake`, 900ms).
  2. Pop com 6 partículas em explosão radial (`sparkle`, 300ms).
  3. Reveal sequencial das 3 fotos top-rank com `revealCard` (scale 0.5 → 1 com rotação, delay 600ms cada).
- Badges dourados com ranking, contador de likes em cada card.
- Estado vazio amigável se filtros não retornarem nada.

**Emoções** (`/album/emocoes`)
- 8 emoções padrão criadas automaticamente no registro (Feliz, Triste, Amor, Calmo, Animado, Nostálgico, Inspirado, Outro).
- CRUD com modal: nome, picker de 10 cores, picker de 12 ícones sugeridos.
- Excluir bloqueia se houver fotos vinculadas (HTTP 409 amigável).

**Tags** (`/album/tags`)
- Cloud de chips `#nome` com criação inline (Enter funciona) e remoção individual.
- Animação `tagEnter` com bouncy spring overshoot.
- Excluir tag remove de todas as fotos (CASCADE).

**Sistema de likes**
- Cada like incrementa `likesCount` da foto.
- Categoria derivada: `< 3 = menos`, `3-10 = mediana`, `> 10 = amada` (cores diferentes).
- Lootbox prioriza por filtro de favoritismo + ordena por likes desc.

### Animações e design

Princípios respeitados em todo o app:
- Durações **150-300ms** para micro-interações, 600ms para destaques.
- Curva `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard) consistente.
- Hover de botões: lift + sombra suave.
- Click feedback: scale(0.98).
- Modais: fade do backdrop + slide-up do conteúdo.
- Cards em grid: stagger fade-in (35-50ms entre cada).
- **`prefers-reduced-motion` respeitado** — sistema operacional do usuário desabilita animações se preferir.

---

## Estrutura do repositório

```
altis-cadastro-clientes/
├── backend/                                Spring Boot — API REST
│   ├── pom.xml
│   └── src/main/java/br/com/altis/cadastroclientes/
│       ├── CadastroClientesApplication.java
│       ├── config/{CorsConfig, SecurityConfig}.java
│       ├── controller/{ClienteController, AuthController, EmocaoController, TagController, FotoController}.java
│       ├── security/{JwtService, JwtAuthenticationFilter, CustomUserDetailsService, CurrentUserHelper}.java
│       ├── service/{ClienteService, AuthService, EmocaoService, TagService, FotoService}.java
│       ├── repository/{ClienteRepository, UserRepository, EmocaoRepository, TagRepository, FotoRepository}.java
│       ├── entity/{User, Cliente, Endereco, Emocao, Tag, Foto}.java
│       ├── dto/{auth/*, album/*, ClienteRequestDTO, ClienteResponseDTO, EnderecoDTO}.java
│       └── exception/{GlobalExceptionHandler, DuplicateResourceException, ResourceNotFoundException}.java
├── frontend/                               Angular — UI
│   └── src/app/
│       ├── auth/                           AuthService, interceptor, guard, telas login/registrar
│       ├── core/                           ThemeService, FontService, LanguageService
│       ├── clientes/                       Cliente lista, form, modelo, service
│       ├── album/                          Galeria, lootbox, emocoes, tags, services
│       ├── configuracoes/                  Shell + Perfil + Acessibilidade
│       └── shared/                         Validators, AuthImgDirective (carrega imagens via Bearer)
│   └── public/i18n/                        pt.json, en.json, es.json
├── docs/
│   ├── 01_setup_oracle.sql                 cria usuário PROJETO no XEPDB1
│   └── 02_reset_schema_para_v2.sql         limpa tabelas para nova migração
└── README.md
```

---

## Pré-requisitos

- **Java 17+** (testado também em Java 19)
- **Node.js 20 LTS** + npm
- **Angular CLI** (`npm i -g @angular/cli`)
- **Oracle Database 21c Express Edition** rodando localmente (porta 1521, PDB `XEPDB1`)
- **Git**

---

## Setup e execução — do zero

### 1. Clonar e configurar Oracle

```bash
git clone https://github.com/kauanythalodaviramos/altis-cadastro-clientes.git
cd altis-cadastro-clientes
```

Conectado como SYSTEM no XEPDB1, criar o usuário da aplicação:

```bash
sqlplus SYSTEM/<sua-senha>@//localhost:1521/XEPDB1 @docs/01_setup_oracle.sql
```

> Cria usuário `PROJETO` / senha `Altis_2026` com permissões mínimas.

### 2. Subir o backend

```bash
cd backend
./mvnw spring-boot:run        # Linux/Mac
# ou
.\mvnw.cmd spring-boot:run    # Windows
```

API sobe em `http://localhost:8080`. Hibernate cria as 6 tabelas automaticamente (`USERS`, `CLIENTES`, `EMOCOES`, `TAGS`, `FOTOS`, `FOTO_TAGS`) na primeira execução.

> **Variáveis de ambiente opcionais** (defaults para dev local):
> - `DB_USERNAME=PROJETO`, `DB_PASSWORD=Altis_2026`
> - `JWT_SECRET=...` (string aleatória ≥ 32 chars — gerar com `openssl rand -base64 64`)

### 3. Subir o frontend

Em outro terminal:

```bash
cd frontend
npm install
ng serve
```

Frontend sobe em `http://localhost:4200`. Acesse, registre uma conta e comece a usar.

---

## API REST

Todos os endpoints (exceto `/api/auth/login` e `/api/auth/register`) exigem header:

```
Authorization: Bearer <JWT>
```

### Autenticação

| Método | Path | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cria usuário e retorna JWT |
| `POST` | `/api/auth/login` | Autentica e retorna JWT |
| `GET` | `/api/auth/me` | Dados do usuário logado |
| `PUT` | `/api/auth/me` | Atualiza nome/email (senha exigida pra mudar email) |
| `PUT` | `/api/auth/me/senha` | Altera senha |
| `GET` `PUT` `DELETE` | `/api/auth/me/foto` | Avatar do usuário (BLOB) |

### Clientes

| Método | Path | Descrição |
|---|---|---|
| `POST` `GET` | `/api/clientes` | Cria / lista (com `?filtro=`) |
| `GET` `PUT` `DELETE` | `/api/clientes/{id}` | Busca / atualiza / remove |

### Álbum

| Método | Path | Descrição |
|---|---|---|
| `GET` `POST` `PUT` `DELETE` | `/api/emocoes[/{id}]` | CRUD de emoções |
| `GET` `POST` `DELETE` | `/api/tags[/{id}]` | CRUD de tags |
| `POST` (multipart) | `/api/fotos` | Upload (file, emocaoId, clienteId?, titulo?, descricao?, tags=csv) |
| `GET` | `/api/fotos?emocoes=&tags=&clienteId=&favoritismo=&order=` | Lista com filtros |
| `GET` | `/api/fotos/{id}/imagem` | Serve a imagem BLOB |
| `GET` `PUT` `DELETE` | `/api/fotos/{id}` | Detalhes / edit metadata / remove |
| `POST` `DELETE` | `/api/fotos/{id}/like` | Incrementa / decrementa likes |
| `GET` | `/api/fotos/lootbox?{filtros}` | Top 3 por likes do filtro |

### Formato de erro

```json
{
  "timestamp": "2026-05-26T22:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Dados invalidos",
  "errors": { "cpf": "CPF invalido" }
}
```

O frontend mapeia `errors[campo]` para mensagens inline no formulário.

### Status codes

- `200`/`201`/`204` — sucesso
- `400` — validação falhou (corpo com `errors` por campo)
- `401` — token ausente/inválido ou credenciais erradas
- `404` — recurso não existe ou não pertence ao usuário
- `409` — conflito (email/CPF/telefone duplicado, ou emoção em uso)
- `413` — arquivo > 5MB

---

## Decisões de projeto

### Multi-tenancy
- Cada entidade carrega `usuario_id` (FK). Repositories filtram automaticamente via `CurrentUserHelper`.
- Uniqueness é **composta por usuário** (Usuário A pode ter o mesmo CPF que Usuário B em suas listas — cenário real).

### Segurança
- BCrypt para hash de senhas (`spring-security-crypto`).
- JWT HS256 com secret de 256 bits no `application.properties` (sobrescrito por `JWT_SECRET` em prod).
- `SecurityFilterChain` stateless, sem CSRF (API REST).
- Token vai no `Authorization: Bearer` header, persistido em `localStorage`.
- `JwtAuthenticationFilter` popula `SecurityContext` antes de cada request autenticada.
- Frontend: HTTP interceptor injeta token; resposta 401 limpa sessão e redireciona para `/login`.

### Armazenamento de imagens
- BLOB diretamente no Oracle (`VARBINARY`/`BLOB`) — backup unificado, sem servidor de arquivos extra.
- Frontend autentica fetch da imagem via `AuthImgDirective` (HttpClient + `responseType: 'blob'` + `URL.createObjectURL` com cleanup automático).

### Internacionalização
- **ngx-translate v17** com loader HTTP carregando `public/i18n/{lang}.json`.
- `LanguageService` gerencia idioma atual + persistência. Aplicado em `<html lang>` para acessibilidade.
- Bootstrap `data-bs-theme` no `<html>` controla tema. Variáveis CSS customizadas (`--altis-bg`, `--altis-card-bg`) complementam.

### Animações
- Quase tudo via **CSS transitions/keyframes** (performance > Angular animations).
- `@media (prefers-reduced-motion: reduce)` desliga animações respeitando preferência do usuário.

---

## O que ficou de fora

- **Testes automatizados**: priorizei volume de features para a avaliação. Estrutura DTO/Service deixa pronto para testar.
- **Refresh token**: token expira em 24h; usuário precisa relogar. Para produção, implementar refresh.
- **Compressão de imagens server-side**: upload aceita até 5MB sem redimensionar. Em produção, usar Imgproxy/Cloudinary.
- **Histórico de likes** (quem deu like): contador agregado apenas, sem identificar usuário (sistema é mono-usuário por design — você curte suas próprias fotos para ranking).
- **Migração de schema versionada**: usando `ddl-auto=update` para dev; em produção substituir por Flyway/Liquibase.
