import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { doctorStore, registrationStore } from "../store/index.js";
import logger from "../log/logger.js";

const SALT_ROUNDS = 10;

export const authService = {
  signup: async (
    { name, email, password, specialization, registrationNumber },
    logger,
  ) => {
    const regEntry = await registrationStore.findByNumber(registrationNumber);
    if (!regEntry) {
      logger.warn(
        { registrationNumber },
        "Signup with unrecognized registration number",
      );
      AppError.badRequest(
        "Registration number not found in the PMDC registry. Contact support if you believe this is an error.",
      );
    }

    if (regEntry.used) {
      logger.warn(
        { registrationNumber },
        "Signup with already-used registration number",
      );
      AppError.conflict(
        "This registration number is already associated with an account.",
      );
    }

    const existing = await doctorStore.findByEmail(email);
    if (existing) {
      logger.warn({ email }, "Signup with duplicate email");
      AppError.conflict("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const doctor = await doctorStore.create({
      name,
      email,
      password_hash: passwordHash,
      specialization,
      registration_number: registrationNumber,
      available: false,
    });

    await registrationStore.markUsed(registrationNumber, doctor.id);

    logger.info(
      { doctorId: doctor.id, registrationNumber },
      "New doctor registered",
    );

    const token = jwt.sign(
      { id: doctor.id, name: doctor.name, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    return {
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        registrationNumber: doctor.registration_number,
      },
    };
  },

  login: async ({ email, password }, logger) => {
    const doctor = await doctorStore.findByEmail(email);
    if (!doctor) {
      logger.warn({ email }, "Login with unknown email");
      AppError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, doctor.password_hash);
    if (!valid) {
      logger.warn({ email }, "Login with wrong password");
      AppError.unauthorized("Invalid email or password");
    }

    const token = jwt.sign(
      { id: doctor.id, name: doctor.name, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    logger.info({ doctorId: doctor.id }, "Doctor logged in");

    return {
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        registrationNumber: doctor.registration_number,
      },
    };
  },
};
