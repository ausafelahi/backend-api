import jwt from "jsonwebtoken";
import { Errors } from "../utils/AppError.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      Errors.unauthorized("Missing or malformed Authorization header"),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.log.debug("Authenticated user", { doctorId: decoded.id });
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(Errors.unauthorized("Token expired"));
    }
    return next(Errors.unauthorized("Invalid token"));
  }
}
