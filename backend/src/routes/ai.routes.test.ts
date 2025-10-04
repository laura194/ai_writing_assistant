import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import router from "./ai.routes";

// Simple inline mocks
vi.mock("../controllers/ai.controller", () => ({
  createAiProtocol: vi.fn((req, res) => res.status(201).send()),
  getAiProtocols: vi.fn((req, res) => res.status(200).send()),
}));

describe("AI Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api", router);
  });

  it("POST /aiProtocol should work", async () => {
    await request(app)
      .post("/api/aiProtocol")
      .send({ aiName: "Test", projectId: "123" })
      .expect(201);
  });

  it("GET /aiProtocol should work", async () => {
    await request(app).get("/api/aiProtocol").expect(200);
  });
});
