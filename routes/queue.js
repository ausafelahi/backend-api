import { Router } from "express";
import { queueController } from "../controllers/queueController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/health", queueController.health);

router.get("/status", authenticate, queueController.getStatus);

router.get("/next", authenticate, queueController.getNext);

router.get("/audit", authenticate, queueController.getAudit);

router.post("/flood", queueController.flood);

export default router;
