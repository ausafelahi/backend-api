import { queueService } from "../services/queueService.js";
import { authService } from "../services/authService.js";
import { auditService, AuditEvents } from "../services/auditService.js";
import { doctorStore } from "../store/index.js";
import {
  doctorSignupSchema,
  doctorLoginSchema,
  doctorIdSchema,
} from "../validators/doctorSchema.js";
import { Errors } from "../utils/AppError.js";

export const doctorController = {
  signup: async (req, res, next) => {
    try {
      const parsed = doctorSignupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await authService.signup(parsed.data, req.log);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const parsed = doctorLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await authService.login(parsed.data, req.log);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  markAvailable: async (req, res, next) => {
    try {
      const parsed = doctorIdSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const { id } = parsed.data;
      if (req.user.id !== id)
        throw Errors.forbidden("You can only update your own availability");
      await doctorStore.update(id, {
        available: true,
        current_patient_id: null,
      });
      await auditService.log(AuditEvents.DOCTOR_AVAILABLE, {
        doctorId: id,
        logger: req.log,
      });
      const assignment = await queueService.assignToDoctor(id, req.log);
      res
        .status(200)
        .json({
          success: true,
          data: { available: true, assignedPatient: assignment || null },
        });
    } catch (err) {
      next(err);
    }
  },

  markUnavailable: async (req, res, next) => {
    try {
      const parsed = doctorIdSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const { id } = parsed.data;
      if (req.user.id !== id)
        throw Errors.forbidden("You can only update your own availability");
      await doctorStore.update(id, { available: false });
      await auditService.log(AuditEvents.DOCTOR_UNAVAILABLE, {
        doctorId: id,
        logger: req.log,
      });
      req.log.info({ doctorId: id }, "Doctor marked unavailable");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
