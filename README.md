---

# Client and Social Media Registration

A complete fullstack application featuring **multi-user client registration**, a **photo album** with an emotions/tags/likes system and an **animated lootbox**, and **accessibility settings** (theme, font size, 3 languages).

An evaluative project developed by Charlotte.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 + Bootstrap 5.3 + ngx-mask + ngx-translate |
| Backend | Java 17+ + Spring Boot 4 + Spring Security 6 + Spring Data JPA + Hibernate Validator + jjwt 0.12 |
| Database | Oracle Database 21c Express Edition |
| Authentication | JWT (HS256) + BCrypt + stateless middleware |

---

## Features

### User Registration & Authentication

- **Sign up** with name, email, and password (BCrypt hash).
- **Login** with email/password returns a JWT.
- **Session persistence** via localStorage (survives page refresh).
- **Logout** clears the token and redirects.
- **Multi-tenancy**: each user only sees their own clients, photos, emotions, and tags.

### Client Registration (Full CRUD)

- Name (min. 10 chars), CPF (official validation + unique per user), WhatsApp phone (10–11 digits, unique per user), structured address, notes (max. 100 chars).
- Validations **mirrored on both frontend and backend**.
- Smart filter by name OR CPF (with 300ms debounce).
- Edit, delete (with confirmation), automatic list refresh.

### Settings Screen

**Profile** (`/configuracoes/perfil`)
- Edit name, email (requires current password), profile picture (JPG/PNG/WebP up to 5MB).
- "Change password" modal with confirmation.
- Circular avatar appears in the navbar once defined.

**Accessibility** (`/configuracoes/acessibilidade`)
- **Theme**: Light or Dark (Bootstrap `data-bs-theme`, smooth transition).
- **Font size**: 4 levels (14/16/18/20px) with real-time preview.
- **Language**: Portuguese, English, or Spanish — ALL UI text changes instantly.
- Preferences persist in localStorage, applied on boot (no visual flash).

### Photo Album (`/album`)

**Gallery** (`/album/galeria`)
- Responsive photo grid with a filter sidebar on the left.
- Combined filters: emotions (colored chips), tags (chips), client, favoriting (Loved/Average/Less), sorting.
- Photo upload via modal with preview, emotion selection, optional client, tags (inline creation).
- Heart button with **pulse animation** (1 → 1.45 → 1) on like.
- Clicking a card opens a detail modal with a large image, metadata editing, and deletion.

**Lootbox** (`/album/lootbox`) — *the showstopper*
- Filters to define the pool of eligible photos.
- "Open box" button triggers:
  1. Box shakes 3 times (`caixaShake`, 900ms).
  2. Pop with 6 particles in a radial explosion (`sparkle`, 300ms).
  3. Sequential reveal of the 3 top-ranked photos with `revealCard` (scale 0.5 → 1 with rotation, 600ms delay each).
- Golden badges with ranking, like counter on each card.
- Friendly empty state if filters return nothing.

**Emotions** (`/album/emocoes`)
- 8 default emotions created automatically on registration (Happy, Sad, Love, Calm, Excited, Nostalgic, Inspired, Other).
- CRUD with modal: name, 10-color picker, 12-icon suggested picker.
- Deletion is blocked if photos are linked (friendly HTTP 409).

**Tags** (`/album/tags`)
- Cloud of `#name` chips with inline creation (Enter works) and individual removal.
- `tagEnter` animation with bouncy spring overshoot.
- Deleting a tag removes it from all photos (CASCADE).

**Likes System**
- Each like increments the photo's `likesCount`.
- Derived category: `< 3 = less`, `3–10 = average`, `> 10 = loved` (different colors).
- Lootbox prioritizes by favoriting filter + sorts by likes desc.

### Animations & Design

Principles respected throughout the app:
- Durations **150–300ms** for micro-interactions, 600ms for highlights.
- Consistent `cubic-bezier(0.4, 0, 0.2, 1)` curve (Material standard).
- Button hover: lift + soft shadow.
- Click feedback: scale(0.98).
- Modals: backdrop fade + content slide-up.
- Grid cards: stagger fade-in (35–50ms between each).
- **`prefers-reduced-motion` respected** — animations are disabled if the user's OS prefers it.

---

## Repository Structure

```
altis-cadastro-clientes/
├── backend/                                Spring Boot — REST API
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
│       ├── auth/                           AuthService, interceptor, guard, login/register screens
│       ├── core/                           ThemeService, FontService, LanguageService
│       ├── clientes/                       Client list, form, model, service
│       ├── album/                          Gallery, lootbox, emotions, tags, services
│       ├── configuracoes/                  Shell + Profile + Accessibility
│       └── shared/                         Validators, AuthImgDirective (loads images via Bearer)
│   └── public/i18n/                        pt.json, en.json, es.json
├── docs/
│   ├── 01_setup_oracle.sql                 creates PROJETO user in XEPDB1
│   └── 02_reset_schema_para_v2.sql         clears tables for new migration
└── README.md
```

---

## Prerequisites

- **Java 17+** (also tested on Java 19)
- **Node.js 20 LTS** + npm
- **Angular CLI** (`npm i -g @angular/cli`)
- **Oracle Database 21c Express Edition** running locally (port 1521, PDB `XEPDB1`)
- **Git**

---

## Setup & Running — From Scratch

### 1. Clone and configure Oracle

```bash
git clone https://github.com/kauanythalodaviramos/social-clienty.git
cd social-clienty
```

Connected as SYSTEM in XEPDB1, create the application user:

```bash
sqlplus SYSTEM/<your-password>@//localhost:1521/XEPDB1 @docs/01_setup_oracle.sql
```
> Creates user `PROJETO` / password `Altis_2026` with minimal permissions.

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run        # Linux/Mac
# or
.\mvnw.cmd spring-boot:run    # Windows
```

API starts at `http://localhost:8080`. Hibernate creates the 6 tables automatically (`USERS`, `CLIENTS`, `EMOTIONS`, `TAGS`, `PHOTOS`, `PHOTO_TAGS`) on first run.

> **Optional environment variables** (defaults for local dev):
> - `JWT_SECRET=...` (random string ≥ 32 chars — generate with `openssl rand -base64 64`)

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm install
ng serve
```

Frontend starts at `http://localhost:4200`. Open it, register an account, and start using it.

---

## REST API

All endpoints (except `/api/auth/login` and `/api/auth/register`) require header:

```
Authorization: Bearer <JWT>
```

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Creates user and returns JWT |
| `POST` | `/api/auth/login` | Authenticates and returns JWT |
| `GET` | `/api/auth/me` | Logged-in user data |
| `PUT` | `/api/auth/me` | Update name/email (password required to change email) |
| `PUT` | `/api/auth/me/senha` | Change password |
| `GET` `PUT` `DELETE` | `/api/auth/me/foto` | User avatar (BLOB) |

### Clients

| Method | Path | Description |
|---|---|---|
| `POST` `GET` | `/api/clientes` | Create / list (with `?filtro=`) |
| `GET` `PUT` `DELETE` | `/api/clientes/{id}` | Fetch / update / remove |

### Album

| Method | Path | Description |
|---|---|---|
| `GET` `POST` `PUT` `DELETE` | `/api/emocoes[/{id}]` | Emotions CRUD |
| `GET` `POST` `DELETE` | `/api/tags[/{id}]` | Tags CRUD |
| `POST` (multipart) | `/api/fotos` | Upload (file, emocaoId, clienteId?, titulo?, descricao?, tags=csv) |
| `GET` | `/api/fotos?emocoes=&tags=&clienteId=&favoritismo=&order=` | List with filters |
| `GET` | `/api/fotos/{id}/imagem` | Serves the BLOB image |
| `GET` `PUT` `DELETE` | `/api/fotos/{id}` | Details / edit metadata / remove |
| `POST` `DELETE` | `/api/fotos/{id}/like` | Increment / decrement likes |
| `GET` | `/api/fotos/lootbox?{filters}` | Top 3 by likes matching filters |

### Error Format

```json
{
  "timestamp": "2026-05-26T22:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid data",
  "errors": { "cpf": "Invalid CPF" }
}
```

The frontend maps `errors[field]` to inline messages in the form.

### Status Codes

- `200`/`201`/`204` — success
- `400` — validation failed (body with `errors` per field)
- `401` — missing/invalid token or wrong credentials
- `404` — resource doesn't exist or doesn't belong to the user
- `409` — conflict (duplicate email/CPF/phone, or emotion in use)
- `413` — file > 5MB

---

## Design Decisions

### Multi-tenancy
- Each entity carries `usuario_id` (FK). Repositories automatically filter via `CurrentUserHelper`.
- Uniqueness is **composite per user** (User A can have the same CPF as User B in their own lists — a real-world scenario).

### Security
- BCrypt for password hashing (`spring-security-crypto`).
- JWT HS256 with 256-bit secret in `application.properties` (overridden by `JWT_SECRET` in production).
- Stateless `SecurityFilterChain`, no CSRF (REST API).
- Token in `Authorization: Bearer` header, persisted in `localStorage`.
- `JwtAuthenticationFilter` populates `SecurityContext` before each authenticated request.
- Frontend: HTTP interceptor injects the token; a 401 response clears the session and redirects to `/login`.

### Image Storage
- BLOBs stored directly in Oracle (`VARBINARY`/`BLOB`) — unified backup, no extra file server needed.
- Frontend authenticates image fetching via `AuthImgDirective` (HttpClient + `responseType: 'blob'` + `URL.createObjectURL` with automatic cleanup).

### Internationalization
- **ngx-translate v17** with HTTP loader reading `public/i18n/{lang}.json`.
- `LanguageService` manages the current language + persistence. Applied to `<html lang>` for accessibility.
- Bootstrap `data-bs-theme` on `<html>` controls the theme. Custom CSS variables (`--altis-bg`, `--altis-card-bg`) complement it.

### Animations
- Almost everything via **CSS transitions/keyframes** (performance over Angular animations).
- `@media (prefers-reduced-motion: reduce)` disables animations, respecting the user's preference.

---

## What Was Left Out

- **Automated tests**: feature volume was prioritized for the evaluation. The DTO/Service structure is ready for testing.
- **Refresh token**: token expires in 24h; user must log in again. Implement refresh for production.
- **Server-side image compression**: uploads accepted up to 5MB without resizing. Use Imgproxy/Cloudinary in production.
- **Likes history** (who liked what): aggregated counter only, without identifying the user (the system is single-user by design — you like your own photos for ranking purposes).
- **Versioned schema migration**: using `ddl-auto=update` for dev; replace with Flyway/Liquibase in production.

---
