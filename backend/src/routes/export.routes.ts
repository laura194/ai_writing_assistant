import { Router } from "express";
import { exportWord, exportPDF } from "../controllers/export.controller";

const router = Router();

router.use((req, res, next) => {
  console.log("Export Route Hit:", {
    method: req.method,
    path: req.path,
    url: req.url,
  });
  next();
});

router.post("/word", exportWord);
router.post("/pdf", exportPDF);

export default router;
