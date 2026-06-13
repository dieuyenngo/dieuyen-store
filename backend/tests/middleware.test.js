import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { requireAdmin } from "../middleware/adminAuth.js";

function mockReqRes(token) {
  const req = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  const next = () => {};
  return { req, res, next };
}

describe("requireAdmin", () => {
  const originalKey = process.env.ADMIN_API_KEY;
  beforeAll(() => {
    process.env.ADMIN_API_KEY = "test-key-123";
  });
  afterAll(() => {
    process.env.ADMIN_API_KEY = originalKey;
  });

  it("passes with valid token", () => {
    const { req, res } = mockReqRes("test-key-123");
    let called = false;
    requireAdmin(req, res, () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it("rejects request with no token", () => {
    const { req, res, next } = mockReqRes(null);
    requireAdmin(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("rejects request with wrong token", () => {
    const { req, res, next } = mockReqRes("wrong-key");
    requireAdmin(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });
});
