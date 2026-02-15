import type { Request, Response } from "express";
import { taskService } from "../services/task.service.js";
import type { CreateTaskInput, UpdateTaskInput } from "../schema/task.schema.js";

export const createTaskHandler = async (
  req: Request<{}, {}, CreateTaskInput>,
  res: Response
) => {
  try {

    const userId = req.user!._id; 
    
    const task = await taskService.createTask(userId, req.body as any);
    
    return res.status(201).json(task);
  } catch (e: any) {
    return res.status(500).send(e.message);
  }
};

export const getTasksHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    
    const filters: any = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }

    const tasks = await taskService.getTasks(userId, filters);
    
    return res.status(200).json(tasks);
  } catch (e: any) {
    return res.status(500).send(e.message);
  }
};

export const updateTaskHandler = async (
  req: Request<{ id: string }, {}, UpdateTaskInput>, 
  res: Response
) => {
  try {
    const userId = req.user!._id;
    const taskId = req.params.id;
    
    const updatedTask = await taskService.updateTask(userId, taskId, req.body as any);

    if (!updatedTask) {
      return res.status(404).send("Task not found");
    }

    return res.status(200).json(updatedTask);
  } catch (e: any) {
    return res.status(500).send(e.message);
  }
};

export const deleteTaskHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user!._id;
    const taskId = req.params.id;

    const success = await taskService.deleteTask(userId, taskId);

    if (!success) {
      return res.status(404).send("Task not found");
    }

    return res.sendStatus(200);
  } catch (e: any) {
    return res.status(500).send(e.message);
  }
};