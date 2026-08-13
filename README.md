# Intelligent-Cloud API

Backend for the Intelligent-Cloud marketing site and admin panel.

## Stack

- Node.js 20+
- TypeScript
- Express
- Mongoose / MongoDB

## Setup

```bash
cd intelligent-cloud-api
cp .env.example .env
npm install
npm run dev
```

Health check: [http://localhost:4000/health](http://localhost:4000/health)

## Local run order

1. Start **MongoDB**
2. Start **API** (this folder) — `http://localhost:4000`
3. Start **Admin** (`../intelligent-cloud-admin`, port `5174`)
4. Start **Web** (`../intelligent-cloud-web`, port `5173`)

## Env

See `.env.example` for `PORT`, `MONGODB_URI`, `JWT_SECRET`, `SMTP_*`, `UPLOAD_DIR`, `CORS_ORIGINS`.

Leave `SMTP_HOST` empty locally to log mail instead of sending. Branded templates live in `src/services/emailTemplates.ts`. Mail failures after a lead is saved are logged and do not fail the HTTP request.

Production deploy: see [`../DEPLOY.md`](../DEPLOY.md).

## Sibling apps (same parent folder)

| App | Role |
| --- | --- |
| `intelligent-cloud-api` | This backend |
| `intelligent-cloud-admin` | Admin panel |
| `intelligent-cloud-web` | Marketing website |
| parent `Intelligent-Cloud` | Design docs + master assets |
