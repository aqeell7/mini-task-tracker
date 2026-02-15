import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken"

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send("Authorization token required");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Authorization token missing");
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing from environment variables");
    return res.status(500).send("Internal Server Error");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    if (decoded && decoded.id) {
      req.user = { _id: decoded.id };
      next();
    } else {
      return res.status(403).send("Invalid token payload");
    }
  } catch (e) {
    return res.status(403).send("Invalid or expired token");
  }
};

export default requireUser;