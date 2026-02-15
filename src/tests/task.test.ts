import { jest, describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../config/redis.js', () => ({
  redisClient: {
    connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    on: jest.fn<(event: string, callback: (...args: any[]) => void) => void>(),
    get: jest.fn<(key: string) => Promise<string | null>>().mockResolvedValue(null),
    setEx: jest.fn<(key: string, seconds: number, value: string) => Promise<string>>().mockResolvedValue("OK"),
    del: jest.fn<(keys: string | string[]) => Promise<number>>().mockResolvedValue(1),
    keys: jest.fn<(pattern: string) => Promise<string[]>>().mockResolvedValue([]),
    quit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  },
  connectRedis: jest.fn(),
}));

const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");
const db = await import("./db.js");

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

    expect(statusCode).toBe(201);
    expect(body.title).toBe(taskData.title);
    expect(body).toHaveProperty("_id");
  });

  it("should fetch all tasks", async () => {
    await request(app).post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 1" });

    const { body, statusCode } = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(statusCode).toBe(200);
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBe(1);
  });

  it("should update the task status", async () => {
    const createRes = await request(app).post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Update Me" });
    
    const taskId = createRes.body._id;

    const { body, statusCode } = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "completed" });

    expect(statusCode).toBe(200);
    expect(body.status).toBe("completed");
  });

  it("should delete the task", async () => {
    const createRes = await request(app).post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Delete Me" });
    
    const taskId = createRes.body._id;

    const { statusCode } = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(statusCode).toBe(200);
  });
});