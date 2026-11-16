# Node.js + TypeScript + Sequelize + Zod + PostgreSQL API

A RESTful backend API built with Node.js, TypeScript, Sequelize ORM, Zod for schema validation, and PostgreSQL.

## 🚀 Features

- ✨ Built with TypeScript
- 📦 Sequelize ORM for PostgreSQL
- 🧪 Zod for schema validation
- 🧾 RESTful API structure
- ✅ Centralized error handling
- 📁 Organized project architecture
- 🔐 Environment variable configuration with dotenv

---

## 🛠️ Tech Stack

- **Node.js**
- **TypeScript**
- **Sequelize**
- **PostgreSQL**
- **Zod**
- **Express**
- **dotenv**
- **nodemon** (for development)

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/your-repo.git
cd backend

npm install

DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key

npm run dev



## Deploying (Railway / Vercel)

`.env` is git-ignored, so **set these in the host's Variables tab** or the server exits with
"Missing required environment variables":

| Variable | Required | Notes |
| --- | --- | --- |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | yes | PostgreSQL. On Railway you can reference its Postgres service (`${{Postgres.PGHOST}}` …) |
| `DB_SSL` | yes for cloud DBs | `true` for Neon / Supabase |
| `JWT_SECRET` | yes | long random string (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | yes | e.g. `2h` |
| `NODE_ENV` | recommended | `production` |
| `MONGODB_URI` | optional | cow photos use MongoDB GridFS when reachable, otherwise they are stored in Postgres (`cow_image_blobs`) |
| `FRONTEND_URL` | recommended | used in password-reset links |
| `CORS_ORIGINS` | if you add new frontends | comma-separated extra allowed origins |
| `GOOGLE_*`, `EMAIL_*`, `REDIS_URL` | optional | calendar / email / cache features |

### Built-in protections
- `helmet` security headers.
- Rate limiting: 20 attempts / 15 min on login, register and password reset; 300 requests / min on the API.
  (In-memory per instance — on serverless hosts use a shared store such as Redis for strict limits.)
- JSON 404 for unknown `/api` routes and a global error handler that never leaks stack traces.
