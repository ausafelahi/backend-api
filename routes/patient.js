import { Router } from "express";
import { patientController } from "../controllers/patientController.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

const registerLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

router.post("/", registerLimiter, patientController.register);

router.post("/:id/checkin", patientController.checkin);

router.get("/:id/audit", patientController.getAuditByPatient);

export default router;
