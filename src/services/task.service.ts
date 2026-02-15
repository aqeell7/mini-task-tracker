import Task from "../models/task.model.js";
import type { ITask } from "../models/task.model.js";
import { redisClient } from "../config/redis.js";

export class TaskService {
  
  private getCacheKey(userId: string, filters: any = {}): string {
    const filterString = Object.keys(filters).length ? `:${JSON.stringify(filters)}` : "";
    return `tasks:${userId}${filterString}`;
  }

  private async invalidateCache(userId: string) {
    const pattern = `tasks:${userId}*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }

  async createTask(userId: string, data: Partial<ITask>): Promise<ITask> {
    const task = await Task.create({ ...data, owner: userId });
    await this.invalidateCache(userId);
    return task;
  }

  async getTasks(userId: string, filters: any = {}): Promise<ITask[]> {
    const cacheKey = this.getCacheKey(userId, filters);

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const query = { owner: userId, ...filters };
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks));

    return tasks;
  }

  async updateTask(userId: string, taskId: string, data: Partial<ITask>): Promise<ITask | null> {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, owner: userId },
      data,
      { new: true, runValidators: true }
    );

    if (task) {
      await this.invalidateCache(userId);
    }

    return task;
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const result = await Task.deleteOne({ _id: taskId, owner: userId });

    if (result.deletedCount > 0) {
      await this.invalidateCache(userId);
      return true;
    }
    return false;
  }
}

export const taskService = new TaskService();