import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../app";
import NodeContent from "../models/NodeContent";

// --- Mongoose-Model mocken ---
vi.mock("../models/NodeContent", () => {
  return {
    default: Object.assign(
      vi.fn(() => ({ save: vi.fn() })), // Konstruktor mit save()
      {
        find: vi.fn(),
        findOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
      }
    ),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NodeContent Controller", () => {
  // --- CREATE ---
  it("POST /api/nodeContent erstellt NodeContent", async () => {
    const mockSave = vi.fn().mockResolvedValue({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      content: "Content",
      projectId: "proj1",
    });

    (NodeContent as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    const res = await request(app).post("/api/nodeContent").send({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      content: "Content",
      projectId: "proj1",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      content: "Content",
      projectId: "proj1",
    });
    expect(mockSave).toHaveBeenCalled();
  });

  it("POST /api/nodeContent ohne content gibt 400", async () => {
    const res = await request(app).post("/api/nodeContent").send({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      projectId: "proj1",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Content cannot be empty");
  });

  it("POST /api/nodeContent ohne alle Felder gibt 400", async () => {
    const res = await request(app).post("/api/nodeContent").send({
      content: "Text",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "All fields are required");
  });

  it("POST /api/nodeContent mit bestehenden NodeContent gibt 409", async () => {
    const existing = { nodeId: "node1", projectId: "proj1" };
    (NodeContent.findOne as unknown as vi.Mock).mockResolvedValue(existing);

    const res = await request(app).post("/api/nodeContent").send({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      content: "Text",
      projectId: "proj1",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
    expect(res.body.existing).toEqual(existing);
  });

  it("POST /api/nodeContent Fehler beim Speichern gibt 500", async () => {
    const error = new Error("DB Fehler");
  
    // findOne gibt null zurück, damit save() aufgerufen wird
    (NodeContent.findOne as unknown as vi.Mock).mockResolvedValue(null);
  
    const mockSave = vi.fn().mockRejectedValue(error);
    (NodeContent as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));
  
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
  
    const res = await request(app).post("/api/nodeContent").send({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      content: "Text",
      projectId: "proj1",
    });
  
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error saving node content:",
      error
    );
  
    consoleErrorMock.mockRestore();
  });
  

  // --- GET ALL / FILTER ---
  it("GET /api/nodeContent gibt alle Inhalte zurück", async () => {
    const mockContents = [{ nodeId: "node1", content: "Text", projectId: "proj1" }];
    (NodeContent.find as unknown as vi.Mock).mockResolvedValue(mockContents);

    const res = await request(app).get("/api/nodeContent").query({ projectId: "proj1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockContents);
    expect(NodeContent.find).toHaveBeenCalledWith({ projectId: "proj1" });
  });

  it("GET /api/nodeContent Fehler beim Abrufen gibt 500", async () => {
    const error = new Error("DB Fehler");
    (NodeContent.find as unknown as vi.Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).get("/api/nodeContent");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching node contents:",
      error
    );

    consoleErrorMock.mockRestore();
  });

  // --- GET BY ID ---
  it("GET /api/nodeContent/:id ohne projectId gibt 400", async () => {
    const res = await request(app).get("/api/nodeContent/node1");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "projectId is required");
  });

  it("GET /api/nodeContent/:id nicht gefunden gibt 404", async () => {
    (NodeContent.findOne as unknown as vi.Mock).mockResolvedValue(null);

    const res = await request(app).get("/api/nodeContent/node1").query({ projectId: "proj1" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("GET /api/nodeContent/:id Fehler beim Abrufen gibt 500", async () => {
    const error = new Error("DB Fehler");
    (NodeContent.findOne as unknown as vi.Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).get("/api/nodeContent/node1").query({ projectId: "proj1" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching node content by ID:",
      error
    );

    consoleErrorMock.mockRestore();
  });

  // --- UPDATE ---
  it("PUT /api/nodeContent/:id ohne content gibt 400", async () => {
    const res = await request(app).put("/api/nodeContent/node1").send({
      name: "Updated",
      category: "Cat",
      projectId: "proj1",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Content cannot be empty");
  });

  it("PUT /api/nodeContent/:id ohne alle Felder gibt 400", async () => {
    const res = await request(app).put("/api/nodeContent/node1").send({
      content: "Text",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "All fields are required");
  });

  it("PUT /api/nodeContent/:id nicht gefunden gibt 404", async () => {
    (NodeContent.findOneAndUpdate as unknown as vi.Mock).mockResolvedValue(null);

    const res = await request(app).put("/api/nodeContent/node1").send({
      name: "Updated",
      category: "Cat",
      content: "New Content",
      projectId: "proj1",
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "NodeContent not found");
  });

  it("PUT /api/nodeContent/:id Fehler beim Aktualisieren gibt 500", async () => {
    const error = new Error("DB Fehler");
    (NodeContent.findOneAndUpdate as unknown as vi.Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).put("/api/nodeContent/node1").send({
      name: "Updated",
      category: "Cat",
      content: "New Content",
      projectId: "proj1",
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error updating node content:",
      error
    );

    consoleErrorMock.mockRestore();
  });
});
