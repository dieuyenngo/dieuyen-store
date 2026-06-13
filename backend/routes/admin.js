import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../middleware/adminAuth.js";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAdmin);

router.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  res.json(products);
});

router.post("/products", async (req, res) => {
  const data = req.body;
  if (!data.name || !data.slug || !data.originalPrice || !data.category) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (data.barcode && !/^\d{8,13}$/.test(data.barcode)) {
    return res.status(400).json({ error: "Barcode must be 8-13 digits" });
  }
  const product = await prisma.product.create({ data });
  res.status(201).json(product);
});

router.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Product not found" });

  const product = await prisma.product.update({ where: { id }, data: req.body });
  res.json(product);
});

router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Product not found" });

  await prisma.product.delete({ where: { id } });
  res.json({ ok: true });
});

router.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { refunds: true },
  });
  res.json(orders);
});

router.put("/orders/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const valid = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Order not found" });

  const order = await prisma.order.update({ where: { id }, data: { status } });
  res.json(order);
});

router.get("/refunds", async (_req, res) => {
  const refunds = await prisma.refund.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });
  res.json(refunds);
});

router.post("/refunds", async (req, res) => {
  const { orderId, reason } = req.body;
  if (!orderId || !reason) {
    return res.status(400).json({ error: "orderId and reason required" });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const refund = await prisma.refund.create({
    data: { orderId, reason },
  });
  res.status(201).json(refund);
});

router.put("/refunds/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status, adminNotes } = req.body;
  const valid = ["APPROVED", "REJECTED"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const existing = await prisma.refund.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Refund not found" });

  const refund = await prisma.refund.update({ where: { id }, data: { status, adminNotes } });
  res.json(refund);
});

router.get("/categories", async (_req, res) => {
  const result = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  res.json(result.map((r) => r.category));
});

export default router;
