# AcademiQ — AI-Powered Academic Department Management & Analytics System

> **Major Project — B.Tech Computer Science, Final Year**  


[![CI](https://github.com/rohanjangir31/departmentMS/actions/workflows/ci.yml/badge.svg)](https://github.com/rohanjangir31/departmentMS/actions/workflows/ci.yml)

---

## What is AcademiQ?

AcademiQ is a production-grade academic department management platform that extends a base open-source project with:

- 🤖 **AI RAG Assistant** — Students ask questions in natural language; get citation-backed answers from their own course materials (no cloud API key required)
- 📊 **Academic Risk Prediction** — Lecturers see a cohort risk dashboard; the system flags at-risk students early using a transparent risk index formula
- 🔐 **Security Hardened** — Fixed privilege escalation, added Zod validation on all routes, normalized enrollment data
- ✅ **26 Automated Tests** — Jest + Supertest + mongodb-memory-server; all passing
- 🐳 **Docker Compose** — One-command full stack deployment

---

## Quick Start (Docker — Recommended)

```bash
git clone https://github.com/rohanjangir31/departmentMS.git
cd departmentMS
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend API (Express) | http://localhost:4000/api |
| Health Check | http://localhost:4000/api/health |

---

## Manual Setup

```bash
# 1. Backend
cd backend
cp .env.example .env     # Edit MONGODB_URI and JWT_SECRET
npm install
npm run dev              # Port 4000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev              # Port 3000

# 3. Run all tests (no MongoDB required)
cd backend
npm test
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 3 |
| Backend | Express.js, TypeScript 5.8, Mongoose 8 |
| Database | MongoDB 7 |
| Validation | Zod 4 |
| AI Engine | Custom RAG (TF-IDF + Cosine Similarity) + Risk Index |
| Testing | Jest 30, Supertest, mongodb-memory-server |
| Deployment | Docker Compose, GitHub Actions CI |

---

## Architecture

```
Client (Next.js) → Axios → Express API → Zod Middleware → Controllers
                                                    ↓
                                           AI Engine (RAG + Risk)
                                                    ↓
                                              MongoDB Atlas
```

---



---

## License

MIT — See [LICENSE](./LICENSE). Original work by Oyero Habibulah O. — See [ATTRIBUTION.md](./ATTRIBUTION.md).
