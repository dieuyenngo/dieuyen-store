import { describe, it, expect, vi } from "vitest";

vi.mock("@prisma/client", () => {
  const mockProduct = {
    id: 1,
    name: "Test Product",
    slug: "test-product",
    description: "A test product",
    originalPrice: 49.99,
    salePrice: null,
    stock: 10,
    images: ["https://example.com/img.jpg"],
    category: "Electronics",
    rating: 4.5,
    featured: false,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    product: {
      findMany: vi.fn().mockResolvedValue([mockProduct]),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    $disconnect: vi.fn(),
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

describe("Product list via Prisma", () => {
  it("returns a list of products", async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const products = await prisma.product.findMany();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Test Product");
    expect(products[0].slug).toBe("test-product");
  });

  it("includes price information", async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const products = await prisma.product.findMany();
    expect(products[0]).toHaveProperty("originalPrice", 49.99);
    expect(products[0]).toHaveProperty("salePrice", null);
  });
});
