# MediQueue

A production-grade **hospital patient queue management REST API** built with Node.js and PostgreSQL. Designed to streamline patient flow across OPD departments — handling doctor onboarding, patient registration, queue assignment, token management, and appointment tracking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | PostgreSQL via Knex.js |
| Validation | Zod |
| Auth | JWT + bcryptjs |
| Logging | Pino |
| Rate Limiting | express-rate-limit |
| Testing | Jest |

---

## Features

- **Doctor Management** — Signup with PMDC registration number verification, per-request verification status checks, secure password hashing
- **Patient Registration** — Register patients and assign them to the correct OPD queue
- **Queue Management** — Token generation, queue ordering, status tracking (waiting / in-progress / done)
- **JWT Authentication** — Role-based access for doctors and admin staff
- **Request Validation** — Schema-level validation on all inputs via Zod
- **Structured Logging** — Request/response logging with Pino
- **Rate Limiting** — Per-IP limits to prevent abuse on sensitive endpoints

---

## Project Structure

```
mediqueue/
├── src/
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── store/           # Database queries (Knex)
│   ├── middleware/       # Auth, validation, rate limiting
│   ├── config/          # DB config, env setup
│   └── app.js           # Express app entry point
├── migrations/          # Knex migration files
├── seeds/               # Seed data
├── tests/               # Jest test suites
├── knexfile.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14

### Installation

```bash
git clone https://github.com/ausafelahi/mediqueue.git
cd mediqueue
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mediqueue
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### Database Setup

```bash
# Run migrations
npx knex migrate:latest

# (Optional) Seed initial data
npx knex seed:run
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Overview

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/doctor/signup` | Register a doctor with PMDC number |
| POST | `/api/auth/doctor/login` | Doctor login, returns JWT |

### Doctors

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors/me` | Get current doctor profile |
| GET | `/api/doctors/verification-status` | Check PMDC verification status |

### Patients

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/patients/register` | Register a new patient |
| GET | `/api/patients/:id` | Get patient details |

### Queue

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/queue/assign` | Assign patient to a queue |
| GET | `/api/queue/:departmentId` | Get current queue for a department |
| PATCH | `/api/queue/token/:tokenId/status` | Update token status |
| DELETE | `/api/queue/token/:tokenId` | Remove a token from queue |

> All protected routes require `Authorization: Bearer <token>` header.

---

## Running Tests

```bash
npm test
```

Tests are written in Jest and cover core service and route logic.

---

## Design Decisions

- **ESM throughout** — The project uses ES Modules (`"type": "module"` in `package.json`) for consistency with modern Node.js.
- **Layered architecture** — Routes → Controllers → Services → Store. Each layer has a single responsibility; business logic never leaks into route handlers.
- **Knex over an ORM** — Chosen for explicit SQL control and straightforward migration management without ORM overhead.
- **Zod at the boundary** — All external inputs are validated before reaching the service layer, keeping business logic clean.
- **Pino for logging** — Low-overhead structured logging suitable for production environments.

---

## Author

**Ausaf Elahi**
[Portfolio](https://ausafelahi.vercel.app) · [GitHub](https://github.com/ausafelahi)
