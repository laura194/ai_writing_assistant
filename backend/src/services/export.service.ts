import pandoc from 'pandoc';
import fs from 'fs/promises';
import path from 'path';

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

      // Use the pandoc npm package directly
      await new Promise((resolve, reject) => {
        pandoc(texFile, [
          '-f', 'latex',
          '-t', 'docx',
          '-s',
          '--pdf-engine=xelatex',
          '--wrap=none',
          '-o', docxFile
        ], (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        });
      });

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