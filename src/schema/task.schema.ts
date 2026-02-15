import { z } from "zod";
import { TaskStatus } from "../models/task.model.js";

const params = {
  params: z.object({
    id: z
      .string({ required_error: "Task ID is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID"),
  }),
};

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateTaskSchema = z.object({
  ...params,
  body: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.nativeEnum(TaskStatus).optional(),
      dueDate: z.string().datetime().optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const taskParamSchema = z.object({
  ...params,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
