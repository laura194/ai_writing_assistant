import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../app";
import Plant from "../models/Hello";

// --- Mock des Mongoose-Modells Plant ---
vi.mock("../models/Hello", () => {
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

describe("hello.controller", () => {
  it("GET /api/hello gibt eine Greeting-Message zurück", async () => {
    const res = await request(app).get("/api/hello");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
  });

  it("POST /plant speichert eine Pflanze", async () => {
    const mockSave = vi.fn().mockResolvedValue({
      _id: "123",
      name: "Rose",
      type: "Blume",
    });

    (Plant as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    const res = await request(app)
      .post("/api/hello/plant")
      .send({ name: "Rose", type: "Blume" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Rose", type: "Blume" });
    expect(mockSave).toHaveBeenCalled();
  });

  it("POST /plant mit Fehler beim Speichern gibt 400 zurück", async () => {
    const error = new Error("DB Fehler");
    const mockSave = vi.fn().mockRejectedValue(error);
    (Plant as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app)
      .post("/api/hello/plant")
      .send({ name: "Rose", type: "Blume" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Fehler beim Speichern der Pflanze",
    );
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Fehler beim Speichern der Pflanze:",
      error,
    );

    consoleErrorMock.mockRestore();
  });

  it("GET /plants gibt alle Pflanzen zurück", async () => {
    const mockPlants = [
      { _id: "1", name: "Rose", type: "Blume" },
      { _id: "2", name: "Eiche", type: "Baum" },
    ];

    (Plant.find as unknown as vi.Mock).mockResolvedValue(mockPlants);

    const res = await request(app).get("/api/hello/plants");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockPlants);
    expect(Plant.find).toHaveBeenCalled();
  });

  it("GET /plants mit Fehler beim Abrufen gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");
    (Plant.find as unknown as vi.Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).get("/api/hello/plants");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty(
      "error",
      "Fehler beim Abrufen der Pflanzen",
    );
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Fehler beim Abrufen der Pflanzen:",
      error,
    );

    consoleErrorMock.mockRestore();
  });
});
