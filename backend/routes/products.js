import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const { category, minPrice, maxPrice, search } = req.query;
  const where = {};

  if (category) where.category = category;
  if (minPrice || maxPrice) {
    where.originalPrice = {};
    if (minPrice) where.originalPrice.gte = Number(minPrice);
    if (maxPrice) where.originalPrice.lte = Number(maxPrice);
  }
  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(products);
});

router.get("/categories", async (_req, res) => {
  const result = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  res.json(result.map((r) => r.category));
});

router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

export default router;
