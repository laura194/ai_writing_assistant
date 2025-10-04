/// <reference types="vitest" />

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
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

  constructor() {
    super();
    this.stdout = new Readable({ read() {} });
    this.stderr = new Readable({ read() {} });
    this.stdin = new Writable({ write() {} });
  }
}

describe("ExportService", () => {
  let mockProcess: MockProcess;

  beforeEach(() => {
    // Mock os
    (os.tmpdir as vi.Mock).mockReturnValue("/tmp");

    // Mock fs
    (fs.mkdtemp as vi.Mock).mockResolvedValue("/tmp/aiwa-export-123");
    (fs.rm as vi.Mock).mockResolvedValue(undefined);
    (fs.writeFile as vi.Mock).mockResolvedValue(undefined);

    // Mock child_process
    mockProcess = new MockProcess();
    (spawn as vi.Mock).mockReturnValue(mockProcess);

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

      // Simulate the process running and emitting data
      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null); // End of stdout stream
      mockProcess.emit("close", 0);

      const result = await promise;

      expect(result).toEqual(Buffer.from("fake docx"));
      expect(fs.rm).toHaveBeenCalledWith("/tmp/aiwa-export-123", {
        recursive: true,
        force: true,
      });
    });

    it("should throw an error if pandoc conversion fails", async () => {
      const promise = ExportService.latexToDocx("...");

      // Simulate the process failing
      mockProcess.stderr.push("Conversion failed");
      mockProcess.stderr.push(null);
      mockProcess.emit("close", 1);

      await expect(promise).rejects.toThrow(
        "Pandoc Docker exited with code 1: Conversion failed",
      );
      expect(fs.rm).toHaveBeenCalled();
    });

    it("should throw an error if docker spawn fails", async () => {
      const spawnError = new Error("Docker not found");
      const promise = ExportService.latexToDocx("...");

      // Simulate a spawn error
      mockProcess.emit("error", spawnError);

      await expect(promise).rejects.toThrow(
        `Docker execution failed: ${spawnError.message}`,
      );
      expect(fs.rm).toHaveBeenCalled();
    });

    it("should download remote images and rewrite paths", async () => {
      const latexWithImage = "\\includegraphics{https://example.com/image.png}";
      const fakeImageBuffer = Buffer.from("fake image data");
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(fakeImageBuffer.buffer),
      });

      const promise = ExportService.latexToDocx(latexWithImage);

      // Simulate success after setup
      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      await promise;

      expect(global.fetch).toHaveBeenCalledWith("https://example.com/image.png");
      expect(fs.writeFile).toHaveBeenCalledWith(
        "/tmp/aiwa-export-123/img_1.png",
        fakeImageBuffer,
      );
    });

    it("should sanitize biblatex commands", async () => {
      const latexWithBib =
        "\\usepackage{biblatex}\\addbibresource{refs.bib}";
      const promise = ExportService.latexToDocx(latexWithBib);

      // Spy on stdin before simulating completion
      const stdinSpy = vi.spyOn(mockProcess.stdin, "write");

      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      await promise;

      const writtenLatex = stdinSpy.mock.calls[0][0];
      expect(writtenLatex).not.toContain("biblatex");
      expect(writtenLatex).not.toContain("addbibresource");
    });

    it("should throw an error for empty output buffer", async () => {
      const promise = ExportService.latexToDocx("...");

      // Simulate empty output
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      await expect(promise).rejects.toThrow("Generated DOCX file is empty");
    });

    it("should handle image download failure gracefully", async () => {
      const latexWithImage = "\\includegraphics{https://example.com/image.png}";
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const promise = ExportService.latexToDocx(latexWithImage);
      const stdinSpy = vi.spyOn(mockProcess.stdin, "write");

      // Simulate success
      mockProcess.stdout.push(Buffer.from("fake docx"));
      mockProcess.stdout.push(null);
      mockProcess.emit("close", 0);

      await promise;

      // Should still attempt conversion, just without the downloaded image
      expect(stdinSpy.mock.calls[0][0]).not.toContain(
        "/tmp/aiwa-export-123/img_1.png",
      );
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});