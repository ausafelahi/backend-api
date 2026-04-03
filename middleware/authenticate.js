import jwt from "jsonwebtoken";
import { doctorStore } from "../store/index.js";
import { Errors } from "../utils/AppError.js";

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      Errors.unauthorized("Missing or malformed Authorization header"),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await doctorStore.findById(decoded.id);
    if (!doctor) return next(Errors.unauthorized("Doctor account not found"));
    if (!doctor.verified) {
      return next(Errors.forbidden("Your account is not PMDC verified"));
    }

    req.user = decoded;
    req.log.debug(
      { doctorId: decoded.id },
      "Authenticated and verified doctor",
    );
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return next(Errors.unauthorized("Token expired"));
    return next(Errors.unauthorized("Invalid token"));
  }
}
