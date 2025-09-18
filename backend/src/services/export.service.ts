import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class ExportService {
  /**
   * This class converts LaTeX content to DOCX using Pandoc, with the following improvements:
   * - Enable citeproc for citations
   * - Download remote images referenced by \includegraphics to local tmp files
   * - Clean up all temporary files after conversion
   */
  static async latexToDocx(latexContent: string): Promise<Buffer> {
    try {
      // This creates a temporary working directory outside the project tree to avoid Vite reloads
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiwa-export-'));
      const texFile = path.join(tmpDir, 'document.tex');
      const docxFile = path.join(tmpDir, 'document.docx');

      // Prepare LaTeX: download remote images and sanitize for Pandoc.
      const { processedLatex } = await this.prepareLatexResources(latexContent, tmpDir);
      const sanitizedLatex = this.sanitizeLatexForPandoc(processedLatex);

      // Write LaTeX content to file
      await fs.writeFile(texFile, sanitizedLatex);

      // Build Pandoc args for LaTeX -> DOCX
      const args: string[] = [
        '-f', 'latex',
        '-t', 'docx',
        '-s',
        '--wrap=none',
        '--citeproc',
        '--number-sections',
        `--resource-path=${tmpDir}`,
        '-o', docxFile,
      ];

      // Invoke system pandoc directly using child_process
      await new Promise((resolve, reject) => {
        const proc = spawn('pandoc', [...args, texFile]);
        let stderr = '';
        proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
        proc.on('error', (err) => reject(err));
        proc.on('close', (code) => {
          if (code === 0) resolve(null);
          else reject(new Error(`pandoc exited with code ${code}: ${stderr}`));
        });
      });

      // Verify the output file exists and has content
      const stats = await fs.stat(docxFile);
      if (stats.size === 0) {
        throw new Error('Generated DOCX file is empty');
      }

      // Read the generated docx
      const buffer = await fs.readFile(docxFile);

      // Cleanup tmp directory recursively
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(e => console.error('Error deleting tmp dir:', tmpDir, e));

      return buffer;
    } catch (error) {
      console.error('Error in latexToDocx:', error);
      throw error;
    }
  }

  private static sanitizeLatexForPandoc(content: string): string {
    return content
      .replace(/\\usepackage\{biblatex\}\s*/g, '')
      .replace(/\\addbibresource\{[^}]+\}\s*/g, '');
  }

  /**
   * This function downloads remote images referenced in \includegraphics and rewrite to local paths,
   * and returns the processed LaTeX and a list of downloaded temp files to clean up.
   */
  private static async prepareLatexResources(content: string, tmpDir: string): Promise<{ processedLatex: string; downloadedFiles: string[] }> {
    const downloadedFiles: string[] = [];
    let processed = content;

    const includeGfxRegex = /\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g;
    const toDownload: { original: string; localPath: string }[] = [];

    // Find remote image URLs
    let match: RegExpExecArray | null;
    while ((match = includeGfxRegex.exec(content)) !== null) {
      const url = match[1];
      if (/^https?:\/\//i.test(url)) {
        let ext = '.png';
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
        if (typeof fetch === 'function') {
          const resp = await fetch(item.original);
          if (!resp.ok) {
            throw new Error(`Failed to download image ${item.original}: ${resp.status} ${resp.statusText}`);
          }
          const arrayBuffer = await resp.arrayBuffer();
          await fs.writeFile(item.localPath, Buffer.from(arrayBuffer));
          downloadedFiles.push(item.localPath);

          const escapedUrl = item.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = new RegExp(
            String.raw`(\\includegraphics(?:\[[^\]]*\])?\{)` + escapedUrl + String.raw`(\})`,
            'g'
          );
          processed = processed.replace(pattern, `$1${item.localPath}$2`);
        } else {
          console.warn('Global fetch is not available; skipping remote image download.');
        }
      } catch (e) {
        console.error('Error downloading image:', item.original, e);
      }
    }

    return { processedLatex: processed, downloadedFiles };
  }
}
