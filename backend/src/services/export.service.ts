import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export class ExportService {
  static async latexToDocx(latexContent: string): Promise<Buffer> {
    const tmpDir = path.join(__dirname, '../tmp');
    const texFile = path.join(tmpDir, 'document.tex');
    const docxFile = path.join(tmpDir, 'document.docx');

    try {
      // Ensure tmp directory exists
      await fs.mkdir(tmpDir, { recursive: true });

      // Write LaTeX content to file
      await fs.writeFile(texFile, latexContent);

      // Use pandoc 3.8 features:
      // --pdf-engine=xelatex for better Unicode support
      // --wrap=none to prevent line wrapping
      // --reference-doc for Word styling (optional)
      const { stderr } = await execAsync(
        `pandoc "${texFile}" -f latex -t docx -s \
         --pdf-engine=xelatex \
         --wrap=none \
         -o "${docxFile}"`
      );

      if (stderr) {
        console.error('Pandoc stderr:', stderr);
      }

      // Verify the output file exists and has content
      const stats = await fs.stat(docxFile);
      if (stats.size === 0) {
        throw new Error('Generated DOCX file is empty');
      }

      // Read the generated docx
      const buffer = await fs.readFile(docxFile);

      // Cleanup
      await Promise.all([
        fs.unlink(texFile).catch(e => console.error('Error deleting tex file:', e)),
        fs.unlink(docxFile).catch(e => console.error('Error deleting docx file:', e))
      ]);

      return buffer;
    } catch (error) {
      console.error('Error in latexToDocx:', error);
      throw error;
    }
  }
}