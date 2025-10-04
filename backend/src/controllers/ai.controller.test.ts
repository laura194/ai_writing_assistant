// backend/src/controllers/aiProtocol.test.ts
import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../app"; // dein Express-App-Export
import AIProtocol from "../models/AIProtocol";

// --- Mock des Mongoose-Modells AIProtocol ---
vi.mock("../models/AIProtocol", () => {
  return {
    default: Object.assign(
      vi.fn(() => ({ save: vi.fn() })), // Konstruktor mit save()
      { find: vi.fn() }, // statische Methode
    ),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AIProtocol Controller", () => {
  it("POST /api/ai/aiProtocol speichert ein AI-Protokoll", async () => {
    const mockSave = vi.fn().mockResolvedValue({
      _id: "123",
      aiName: "GPT-5",
      usageForm: "Textgeneration",
      affectedParts: ["Kapitel 1"],
      remarks: "Test",
      projectId: "proj1",
    });

    (AIProtocol as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    const res = await request(app)
      .post("/api/ai/aiProtocol")
      .send({
        aiName: "GPT-5",
        usageForm: "Textgeneration",
        affectedParts: ["Kapitel 1"],
        remarks: "Test",
        projectId: "proj1",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      aiName: "GPT-5",
      usageForm: "Textgeneration",
      affectedParts: ["Kapitel 1"],
      remarks: "Test",
      projectId: "proj1",
    });
    expect(mockSave).toHaveBeenCalled();
  });

  it("POST /api/ai/aiProtocol ohne projectId gibt 400 zurück", async () => {
    const res = await request(app).post("/api/ai/aiProtocol").send({
      aiName: "GPT-5",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "ProjectId is required");
  });

  it("POST /api/ai/aiProtocol mit save-Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");
    const mockSave = vi.fn().mockRejectedValue(error);
    (AIProtocol as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app)
      .post("/api/ai/aiProtocol")
      .send({
        aiName: "GPT-5",
        usageForm: "Textgeneration",
        affectedParts: ["Kapitel 1"],
        remarks: "Test",
        projectId: "proj1",
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(error);

    consoleErrorMock.mockRestore();
  });

  it("GET /api/ai/aiProtocol?projectId=proj1 gibt AI-Protokolle zurück", async () => {
    const mockProtocols = [
      {
        _id: "1",
        aiName: "GPT-5",
        usageForm: "Textgeneration",
        affectedParts: ["Kapitel 1"],
        remarks: "Test",
        projectId: "proj1",
      },
    ];

    (AIProtocol.find as unknown as vi.Mock).mockResolvedValue(mockProtocols);

    const res = await request(app).get("/api/ai/aiProtocol").query({
      projectId: "proj1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProtocols);
    expect(AIProtocol.find).toHaveBeenCalledWith({ projectId: "proj1" });
  });

  it("GET /api/ai/aiProtocol ohne projectId gibt 400 zurück", async () => {
    const res = await request(app).get("/api/ai/aiProtocol");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "ProjectId is required as a query parameter",
    );
  });

  it("GET /api/ai/aiProtocol mit find-Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");
    (AIProtocol.find as unknown as vi.Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).get("/api/ai/aiProtocol").query({
      projectId: "proj1",
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(error);

    consoleErrorMock.mockRestore();
  });
});
