import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export class ExportService {
  /**
   * Converts LaTeX content to DOCX using Dockerized Pandoc (following STDIN/STDOUT approach)
   */
  static async latexToDocx(latexContent: string): Promise<Buffer> {
    let tmpDir: string | null = null;

    try {
      // Create temporary working directory for image downloads
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "aiwa-export-"));

      // Prepare LaTeX: download remote images and rewrite paths
      const { processedLatex } = await this.prepareLatexResources(
        latexContent,
        tmpDir,
      );

      // Sanitize LaTeX for Pandoc's DOCX conversion (remove biblatex commands Pandoc handles directly)
      const sanitizedLatex = this.sanitizeLatexForPandocForDocx(processedLatex);

      // Use Dockerized Pandoc following the stdin/stdout structure
      const buffer = await this.runPandocInDocker(
        sanitizedLatex,
        tmpDir,
        "docx", // Target format
        [], // No extra args for DOCX typically
      );

      if (buffer.length === 0) {
        throw new Error("Generated DOCX file is empty");
      }

      return buffer;
    } catch (error) {
      console.error("Error in latexToDocx:", error);
      throw error;
    } finally {
      // Cleanup tmp directory
      if (tmpDir) {
        await fs
          .rm(tmpDir, { recursive: true, force: true })
          .catch((cleanupError) =>
            console.error("Cleanup error in latexToDocx:", cleanupError),
          );
      }
    }
  }

  /**
   * Converts LaTeX content to PDF using Dockerized Pandoc.
   */
  static async latexToPdf(latexContent: string): Promise<Buffer> {
    let tmpDir: string | null = null;

    try {
      // Create temporary working directory for image downloads
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "aiwa-export-"));

      // Prepare LaTeX: download remote images and rewrite paths
      const { processedLatex } = await this.prepareLatexResources(
        latexContent,
        tmpDir,
      );

      // Create a dummy references.bib file, as biblatex is used in content
      await this.createReferencesBib(tmpDir);

      // Pandoc will use `--pdf-engine` to invoke xelatex, which will process biblatex.
      const buffer = await this.runPandocInDocker(
        processedLatex, // Use processedLatex directly for PDF
        tmpDir,
        "pdf", // Target format
        ["--pdf-engine=xelatex"], // Specific engine for PDF
      );

      if (buffer.length === 0) {
        throw new Error("Generated PDF file is empty");
      }

      return buffer;
    } catch (error) {
      console.error("Error in latexToPdf:", error);
      throw error;
    } finally {
      // Cleanup tmp directory
      if (tmpDir) {
        await fs
          .rm(tmpDir, { recursive: true, force: true })
          .catch((cleanupError) =>
            console.error("Cleanup error in latexToPdf:", cleanupError),
          );
      }
    }
  }

  // Helper function to normalize Windows paths for Docker
  private static normalizePathForDocker(filePath: string): string {
    if (os.platform() === "win32") {
      // Convert Windows backslashes to forward slashes
      let dockerPath = filePath.replace(/\\/g, "/");
      // If it's a drive letter path (e.g., C:/...)
      if (dockerPath.match(/^[a-zA-Z]:\//)) {
        // Convert C:/Users to /c/Users
        dockerPath = `/${dockerPath.charAt(0).toLowerCase()}${dockerPath.substring(2)}`;
      }
      return dockerPath;
    }
    return filePath; // macOS/Linux paths are fine as is
  }

  /**
   * Run Pandoc in Docker using stdin/stdout.
   */
  private static async runPandocInDocker(
    latexContent: string,
    tmpDir: string,
    outputFormat: "docx" | "pdf",
    extraArgs: string[] = [],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pandocBaseArgs = [
        "-f",
        "latex",
        `-t`,
        outputFormat,
        "-s", // standalone document
        "--wrap=none",
        "--citeproc", // Enable bibliography processing (requires biblatex and biber installed in pandoc-core)
        "--number-sections",
        ...extraArgs, // Add format-specific arguments
        "-o",
        "-", // Output to stdout
        "-", // Input from stdin
      ];

      const dockerArgs = [
        "run",
        "--rm",
        "-i", // Interactive, so stdin is available
        "-v",
        `${ExportService.normalizePathForDocker(tmpDir)}:${tmpDir}`, // Use normalized path here
        //`${tmpDir}:${tmpDir}`, // Mount the temporary directory, not working on Windows without path normalization
        "-w",
        tmpDir, // Set the working directory in the container
        "pandoc-core", // Your custom Pandoc image name
        ...pandocBaseArgs,
      ];

      console.log(
        `Running Docker Pandoc conversion for ${outputFormat} with args:`,
        dockerArgs.join(" "),
      );

      const proc = spawn("docker", dockerArgs, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      const chunks: Buffer[] = [];
      let stderr = "";

      proc.stdout.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      proc.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on("error", (err) => {
        console.error("Docker spawn error:", err);
        reject(new Error(`Docker execution failed: ${err.message}`));
      });

      proc.on("close", (code) => {
        if (code === 0) {
          const buffer = Buffer.concat(chunks);
          console.log(
            `Pandoc ${outputFormat} conversion successful, output size: ${buffer.length} bytes`,
          );
          resolve(buffer);
        } else {
          console.error(`Pandoc Docker ${outputFormat} conversion failed:`);
          console.error("STDERR:", stderr);
          reject(
            new Error(
              `Pandoc Docker exited with code ${code} for ${outputFormat}: ${stderr}`,
            ),
          );
        }
      });

      // Send LaTeX content to stdin
      proc.stdin.write(latexContent);
      proc.stdin.end();
    });
  }

  /**
   * Writes a dummy references.bib file into the temporary directory.
   * In a real application, this would fetch/generate actual citation data.
   */
  private static async createReferencesBib(tmpDir: string): Promise<void> {
    const bibContent = `% This is a dummy references.bib file.
@article{example,\n  author={Author, A.},\n  title={Example Title},\n  journal={Example Journal},\n  year={2023}\n}`;
    const bibFilePath = path.join(tmpDir, `references.bib`);
    await fs.writeFile(bibFilePath, bibContent);
  }

  /**
   * Sanitizes LaTeX content specifically for Pandoc's DOCX conversion.
   * Pandoc directly handles bibliography via --citeproc, so biblatex commands
   * are removed to prevent conflicts or errors.
   */
  private static sanitizeLatexForPandocForDocx(content: string): string {
    // Remove biblatex package and resource commands as Pandoc's citeproc handles it differently for DOCX
    return content
      .replace(/\\usepackage\{biblatex\}\s*/g, "")
      .replace(/\\addbibresource\{[^}]+\}\s*/g, "");
  }

  /**
   * Download remote images and rewrite to local paths within the temporary directory.
   */
  private static async prepareLatexResources(
    content: string,
    tmpDir: string,
  ): Promise<{ processedLatex: string; downloadedFiles: string[] }> {
    const downloadedFiles: string[] = [];
    let processed = content;

    const includeGfxRegex = /\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g;
    const toDownload: { original: string; localPath: string }[] = [];

    // Find remote image URLs
    let match: RegExpExecArray | null;
    while ((match = includeGfxRegex.exec(content)) !== null) {
      const url = match[1];
      if (/^https?:\/\//i.test(url)) {
        let ext = ".png"; // Default extension
        try {
          const u = new URL(url);
          const extname = path.extname(u.pathname);
          if (extname) ext = extname;
        } catch (urlError) {
          // Fallback to .png if URL is invalid
          console.warn(
            `Invalid URL for image, defaulting to .png: ${url}. Error: ${urlError}`,
          );
          // Do not attempt to download an invalid URL
          continue;
        }
        const filename = `img_${toDownload.length + 1}${ext}`;
        const localPath = path.join(tmpDir, filename);
        toDownload.push({ original: url, localPath });
      }
    }

    for (const item of toDownload) {
      try {
        if (typeof fetch === "function") {
          const resp = await fetch(item.original);
          if (!resp.ok) {
            throw new Error(
              `Failed to download image ${item.original}: ${resp.status} ${resp.statusText}`,
            );
          }
          const arrayBuffer = await resp.arrayBuffer();
          await fs.writeFile(item.localPath, Buffer.from(arrayBuffer));
          downloadedFiles.push(item.localPath);

          // Replace URL with local path in LaTeX content
          const escapedUrl = item.original.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const pattern = new RegExp(
            String.raw`(\\includegraphics(?:\[[^\]]*\])?\{)` +
              escapedUrl +
              String.raw`(\})`,
            "g",
          );
          processed = processed.replace(pattern, `$1${item.localPath}$2`);
        } else {
          console.warn(
            "Global fetch is not available; skipping remote image download. Ensure Node.js version >= 18 or a fetch polyfill is used.",
          );
        }
      } catch (downloadError) {
        console.error("Error downloading image:", item.original, downloadError);
      }
    }

    return { processedLatex: processed, downloadedFiles };
  }
}
