import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.register(req.body);
    return res.status(201).json({ user, token });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Registration failed";
    return res.status(409).json({ message });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    return res.status(200).json({ user, token });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Invalid credentials";
    return res.status(401).json({ message });
  }
};
