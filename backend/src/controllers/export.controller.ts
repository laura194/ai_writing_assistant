import { Request, Response } from "express";
import { ExportService } from "../services/export.service";

export const exportWord = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("Starting Word export process...");

    const { latexContent } = req.body;
    if (!latexContent) {
      console.warn("Missing LaTeX content in request");
      res.status(400).json({ error: "latexContent is required" });
      return;
    }

    console.log("LaTeX content length:", latexContent.length);
    console.log("First 100 chars:", latexContent.substring(0, 100));

    console.log("Converting to DOCX...");
    const buffer = await ExportService.latexToDocx(latexContent);

    console.log("Conversion successful, buffer size:", buffer.length);

    res.setHeader("Content-Disposition", "attachment; filename=document.docx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );

    console.log("Sending response...");
    res.send(buffer);
    console.log("Response sent successfully");
  } catch (error: unknown) {
    console.error("Error in exportWord:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      error: "Failed to convert document",
      details: error instanceof Error ? error.message : String(error),
      stack:
        process.env.NODE_ENV !== "production"
          ? error instanceof Error
            ? error.stack
            : undefined
          : undefined,
    });
  }
};
