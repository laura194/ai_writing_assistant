/// <reference types="vitest" />

import { vi, describe, it, expect, beforeEach, afterEach, type Mock } from "vitest";
import { ExportService } from "./export.service";
import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import { EventEmitter } from "events";
import { Writable, Readable } from "stream";

// Mock dependencies
vi.mock("child_process");
vi.mock("fs/promises");
vi.mock("os");

class MockProcess extends EventEmitter {
  stdout: Readable;
  stderr: Readable;
  stdin: Writable;
  killed: boolean = false;
  stdinWriteCalls: any[] = [];

  constructor() {
    super();
    this.stdout = new Readable({ read() {} });
    this.stderr = new Readable({ read() {} });
    
    // Capture all writes to stdin
    this.stdin = new Writable({ 
      write: (chunk: any, _encoding: string, callback: () => void) => {
        this.stdinWriteCalls.push(chunk.toString());
        callback();
      }
    });
  }

  kill() {
    this.killed = true;
  }

  getStdinContent(): string {
    return this.stdinWriteCalls.join('');
  }
}

describe("ExportService", () => {
  let mockProcess: MockProcess;

  beforeEach(() => {
    // Mock os
    (os.tmpdir as Mock).mockReturnValue("/tmp");

    // Mock fs
    (fs.mkdtemp as Mock).mockResolvedValue("/tmp/aiwa-export-123");
    (fs.rm as Mock).mockResolvedValue(undefined);
    (fs.writeFile as Mock).mockResolvedValue(undefined);

    // Mock child_process - capture the mock process immediately
    mockProcess = new MockProcess();
    (spawn as Mock).mockReturnValue(mockProcess);

    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("latexToDocx", () => {
    it("should convert LaTeX to DOCX successfully", async () => {
      const promise = ExportService.latexToDocx(
        "\\documentclass{article}\\begin{document}Hello\\end{document}",
      );

      // Wait for the next tick to ensure processing starts
      await new Promise(resolve => process.nextTick(resolve));

      // Simulate the process running and emitting data
      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      const result = await promise;

      expect(result).toEqual(Buffer.from("fake docx"));
      expect(fs.rm).toHaveBeenCalledWith("/tmp/aiwa-export-123", {
        recursive: true,
        force: true,
      });
      
      // Check that LaTeX was written to stdin
      expect(mockProcess.stdinWriteCalls.length).toBeGreaterThan(0);
    });

    it("should throw an error if pandoc conversion fails", async () => {
      const promise = ExportService.latexToDocx("...");

      await new Promise(resolve => process.nextTick(resolve));

      // Simulate the process failing
      mockProcess.stderr.emit('data', Buffer.from("Conversion failed"));
      mockProcess.stderr.emit('end');
      mockProcess.emit("close", 1);

      await expect(promise).rejects.toThrow(
        "Pandoc Docker exited with code 1: Conversion failed",
      );
      expect(fs.rm).toHaveBeenCalled();
    });

    it("should throw an error if docker spawn fails", async () => {
      const spawnError = new Error("Docker not found");
      (spawn as Mock).mockImplementation(() => {
        throw spawnError;
      });

      await expect(ExportService.latexToDocx("...")).rejects.toThrow(
        `Docker not found`,
      );
    });

    it("should download remote images and rewrite paths", async () => {
      const latexWithImage = "\\includegraphics{https://example.com/image.png}";
      const fakeImageBuffer = Buffer.from("fake image data");
      
      // Mock fetch to resolve immediately with a proper ArrayBuffer
      const mockArrayBuffer = fakeImageBuffer.buffer;
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      const promise = ExportService.latexToDocx(latexWithImage);

      // Wait for all async operations to complete - including image downloads
      // Use multiple event loop cycles to ensure all promises resolve
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setImmediate(resolve));

      // Simulate success
      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      const result = await promise;

      expect(result).toEqual(Buffer.from("fake docx"));
      expect(global.fetch).toHaveBeenCalledWith("https://example.com/image.png");
      
      // Check if writeFile was called for the downloaded image
      // The image should be downloaded and saved to the temp directory
      expect(fs.writeFile).toHaveBeenCalledWith(
        "/tmp/aiwa-export-123/img_1.png",
        expect.any(Buffer),
      );

      // Verify the LaTeX was rewritten with local image path
      const writtenLatex = mockProcess.getStdinContent();
      expect(writtenLatex).toContain("/tmp/aiwa-export-123/img_1.png");
    });

    it("should sanitize biblatex commands", async () => {
      const latexWithBib = "\\usepackage{biblatex}\\addbibresource{refs.bib}";
      
      const promise = ExportService.latexToDocx(latexWithBib);

      // Wait for processing
      await new Promise(resolve => setImmediate(resolve));

      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      await promise;

      // Check the processed LaTeX content
      const writtenLatex = mockProcess.getStdinContent();
      expect(writtenLatex).not.toContain("biblatex");
      expect(writtenLatex).not.toContain("addbibresource");
    });

    it("should throw an error for empty output buffer", async () => {
      const promise = ExportService.latexToDocx("...");

      await new Promise(resolve => process.nextTick(resolve));

      // Simulate empty output
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      await expect(promise).rejects.toThrow("Generated DOCX file is empty");
    });

    it("should handle image download failure gracefully", async () => {
      const latexWithImage = "\\includegraphics{https://example.com/image.png}";
      
      // Mock fetch to fail
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const promise = ExportService.latexToDocx(latexWithImage);

      // Wait for the image download attempt
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setImmediate(resolve));

      // Simulate success
      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      await promise;

      // The image download should have been attempted but failed
      expect(global.fetch).toHaveBeenCalledWith("https://example.com/image.png");
      
      // File should not be written since download failed
      expect(fs.writeFile).not.toHaveBeenCalledWith(
        "/tmp/aiwa-export-123/img_1.png",
        expect.anything(),
      );

      // Check what was written to stdin
      const writtenLatex = mockProcess.getStdinContent();
      
      // The image path should not be rewritten since download failed
      expect(writtenLatex).not.toContain("/tmp/aiwa-export-123/img_1.png");
      // The original URL should remain (or be handled according to implementation)
      expect(writtenLatex).toContain("https://example.com/image.png");
    });
  });
});
