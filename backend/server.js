import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSecrets } from "./config.js";

dotenv.config();

await loadSecrets();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "localhost").split(",");

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const host = req.headers.host?.split(":")[0];
  if (host && !ALLOWED_HOSTS.includes(host)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// Dynamic imports after loadSecrets so SSM params (e.g. DATABASE_URL)
// are set in process.env before PrismaClient is constructed.
const [productsRouter, ordersRouter, adminRouter, uploadsRouter] = await Promise.all([
  import("./routes/products.js"),
  import("./routes/orders.js"),
  import("./routes/admin.js"),
  import("./routes/uploads.js"),
]);

app.use("/api/products", productsRouter.default);
app.use("/api/orders", ordersRouter.default);
app.use("/api/admin", adminRouter.default);
app.use("/api/uploads", uploadsRouter.default);

app.get("/api/categories", async (_req, res) => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const result = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    res.json(result.map((r) => r.category));
  } finally {
    await prisma.$disconnect();
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "public")));
  app.get("*", (_req, res) => {
    res.sendFile(join(__dirname, "public", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
