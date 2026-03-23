import { queueService } from "../services/queueService.js";
import { auditService } from "../services/auditService.js";
import { auditQuerySchema } from "../validators/queueSchema.js";
import { patientStore } from "../store/index.js";
import db from "../db/knex.js";

export const queueController = {
  getNext: async (req, res, next) => {
    try {
      const patient = await queueService.dequeueNext(req.log);
      res.status(200).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  },

  getStatus: async (req, res, next) => {
    try {
      const waiting = await patientStore.getWaiting();
      res.status(200).json({
        success: true,
        data: {
          queueLength: waiting.length,
          patients: waiting.map((p) => ({
            id: p.id,
            name: p.name,
            severity: p.severity,
            checkedInAt: p.checked_in_at,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getAudit: async (req, res, next) => {
    try {
      const parsed = auditQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const logs = await auditService.getAll(parsed.data);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  },

  flood: async (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        message: "Flood test not available in production",
      });
    }

    try {
      const results = await queueService.floodTest(req.log);
      res.status(200).json({ success: true, queued: results.length });
    } catch (err) {
      next(err);
    }
  },

  health: async (req, res, next) => {
    try {
      await db.raw("SELECT 1");
      const waiting = await patientStore.getWaiting();

      res.status(200).json({
        success: true,
        data: {
          status: "healthy",
          uptime: Math.floor(process.uptime()),
          queueDepth: waiting.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      req.log.error({ err }, "Health check failed");
      res.status(503).json({
        success: false,
        data: { status: "unhealthy", error: err.message },
      });
    }
  },
};
