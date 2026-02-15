import { Router } from "express";
import { 
  createTaskHandler, 
  getTasksHandler, 
  updateTaskHandler, 
  deleteTaskHandler 
} from "../controllers/task.controller.js";
import requireUser from "../middlewares/requireUser.js";
import validate from "../middlewares/validateResource.js";
import { 
  createTaskSchema, 
  updateTaskSchema, 
  taskParamSchema 
} from "../schema/task.schema.js";

const router = Router();

router.use(requireUser);

router.get("/", getTasksHandler);

router.post("/", validate(createTaskSchema), createTaskHandler);

router.put("/:id", validate(updateTaskSchema), updateTaskHandler);

router.delete("/:id", validate(taskParamSchema), deleteTaskHandler);

export default router;