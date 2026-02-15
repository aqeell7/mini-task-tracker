import { jest, describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from '@jest/globals';
import request from "supertest";
import * as db from "./db.js";

jest.unstable_mockModule("../config/redis.js", () => {
  return {
    redisClient: {
      connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      on: jest.fn<(event: string, callback: (...args: any[]) => void) => void>(),
      get: jest.fn<(key: string) => Promise<string | null>>().mockResolvedValue(null),
      setEx: jest.fn<(key: string, seconds: number, value: string) => Promise<string>>().mockResolvedValue("OK"),
      del: jest.fn<(keys: string | string[]) => Promise<number>>().mockResolvedValue(1),
      keys: jest.fn<(pattern: string) => Promise<string[]>>().mockResolvedValue([]),
      quit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      isReady: true,
      isOpen: true,
    },
    connectRedis: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
});

const { default: app } = await import("../app.js");

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

const userPayload = {
  name: "Task User",
  email: "task@test.com",
  password: "password123",
};

describe("Task API Flow", () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post("/api/auth/signup").send(userPayload);
    
    const response = await request(app).post("/api/auth/login").send({
      email: userPayload.email,
      password: userPayload.password
    });

    token = response.body.token;
  });

  it("should create a task", async () => {
    const taskData = { title: "My First Task" };

    const { body, statusCode } = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(taskData);

    if (statusCode !== 201) {
      console.log("❌ Create task failed:");
      console.log("Status:", statusCode);
      console.log("Response:", body);
    }

    expect(statusCode).toBe(201);
    expect(body.title).toBe(taskData.title);
    expect(body).toHaveProperty("_id");
  });

  it("should fetch all tasks", async () => {
    const taskData = { title: "Test Task" };
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(taskData);
    
    const createdTaskId = createRes.body._id;

    const { body, statusCode } = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    if (statusCode !== 200) {
      console.log("❌ Fetch tasks failed:");
      console.log("Status:", statusCode);
      console.log("Response:", body);
    }

    expect(statusCode).toBe(200);
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBe(1);
    expect(body[0]._id).toBe(createdTaskId);
  });

  it("should update the task status", async () => {
    const taskData = { title: "Task to Update" };
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(taskData);
    
    const createdTaskId = createRes.body._id;
    const updateData = { status: "completed" };

    const { body, statusCode } = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    if (statusCode !== 200) {
      console.log("❌ Update task failed:");
      console.log("Status:", statusCode);
      console.log("Response:", body);
      console.log("Task ID:", createdTaskId);
    }

    expect(statusCode).toBe(200);
    expect(body.status).toBe("completed");
  });

  it("should delete the task", async () => {
    const taskData = { title: "Task to Delete" };
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(taskData);
    
    const createdTaskId = createRes.body._id;

    const { statusCode, body } = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${token}`);

    if (statusCode !== 200) {
      console.log("❌ Delete task failed:");
      console.log("Status:", statusCode);
      console.log("Response:", body);
      console.log("Task ID:", createdTaskId);
    }

    expect(statusCode).toBe(200);
  });

  it("should filter tasks by status", async () => {
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Pending Task" });

    const completedTask = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Completed Task" });

    await request(app)
      .put(`/api/tasks/${completedTask.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "completed" });

    const { body, statusCode } = await request(app)
      .get("/api/tasks?status=completed")
      .set("Authorization", `Bearer ${token}`);

    expect(statusCode).toBe(200);
    expect(body.length).toBe(1);
    expect(body[0].status).toBe("completed");
  });
});