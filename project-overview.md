# YenCloud - Project Overview

A learning project to practice deploying a containerized web app on AWS.

---

## What was built

### Local project (this folder)

```
yencloud/
├── backend/
│   ├── server.js             # Express API (products, categories, SPA fallback)
│   ├── data/products.json    # 12 product catalog items
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx          # React entry point
│   │   ├── App.jsx           # Routes (Home, ProductDetail, Cart)
│   │   ├── index.css         # Tailwind import
│   │   ├── context/
│   │   │   └── CartContext.jsx  # Cart state (add, remove, quantity, total)
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Search, categories dropdown, cart badge
│   │   │   └── ProductCard.jsx  # Product card with add-to-cart button
│   │   └── pages/
│   │       ├── Home.jsx         # Product grid + category/price filters
│   │       ├── ProductDetail.jsx# Image, desc, price, add-to-cart
│   │       └── Cart.jsx         # Item list, quantity controls, total
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env                    # ALLOWED_HOSTS, NODE_ENV, PORT
├── Dockerfile              # Node.js multi-stage build (React → Express)
├── .dockerignore
│
├── push-ecr.md             # Guide: push image to ECR
├── deploy-to-ec2.md        # Guide: deploy to EC2
├── config-fleet-manager.md # Guide: Systems Manager / Fleet Manager
├── sso-create.md           # Guide: AWS SSO profile setup
├── project-overview.md     # This file
│
├── yencloud-key.pem        # SSH private key (keep safe!)
└── task.txt
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + Tailwind CSS 4 |
| **Backend** | Node.js + Express |
| **Database** | JSON file (12 products) |
| **Container** | Docker (Node 20-alpine, multi-stage) |
| **Hosting** | AWS EC2 (t4g.micro, Amazon Linux 2023) |

### Cloud resources

| Resource | Detail |
|----------|--------|
| **ECR** | `<account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest` |
| **EC2** | `i-xxxxxxxx` - `t4g.micro`, Amazon Linux 2023 |
| **Public URL** | `http://<public-ip>:5000` |
| **IAM role** | `yencloud-ec2-role` (ECR read + SSM managed) |
| **Security group** | `yencloud-sg` (ports 22, 5000 open) |
| **Key pair** | `yencloud-key` |

---

## Session log

### Session 1 (June 2) - Initial setup

- Created Flask app with `ALLOWED_HOSTS` from `.env`
- Pushed to ECR, deployed to EC2
- Set up Fleet Manager + SSM
- Documented SSO profile setup

### Session 2 (June 13) - Full e-commerce rewrite

- Replaced Flask with **Node.js/Express** backend
  - Products API with filtering (category, price, search)
  - Categories endpoint
  - Product detail by slug
  - Serves built React frontend in production
- Built **React frontend** with Vite + Tailwind CSS 4
  - **Navbar**: Search bar, categories dropdown, cart icon with badge
  - **Home page**: Product grid with category & price range filters, loading skeletons
  - **Product Detail**: Image, description, price, star rating, add-to-cart
  - **Cart**: Quantity controls, remove item, clear all, total calculation
  - Responsive design (mobile hamburger menu, adaptive grid)
  - Cart state managed via React Context + `useReducer`
- Updated Dockerfile to **multi-stage build**
  - Stage 1: Build React app
  - Stage 2: Express server with built frontend in `./public`
- Pushed new image to ECR and deployed to EC2

### Session 3 (June 13) - Production-grade infrastructure

- **PostgreSQL database** (Prisma ORM)
  - `Product` model: originalPrice, salePrice, stock, images[], metadata JSON
  - `Order` model: status state machine (PENDING → PROCESSING → SHIPPED → DELIVERED, or CANCELLED)
  - `Refund` model: linked to order, REQUESTED → APPROVED/REJECTED workflow
  - Auto-migration on startup via `prisma db push`
  - Seed script loads 12 products from JSON
- **AWS S3 uploads** (`POST /api/uploads` with multer + S3 SDK)
- **Admin Dashboard** (`/admin`)
  - Token-based auth (`ADMIN_API_KEY` env var)
  - Product CRUD (add/edit/delete products)
  - Order management (view + update status)
  - Refund management (view + approve/reject)
- **Order Tracking** (`/order` page)
  - Lookup by Order ID
  - Visual status progress bar
  - Refund status display
- **docker-compose.yml** for local dev (PostgreSQL + app)

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Public | List products (filters: `category`, `minPrice`, `maxPrice`, `search`) |
| GET | `/api/products/categories` | Public | List all categories |
| GET | `/api/products/:slug` | Public | Get single product by slug |
| GET | `/api/categories` | Public | List all categories |
| POST | `/api/orders` | Public | Create order |
| GET | `/api/orders/:orderId` | Public | Track order by ID |
| POST | `/api/uploads` | Admin | Upload image to S3 |
| GET | `/api/admin/products` | Admin | List all products (admin) |
| POST | `/api/admin/products` | Admin | Create product |
| PUT | `/api/admin/products/:id` | Admin | Update product |
| DELETE | `/api/admin/products/:id` | Admin | Delete product |
| GET | `/api/admin/orders` | Admin | List all orders |
| PUT | `/api/admin/orders/:id/status` | Admin | Update order status |
| GET | `/api/admin/refunds` | Admin | List refunds |
| POST | `/api/admin/refunds` | Admin | Create refund request |
| PUT | `/api/admin/refunds/:id` | Admin | Approve/reject refund |
| GET | `/*` | Public | Serves React SPA (production only) |

---

## Order State Machine

```
           ┌─────────┐
           │ PENDING │
           └────┬────┘
                │
           ┌────▼──────┐      ┌───────────┐
           │ PROCESSING│      │ CANCELLED │
           └────┬──────┘      └───────────┘
                │
           ┌────▼───┐
           │ SHIPPED │
           └────┬───┘
                │
           ┌────▼─────┐
           │ DELIVERED│
           └────┬─────┘
                │
         ┌──────▼───────┐
         │ Refund workflow│
         │  REQUESTED →  │
         │  APPROVED /   │
         │  REJECTED     │
         └───────────────┘
```

## Key commands cheatsheet

```bash
# Build & run locally (with PostgreSQL)
docker compose up -d

# Build & run locally (standalone)
docker build -t yencloud .
docker run -d -p 5000:5000 \
  -e ALLOWED_HOSTS=localhost \
  -e DATABASE_URL="postgresql://..." \
  -e ADMIN_API_KEY="my-secret-key" \
  yencloud

# Dev mode (separate terminals)
cd frontend && npm run dev    # Vite at :5173, proxies /api → :5000
cd backend && npm run dev     # Express at :5000 (needs DATABASE_URL)

# Push to ECR
aws ecr get-login-password --region eu-north-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-north-1.amazonaws.com
docker tag yencloud:latest <account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest
docker push <account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest

# SSH to EC2
ssh -i yencloud-key.pem ec2-user@<public-ip>

# Check container on EC2
ssh -i yencloud-key.pem ec2-user@<public-ip> "docker ps && curl -s http://localhost:5000"

# SSM Run Command
aws ssm send-command --region eu-north-1 \
  --document-name "AWS-RunShellScript" \
  --instance-ids <instance-id> \
  --parameters 'commands=["docker ps"]'

# Migration script (standalone)
bash scripts/migrate.sh

# SSO login
aws sso login --profile yentest
aws sts get-caller-identity --profile yentest
```

## Admin key

Set the `ADMIN_API_KEY` environment variable and visit `/admin` to log in.

---

## Next steps

- [x] Set up S3 bucket for image uploads (create bucket + set env vars)
- [x] Add HTTPS with Cloudflare
- [x] Set up Nginx reverse proxy
- [ ] Connect AWS RDS (PostgreSQL) instead of local Postgres on EC2
- [ ] Automate deployment with GitHub Actions (CI/CD)
- [ ] Add user authentication (Cognito or Auth0)
- [ ] Move from EC2 to ECS/Fargate
