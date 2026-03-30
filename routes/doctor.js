import { Router } from "express";
import { doctorController } from "../controllers/doctorController.js";
import { authenticate } from "../middleware/authenticate.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

const authLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 10 });

router.post("/signup", authLimiter, doctorController.signup);

router.post("/login", authLimiter, doctorController.login);

router.post("/:id/available", authenticate, doctorController.markAvailable);

router.delete("/:id/available", authenticate, doctorController.markUnavailable);

export default router;
