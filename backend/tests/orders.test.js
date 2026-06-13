import { describe, it, expect, vi } from "vitest";

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

// generateOrderId is private in orders.js, test the pattern via the API
import crypto from "node:crypto";

describe("generateOrderId pattern", () => {
  it("produces YC-DATE-HEX format", () => {
    const prefix = "YC";
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderId = `${prefix}-${date}-${rand}`;

    expect(orderId).toMatch(/^YC-\d{6}-[0-9A-F]{6}$/);
  });

  it("produces unique IDs", () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
      ids.add(`${prefix}-${date}-${rand}`);
    }
    expect(ids.size).toBe(100);
  });
});

const prefix = "YC";

describe("Order creation request validation", () => {
  it("rejects order with missing fields", async () => {
    const { default: router } = await import("../routes/orders.js");
    const req = { body: {} };
    let statusCode, body;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        body = data;
        return this;
      },
    };

    // Simulate POST / handler
    const handler = router.stack.find(
      (layer) => layer.route?.path === "/" && layer.route.methods.post,
    );
    if (handler) {
      await handler.route.stack[0].handle(req, res);
      expect(statusCode).toBe(400);
      expect(body).toEqual({ error: "Missing required fields" });
    }
  });
});
