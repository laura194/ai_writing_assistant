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
      
      // Prepare LaTeX: download remote images and sanitize for Pandoc
      const { processedLatex } = await this.prepareLatexResources(latexContent, tmpDir);
      const sanitizedLatex = this.sanitizeLatexForPandoc(processedLatex);

      // Use Dockerized Pandoc following the stdin/stdout structure
      const buffer = await this.runPandocInDocker(sanitizedLatex, tmpDir);

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
        await fs.rm(tmpDir, { recursive: true, force: true })
          .catch(e => console.error("Cleanup error:", e));
      }
    }
  }

  /**
   * Run Pandoc in Docker using stdin/stdout (most cross-platform)
   */
  private static async runPandocInDocker(latexContent: string, tmpDir: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const dockerArgs = [
        "run",
        "--rm",
        "-i",
        "-v", `${tmpDir}:${tmpDir}`, // Mount the temporary directory
        "-w", tmpDir, // Set the working directory in the container
        "pandoc-core",
        "-f", "latex",
        "-t", "docx", 
        "-s",
        "--wrap=none",
        "--citeproc",
        "--number-sections",
        "-o", "-",  // Output to stdout
        "-"         // Input from stdin
      ];

      console.log("Running Docker Pandoc conversion...");

      const proc = spawn("docker", dockerArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
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
          console.log(`Pandoc conversion successful, output size: ${buffer.length} bytes`);
          resolve(buffer);
        } else {
          console.error("Pandoc Docker conversion failed:");
          console.error("STDERR:", stderr);
          reject(new Error(`Pandoc Docker exited with code ${code}: ${stderr}`));
        }
      });

      // Send LaTeX content to stdin
      proc.stdin.write(latexContent);
      proc.stdin.end();
    });
  }

  private static sanitizeLatexForPandoc(content: string): string {
    return content
      .replace(/\\usepackage\{biblatex\}\s*/g, "")
      .replace(/\\addbibresource\{[^}]+\}\s*/g, "");
  }

  /**
   * Download remote images and rewrite to local paths
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
        let ext = ".png";
        try {
          const u = new URL(url);
          const extname = path.extname(u.pathname);
          if (extname) ext = extname;
        } catch {
          // ignore invalid URL; default to .png
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
          const escapedUrl = item.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const pattern = new RegExp(
            String.raw`(\\includegraphics(?:\[[^\]]*\])?\{)` + escapedUrl + String.raw`(\})`,
            "g",
          );
          processed = processed.replace(pattern, `$1${item.localPath}$2`);
        } else {
          console.warn("Global fetch is not available; skipping remote image download.");
        }
      } catch (e) {
        console.error("Error downloading image:", item.original, e);
      }
    }

    return { processedLatex: processed, downloadedFiles };
  }
}
