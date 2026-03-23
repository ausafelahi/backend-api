import { queueService } from "../services/queueService.js";
import {
  registerPatientSchema,
  patientIdSchema,
} from "../validators/patientSchema.js";
import { auditService } from "../services/auditService.js";

export const patientController = {
  register: async (req, res, next) => {
    try {
      const parsed = registerPatientSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const patient = await queueService.registerPatient(parsed.data, req.log);
      res.status(201).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  },

  checkin: async (req, res, next) => {
    try {
      const parsed = patientIdSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await queueService.checkin(parsed.data.id, req.log);

      res.status(200).json({
        success: true,
        duplicate: result.duplicate,
        data: result.patient,
      });
    } catch (err) {
      next(err);
    }
  },

  getAuditByPatient: async (req, res, next) => {
    try {
      const parsed = patientIdSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const logs = await auditService.getByPatient(parsed.data.id);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  },
};
