import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();
const router = Router();

function generateOrderId() {
  const prefix = "YC";
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${date}-${rand}`;
}

router.post("/", async (req, res) => {
  const { items, customerName, customerEmail, shippingAddress } = req.body;

  if (!items?.length || !customerName || !customerEmail || !shippingAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      orderId: generateOrderId(),
      items,
      total,
      customerName,
      customerEmail,
      shippingAddress,
    },
  });

  res.status(201).json(order);
});

router.get("/:orderId", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderId: req.params.orderId },
    include: { refunds: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

export default router;
