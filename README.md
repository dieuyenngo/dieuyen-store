<div align="center">
  <h1>YenCloud Store</h1>
  <p>A full-stack e-commerce platform deployed on AWS</p>
</div>

## Tech Stack

**Frontend** | React 19 + Vite + Tailwind CSS 4
**Backend** | Node.js + Express
**Database** | PostgreSQL + Prisma ORM
**Infrastructure** | Docker · AWS (ECR, EC2, S3, SSM) · Nginx · Cloudflare

## Features

- **Product catalog** with category/price/search filtering
- **Shopping cart** with quantity controls (React Context + useReducer)
- **Order tracking** with visual status progress bar
- **Admin dashboard** with token-based auth
  - Product CRUD (add/edit/delete)
  - Order management (view + update status)
  - Refund management (approve/reject)
- **Image uploads** to S3 (admin only)
- **Responsive design** — mobile hamburger menu, adaptive grid

## Architecture

```
Cloudflare (orange cloud)
       │ HTTPS
  ┌────▼────┐
  │  Nginx  │  port 80  (reverse proxy)
  └────┬────┘
  ┌────▼──────┐
  │  Express  │  port 5000  (API + SPA)
  └────┬──────┘
  ┌────▼──────┐     ┌────────────┐
  │ Prisma    │────▶│ PostgreSQL │
  │ (ORM)     │     │ (on host)  │
  └───────────┘     └────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (optional — docker compose provides it)

### Local development

```bash
# 1. Start PostgreSQL + app
docker compose up -d

# 2. Or run separately (two terminals):
cd backend && npm run dev      # Express at :5000
cd frontend && npm run dev     # Vite at :5173 (proxies /api → :5000)
```

### Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://yencloud:changeme@localhost:5432/yencloud
ADMIN_API_KEY=your-secret-key
AWS_REGION=eu-north-1
```

## Scripts

| Command | Directory | Description |
|---|---|---|
| `npm run dev` | `backend/` | Start Express with file watching |
| `npm run dev` | `frontend/` | Start Vite dev server |
| `npm run build` | `frontend/` | Build React app for production |
| `npm test` | either | Run tests with Vitest |
| `npm run lint` | either | Lint code with ESLint |
| `npm run format` | either | Format code with Prettier |
| `npm run db:migrate` | `backend/` | Run Prisma migrations |
| `npm run db:seed` | `backend/` | Seed database with products |

## API

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products (filters: `category`, `minPrice`, `maxPrice`, `search`) |
| GET | `/api/products/categories` | List categories |
| GET | `/api/products/:slug` | Get product by slug |
| GET | `/api/categories` | List categories |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders/:orderId` | Track order by ID |

### Admin (requires `Authorization: Bearer $ADMIN_API_KEY`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/products` | List all products |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/orders` | List orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/refunds` | List refunds |
| POST | `/api/admin/refunds` | Create refund request |
| PUT | `/api/admin/refunds/:id` | Approve/reject refund |
| POST | `/api/uploads` | Upload image to S3 |

## CI/CD

On every push to `main`, GitHub Actions:

1. **Lints** both frontend and backend
2. **Runs tests** (21 unit tests across 5 suites)
3. **Builds and pushes** Docker image to Amazon ECR
4. **Deploys** to EC2 via AWS SSM Run Command

## Project Structure

```
yencloud/
├── backend/
│   ├── server.js              # Express entry point
│   ├── config.js              # SSM Parameter Store loader
│   ├── routes/                # API route handlers
│   ├── middleware/            # Auth middleware
│   ├── prisma/                # Schema, migrations, seed
│   ├── scripts/               # Startup scripts
│   └── tests/                 # Vitest test suites
├── frontend/
│   ├── src/
│   │   ├── pages/             # Home, Cart, Admin, etc.
│   │   ├── components/        # Navbar, ProductCard
│   │   ├── context/           # Cart state (useReducer)
│   │   └── __tests__/         # Component tests
│   └── vitest.config.js
├── .github/workflows/         # CI + Deploy pipelines
├── Dockerfile                 # Multi-stage build
├── docker-compose.yml         # Local PostgreSQL + app
└── infrastructure.md          # AWS resource guide
```

## Deployment

The app runs on a `t4g.micro` EC2 instance (Amazon Linux 2023) with Docker. Secrets are stored in AWS SSM Parameter Store under `/yencloud/production/` and loaded at startup. Nginx reverse-proxies port 80 → 5000 with Cloudflare handling SSL termination.

See [infrastructure.md](./infrastructure.md) for details on S3, SSM, and IAM setup.

