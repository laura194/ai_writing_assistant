import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import type { Request, Response } from "express";
import { exportWord, exportPDF } from "./export.controller"; // Adjust import path
import { ExportService } from "../services/export.service";

// Mock the ExportService
vi.mock("../services/export.service");

describe("Export Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: Mock;
  let responseStatus: Mock;
  let responseSend: Mock;
  let responseSetHeader: Mock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup response mock
    responseJson = vi.fn();
    responseStatus = vi.fn();
    responseSend = vi.fn();
    responseSetHeader = vi.fn();

    mockResponse = {
      status: responseStatus.mockReturnThis(),
      json: responseJson.mockReturnThis(),
      send: responseSend.mockReturnThis(),
      setHeader: responseSetHeader.mockReturnThis(),
    };

    // Setup request mock
    mockRequest = {
      body: {},
    };

    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("exportWord", () => {
    it("should successfully convert LaTeX to DOCX", async () => {
      const mockBuffer = Buffer.from("fake docx content");
      const latexContent =
        "\\documentclass{article}\\begin{document}Hello\\end{document}";

      mockRequest.body = { latexContent };
      vi.mocked(ExportService.latexToDocx).mockResolvedValue(mockBuffer);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(ExportService.latexToDocx).toHaveBeenCalledWith(latexContent);
      expect(responseSetHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=document.docx",
      );
      expect(responseSetHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      expect(responseSend).toHaveBeenCalledWith(mockBuffer);
    });

    it("should return 400 if latexContent is missing", async () => {
      mockRequest.body = {};

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: "latexContent is required",
      });
      expect(ExportService.latexToDocx).not.toHaveBeenCalled();
    });

    it("should return 400 if latexContent is empty", async () => {
      mockRequest.body = { latexContent: "" };

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: "latexContent is required",
      });
    });

    it("should handle ExportService errors with 500 status", async () => {
      const error = new Error("Conversion failed");
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToDocx).mockRejectedValue(error);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: "Failed to convert document",
        details: "Conversion failed",
        stack: expect.any(String),
      });
    });

    it("should hide stack trace in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error = new Error("Conversion failed");
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToDocx).mockRejectedValue(error);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(responseJson).toHaveBeenCalledWith({
        error: "Failed to convert document",
        details: "Conversion failed",
        stack: undefined,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle non-Error objects in catch block", async () => {
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToDocx).mockRejectedValue("String error");

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: "Failed to convert document",
        details: "String error",
        stack: undefined,
      });
    });
  });

  describe("exportPDF", () => {
    it("should successfully convert LaTeX to PDF", async () => {
      const mockBuffer = Buffer.from("fake pdf content");
      const latexContent =
        "\\documentclass{article}\\begin{document}Hello\\end{document}";

      mockRequest.body = { latexContent };
      vi.mocked(ExportService.latexToPdf).mockResolvedValue(mockBuffer);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(ExportService.latexToPdf).toHaveBeenCalledWith(latexContent);
      expect(responseSetHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=document.pdf",
      );
      expect(responseSetHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf",
      );
      expect(responseSend).toHaveBeenCalledWith(mockBuffer);
    });

    it("should return 400 if latexContent is missing for PDF", async () => {
      mockRequest.body = {};

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: "latexContent is required",
      });
      expect(ExportService.latexToPdf).not.toHaveBeenCalled();
    });

    it("should return 400 if latexContent is empty for PDF", async () => {
      mockRequest.body = { latexContent: "" };

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: "latexContent is required",
      });
    });

    it("should handle ExportService errors for PDF with 500 status", async () => {
      const error = new Error("PDF conversion failed");
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToPdf).mockRejectedValue(error);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: "Failed to convert document to PDF",
        details: "PDF conversion failed",
        stack: expect.any(String),
      });
    });

    it("should hide stack trace in production for PDF", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error = new Error("PDF conversion failed");
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToPdf).mockRejectedValue(error);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(responseJson).toHaveBeenCalledWith({
        error: "Failed to convert document to PDF",
        details: "PDF conversion failed",
        stack: undefined,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle non-Error objects in PDF catch block", async () => {
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToPdf).mockRejectedValue("PDF string error");

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: "Failed to convert document to PDF",
        details: "PDF string error",
        stack: undefined,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long LaTeX content", async () => {
      const longLatex =
        "\\documentclass{article}\\begin{document}" +
        "x".repeat(10000) +
        "\\end{document}";
      const mockBuffer = Buffer.from("fake content");

      mockRequest.body = { latexContent: longLatex };
      vi.mocked(ExportService.latexToDocx).mockResolvedValue(mockBuffer);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(ExportService.latexToDocx).toHaveBeenCalledWith(longLatex);
      expect(responseSend).toHaveBeenCalledWith(mockBuffer);
    });

    it("should handle special characters in LaTeX content", async () => {
      const specialLatex =
        "\\documentclass{article}\\begin{document}Special & % $ # _ { } ~ ^ \\ \\end{document}";
      const mockBuffer = Buffer.from("fake content");

      mockRequest.body = { latexContent: specialLatex };
      vi.mocked(ExportService.latexToDocx).mockResolvedValue(mockBuffer);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(ExportService.latexToDocx).toHaveBeenCalledWith(specialLatex);
      expect(responseSend).toHaveBeenCalledWith(mockBuffer);
    });

    it("should handle empty buffer from ExportService", async () => {
      const mockBuffer = Buffer.from("");
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToDocx).mockResolvedValue(mockBuffer);

      await exportWord(mockRequest as Request, mockResponse as Response);

      // This should still work - empty buffer is valid
      expect(responseSend).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe("Logging", () => {
    it("should log appropriate messages during successful Word export", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      const mockBuffer = Buffer.from("fake docx content");
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToDocx).mockResolvedValue(mockBuffer);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Starting Word export process...",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith("LaTeX content length:", 12);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "First 100 chars:",
        "test content",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith("Converting to DOCX...");

      // Flexible assertion for buffer size
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Conversion successful, buffer size:",
        expect.any(Number),
      );

      expect(consoleLogSpy).toHaveBeenCalledWith("Sending response...");
      expect(consoleLogSpy).toHaveBeenCalledWith("Response sent successfully");
    });

    it("should log appropriate messages during successful PDF export", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      const mockBuffer = Buffer.from("fake pdf content");
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToPdf).mockResolvedValue(mockBuffer);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Starting PDF export process...",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "LaTeX content length (PDF):",
        12,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "First 100 chars (PDF):",
        "test content",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith("Converting to PDF...");

      // Flexible assertion for buffer size
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Conversion successful, buffer size (PDF):",
        expect.any(Number),
      );

      expect(consoleLogSpy).toHaveBeenCalledWith("Sending PDF response...");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "PDF response sent successfully",
      );
    });

    it("should log warnings for missing content in Word export", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      mockRequest.body = {};

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Missing LaTeX content in request",
      );
    });

    it("should log warnings for missing content in PDF export", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      mockRequest.body = {};

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Missing LaTeX content in request for PDF export",
      );
    });

    it("should log errors with details for Word export", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const error = new Error("Test error");
      error.stack = "Test stack trace";
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToDocx).mockRejectedValue(error);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error in exportWord:", {
        error,
        message: "Test error",
        stack: "Test stack trace",
      });
    });

    it("should log errors with details for PDF export", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const error = new Error("PDF conversion failed");
      error.stack = "PDF stack trace";
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToPdf).mockRejectedValue(error);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error in exportPDF:", {
        error,
        message: "PDF conversion failed",
        stack: "PDF stack trace",
      });
    });

    it("should log non-Error objects in Word export", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const stringError = "String error occurred";
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToDocx).mockRejectedValue(stringError);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error in exportWord:", {
        error: stringError,
        message: "String error occurred",
        stack: undefined,
      });
    });

    it("should log non-Error objects in PDF export", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");
      const stringError = "PDF string error";
      mockRequest.body = { latexContent: "test content" };
      vi.mocked(ExportService.latexToPdf).mockRejectedValue(stringError);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error in exportPDF:", {
        error: stringError,
        message: "PDF string error",
        stack: undefined,
      });
    });

    it("should log truncated content for very long LaTeX in Word export", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      const longContent = "x".repeat(150); // Longer than 100 chars
      const mockBuffer = Buffer.from("fake docx");

      mockRequest.body = { latexContent: longContent };
      vi.mocked(ExportService.latexToDocx).mockResolvedValue(mockBuffer);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(consoleLogSpy).toHaveBeenCalledWith("LaTeX content length:", 150);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "First 100 chars:",
        "x".repeat(100),
      );
    });

    it("should log truncated content for very long LaTeX in PDF export", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      const longContent = "y".repeat(150); // Longer than 100 chars
      const mockBuffer = Buffer.from("fake pdf");

      mockRequest.body = { latexContent: longContent };
      vi.mocked(ExportService.latexToPdf).mockResolvedValue(mockBuffer);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "LaTeX content length (PDF):",
        150,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "First 100 chars (PDF):",
        "y".repeat(100),
      );
    });

    it("should log exact content for short LaTeX in Word export", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      const shortContent = "short";
      const mockBuffer = Buffer.from("fake docx");

      mockRequest.body = { latexContent: shortContent };
      vi.mocked(ExportService.latexToDocx).mockResolvedValue(mockBuffer);

      await exportWord(mockRequest as Request, mockResponse as Response);

      expect(consoleLogSpy).toHaveBeenCalledWith("LaTeX content length:", 5);
      expect(consoleLogSpy).toHaveBeenCalledWith("First 100 chars:", "short");
    });

    it("should log exact content for short LaTeX in PDF export", async () => {
      const consoleLogSpy = vi.spyOn(console, "log");
      const shortContent = "brief";
      const mockBuffer = Buffer.from("fake pdf");

      mockRequest.body = { latexContent: shortContent };
      vi.mocked(ExportService.latexToPdf).mockResolvedValue(mockBuffer);

      await exportPDF(mockRequest as Request, mockResponse as Response);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "LaTeX content length (PDF):",
        5,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "First 100 chars (PDF):",
        "brief",
      );
    });
  });
});
