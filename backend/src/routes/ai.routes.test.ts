import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response } from "express";

// Mock the controllers at the top level without variables
vi.mock("../controllers/ai.controller", () => ({
  createAiProtocol: vi.fn(),
  getAiProtocols: vi.fn(),
}));

// Import the mocks after mocking
import { createAiProtocol, getAiProtocols } from "../controllers/ai.controller";
import router from "./ai.routes";

describe("AI Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations as async functions
    vi.mocked(createAiProtocol).mockImplementation(
      async (req: Request, res: Response) => {
        res.status(201).json({ message: "AI protocol created", id: "123" });
      },
    );

    vi.mocked(getAiProtocols).mockImplementation(
      async (req: Request, res: Response) => {
        res.status(200).json({ protocols: [], count: 0 });
      },
    );

    // Create express app and use the router
    app = express();
    app.use(express.json());
    app.use("/api", router);
  });

  describe("Route Configuration", () => {
    it("should have POST /aiProtocol route configured", async () => {
      const testData = {
        aiName: "GPT-4",
        usageForm: "Content generation",
        affectedParts: "Introduction",
        remarks: "Used for initial draft",
        projectId: "project-123",
      };

      await request(app).post("/api/aiProtocol").send(testData).expect(201);

      expect(createAiProtocol).toHaveBeenCalledTimes(1);
    });

    it("should have GET /aiProtocol route configured", async () => {
      await request(app).get("/api/aiProtocol").expect(200);

      expect(getAiProtocols).toHaveBeenCalledTimes(1);
    });

    it("should not have PUT /aiProtocol route", async () => {
      await request(app).put("/api/aiProtocol").expect(404);
    });
  });

  describe("POST /aiProtocol", () => {
    it("should pass request body to createAiProtocol controller", async () => {
      const protocolData = {
        aiName: "Claude",
        usageForm: "Editing",
        affectedParts: "Conclusion",
        remarks: "Improved clarity",
        projectId: "project-456",
      };

      await request(app).post("/api/aiProtocol").send(protocolData);

      expect(createAiProtocol).toHaveBeenCalledWith(
        expect.objectContaining({ body: protocolData }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should handle successful protocol creation", async () => {
      vi.mocked(createAiProtocol).mockImplementation(
        async (req: Request, res: Response) => {
          res.status(201).json({
            message: "AI protocol created successfully",
            protocol: {
              id: "ai-protocol-123",
              aiName: "GPT-4",
              projectId: "project-123",
            },
          });
        },
      );

      const response = await request(app)
        .post("/api/aiProtocol")
        .send({
          aiName: "GPT-4",
          usageForm: "Content generation",
          affectedParts: "Introduction",
          remarks: "Used for initial draft",
          projectId: "project-123",
        })
        .expect(201);

      expect(response.body).toEqual({
        message: "AI protocol created successfully",
        protocol: {
          id: "ai-protocol-123",
          aiName: "GPT-4",
          projectId: "project-123",
        },
      });
    });

    it("should handle validation errors from controller", async () => {
      vi.mocked(createAiProtocol).mockImplementation(
        async (req: Request, res: Response) => {
          res.status(400).json({
            error: "Validation failed",
            details: ["aiName is required", "projectId is required"],
          });
        },
      );

      const response = await request(app)
        .post("/api/aiProtocol")
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: "Validation failed",
        details: ["aiName is required", "projectId is required"],
      });
    });
  });

  describe("GET /aiProtocol", () => {
    it("should pass query parameters to getAiProtocols controller", async () => {
      await request(app)
        .get("/api/aiProtocol?projectId=project-123&limit=10&page=1")
        .expect(200);

      expect(getAiProtocols).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            projectId: "project-123",
            limit: "10",
            page: "1",
          },
        }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should handle successful protocols retrieval", async () => {
      const mockProtocols = [
        {
          id: "protocol-1",
          aiName: "GPT-4",
          usageForm: "Content generation",
          affectedParts: "Introduction",
          remarks: "Used for initial draft",
          projectId: "project-123",
          createdAt: "2023-01-01T00:00:00Z",
        },
      ];

      vi.mocked(getAiProtocols).mockImplementation(
        async (req: Request, res: Response) => {
          res.status(200).json({
            protocols: mockProtocols,
            count: 1,
            total: 1,
            page: 1,
            limit: 10,
          });
        },
      );

      const response = await request(app)
        .get("/api/aiProtocol?projectId=project-123")
        .expect(200);

      expect(response.body).toEqual({
        protocols: mockProtocols,
        count: 1,
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });
});
