import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { Express } from "express";

// Mock the controllers
vi.mock("../controllers/export.controller", () => ({
  exportWord: vi.fn((req, res) => {
    res.status(200).json({ message: "Word export successful" });
  }),
  exportPDF: vi.fn((req, res) => {
    res.status(200).json({ message: "PDF export successful" });
  }),
}));

describe("Export Routes", () => {
  let app: Express;
  let exportRouter: any;
  let exportWord: any;
  let exportPDF: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import mocked controllers
    const controllers = await import("../controllers/export.controller");
    exportWord = controllers.exportWord;
    exportPDF = controllers.exportPDF;

    // Import router
    const routerModule = await import("./export.routes");
    exportRouter = routerModule.default;

    // Create fresh Express app
    app = express();
    app.use(express.json());
    app.use("/api/export", exportRouter);
  });

  describe("Middleware Logging", () => {
    it("sollte Request-Details loggen für /word Route", async () => {
      const consoleLogMock = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await request(app).post("/api/export/word").send({});

      expect(consoleLogMock).toHaveBeenCalledWith("Export Route Hit:", {
        method: "POST",
        path: "/word",
        url: "/word",
      });

      consoleLogMock.mockRestore();
    });

    it("sollte Request-Details loggen für /pdf Route", async () => {
      const consoleLogMock = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await request(app).post("/api/export/pdf").send({});

      expect(consoleLogMock).toHaveBeenCalledWith("Export Route Hit:", {
        method: "POST",
        path: "/pdf",
        url: "/pdf",
      });

      consoleLogMock.mockRestore();
    });
  });

  describe("POST /word", () => {
    it("sollte exportWord Controller aufrufen", async () => {
      const response = await request(app)
        .post("/api/export/word")
        .send({ data: "test" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Word export successful" });
      expect(exportWord).toHaveBeenCalledTimes(1);
    });

    it("sollte mit Request Body funktionieren", async () => {
      const testData = { content: "test content", title: "Test Document" };

      await request(app).post("/api/export/word").send(testData);

      expect(exportWord).toHaveBeenCalledTimes(1);
      const callArgs = exportWord.mock.calls[0];
      expect(callArgs[0].body).toEqual(testData);
    });
  });

  describe("POST /pdf", () => {
    it("sollte exportPDF Controller aufrufen", async () => {
      const response = await request(app)
        .post("/api/export/pdf")
        .send({ data: "test" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "PDF export successful" });
      expect(exportPDF).toHaveBeenCalledTimes(1);
    });

    it("sollte mit Request Body funktionieren", async () => {
      const testData = { content: "test content", format: "A4" };

      await request(app).post("/api/export/pdf").send(testData);

      expect(exportPDF).toHaveBeenCalledTimes(1);
      const callArgs = exportPDF.mock.calls[0];
      expect(callArgs[0].body).toEqual(testData);
    });
  });

  describe("Route Integration", () => {
    it("sollte beide Routes nacheinander verarbeiten können", async () => {
      const consoleLogMock = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await request(app).post("/api/export/word").send({});
      await request(app).post("/api/export/pdf").send({});

      expect(consoleLogMock).toHaveBeenCalledTimes(2);
      expect(exportWord).toHaveBeenCalledTimes(1);
      expect(exportPDF).toHaveBeenCalledTimes(1);

      consoleLogMock.mockRestore();
    });

    it("sollte nicht existierende Routes mit 404 behandeln", async () => {
      const response = await request(app).post("/api/export/invalid").send({});

      expect(response.status).toBe(404);
      expect(exportWord).not.toHaveBeenCalled();
      expect(exportPDF).not.toHaveBeenCalled();
    });

    it("sollte GET Requests nicht unterstützen", async () => {
      const wordResponse = await request(app).get("/api/export/word");
      const pdfResponse = await request(app).get("/api/export/pdf");

      expect(wordResponse.status).toBe(404);
      expect(pdfResponse.status).toBe(404);
      expect(exportWord).not.toHaveBeenCalled();
      expect(exportPDF).not.toHaveBeenCalled();
    });
  });

  describe("Middleware Next Function", () => {
    it("sollte next() aufrufen und Request weitergeben", async () => {
      const consoleLogMock = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const response = await request(app).post("/api/export/word").send({});

      // Middleware wurde ausgeführt (logged)
      expect(consoleLogMock).toHaveBeenCalled();
      // Controller wurde erreicht
      expect(exportWord).toHaveBeenCalled();
      // Response wurde gesendet
      expect(response.status).toBe(200);

      consoleLogMock.mockRestore();
    });
  });
});
