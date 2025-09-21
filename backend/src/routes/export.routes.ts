import { Router } from "express";
import { exportWord } from "../controllers/export.controller";

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

export default router;
