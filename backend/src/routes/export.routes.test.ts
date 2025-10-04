import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import router from "./export.routes"; // Adjust import path

describe("Export Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the controllers directly
    vi.mock("../controllers/export.controller", () => ({
      exportWord: vi.fn((req, res) => res.status(200).send("word")),
      exportPDF: vi.fn((req, res) => res.status(200).send("pdf")),
    }));

    // Mock console.log
    vi.spyOn(console, "log").mockImplementation(() => {});

    app = express();
    app.use(express.json());
    app.use("/api/export", router);
  });

  it("should handle POST /word", async () => {
    const response = await request(app)
      .post("/api/export/word")
      .send({ latexContent: "test" });

    expect(response.status).toBe(200);
  });

  it("should handle POST /pdf", async () => {
    const response = await request(app)
      .post("/api/export/pdf")
      .send({ latexContent: "test" });

    expect(response.status).toBe(200);
  });

  it("should log route access", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    await request(app).post("/api/export/word");

    expect(consoleSpy).toHaveBeenCalledWith("Export Route Hit:", {
      method: "POST",
      path: "/word",
      url: "/word",
    });
  });
});
