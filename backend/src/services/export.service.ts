import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export class ExportService {
  /**
   * Converts LaTeX content to DOCX using Dockerized Pandoc
   */
  static async latexToDocx(latexContent: string): Promise<Buffer> {
    let tmpDir: string | null = null;
    
    try {
      // Create temporary working directory
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "aiwa-export-"));
      const texFile = path.join(tmpDir, "document.tex");
      const docxFile = path.join(tmpDir, "document.docx");

      // Prepare LaTeX: download remote images and sanitize for Pandoc
      const { processedLatex } = await this.prepareLatexResources(
        latexContent,
        tmpDir,
      );
      const sanitizedLatex = this.sanitizeLatexForPandoc(processedLatex);

      // Write LaTeX content to file
      await fs.writeFile(texFile, sanitizedLatex);

      // Use Dockerized Pandoc with cross-platform path handling
      await this.runPandocInDocker(tmpDir);

      // Verify the output file exists and has content
      const stats = await fs.stat(docxFile);
      if (stats.size === 0) {
        throw new Error("Generated DOCX file is empty");
      }

      // Read the generated docx
      const buffer = await fs.readFile(docxFile);

      return buffer;
    } catch (error) {
      console.error("Error in latexToDocx:", error);
      throw error;
    } finally {
      // Always clean up tmp directory
      if (tmpDir) {
        await fs
          .rm(tmpDir, { recursive: true, force: true })
          .catch((e) => console.error("Error deleting tmp dir:", tmpDir, e));
      }
    }
  }

  /**
   * Run Pandoc conversion inside Docker container with cross-platform path handling
   */
  private static async runPandocInDocker(tmpDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Convert Windows paths to Docker-compatible paths
      const dockerVolumePath = this.convertPathToDockerVolume(tmpDir);
      
      // Docker command arguments
      const dockerArgs = [
        "run",
        "--rm",
        "-v",
        `${dockerVolumePath}:/workspace`,
        "pandoc-core", // Your Docker image name
        "-f",
        "latex",
        "-t",
        "docx",
        "-s",
        "--wrap=none",
        "--citeproc",
        "--number-sections",
        "--resource-path=/workspace",
        "-o",
        "/workspace/document.docx",
        "/workspace/document.tex",
      ];

      console.log("Running Docker command: docker", dockerArgs.join(" "));

      const proc = spawn("docker", dockerArgs, {
        // Use shell on Windows for better path handling
        shell: process.platform === 'win32'
      });
      
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
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
          console.log("Pandoc Docker conversion completed successfully");
          resolve();
        } else {
          console.error("Pandoc Docker conversion failed:");
          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);
          reject(new Error(`Pandoc Docker exited with code ${code}: ${stderr}`));
        }
      });
    });
  }

  /**
   * Convert Windows paths to Docker volume compatible paths
   */
  private static convertPathToDockerVolume(localPath: string): string {
    if (process.platform === 'win32') {
      // Convert Windows path like C:\Users\name\temp to //c/Users/name/temp
      const driveLetter = localPath.substring(0, 1).toLowerCase();
      const pathWithoutDrive = localPath.substring(3); // Remove "C:\"
      const unixStylePath = pathWithoutDrive.replace(/\\/g, '/');
      return `//${driveLetter}${unixStylePath}`;
    } else {
      // Unix/Mac paths work directly
      return localPath;
    }
  }

  /**
   * Alternative: Use stdin/stdout to avoid path issues entirely (most cross-platform)
   */
  private static async runPandocViaStdio(latexContent: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const dockerArgs = [
        "run",
        "--rm",
        "-i",
        "pandoc-core",
        "-f", "latex",
        "-t", "docx",
        "-s", "--wrap=none", "--citeproc", "--number-sections",
        "-o", "-",  // Output to stdout
        "-"         // Input from stdin
      ];

      const proc = spawn("docker", dockerArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const chunks: Buffer[] = [];
      
      proc.stdout.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      proc.stderr.on("data", (data: Buffer) => {
        console.error("Pandoc stderr:", data.toString());
      });

      proc.on("error", (err) => {
        reject(new Error(`Docker execution failed: ${err.message}`));
      });

      proc.on("close", (code) => {
        if (code === 0) {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            reject(new Error("Generated DOCX file is empty"));
          } else {
            resolve(buffer);
          }
        } else {
          reject(new Error(`Pandoc Docker exited with code ${code}`));
        }
      });

      // Send LaTeX content to stdin
      proc.stdin.write(latexContent);
      proc.stdin.end();
    });
  }

  /**
   * Main method using the safest approach (stdio)
   */
  static async latexToDocxSafe(latexContent: string): Promise<Buffer> {
    try {
      // Prepare LaTeX content
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "aiwa-export-"));
      const { processedLatex } = await this.prepareLatexResources(latexContent, tmpDir);
      const sanitizedLatex = this.sanitizeLatexForPandoc(processedLatex);

      // Use stdin/stdout approach which is most cross-platform
      const buffer = await this.runPandocViaStdio(sanitizedLatex);

      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true })
        .catch(e => console.error("Cleanup error:", e));

      return buffer;
    } catch (error) {
      console.error("Error in latexToDocxSafe:", error);
      throw error;
    }
  }

  private static sanitizeLatexForPandoc(content: string): string {
    return content
      .replace(/\\usepackage\{biblatex\}\s*/g, "")
      .replace(/\\addbibresource\{[^}]+\}\s*/g, "");
  }

  /**
   * This function downloads remote images referenced in \includegraphics and rewrite to local paths
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
            "Global fetch is not available; skipping remote image download.",
          );
        }
      } catch (e) {
        console.error("Error downloading image:", item.original, e);
      }
    }

    return { processedLatex: processed, downloadedFiles };
  }
}