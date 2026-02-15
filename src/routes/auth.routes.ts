import { Router } from "express";
import { registerHandler,loginHandler } from "../controllers/auth.controller.js";
import validate from "../middlewares/validateResource.js";
import { registerSchema, loginSchema } from "../schema/auth.schema.js";

const router = Router()

router.post("/signup", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);

export default router;