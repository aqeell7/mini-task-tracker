import { jest, describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from "supertest";
import app from "../app.js"; 
import * as db from "./db.js";

jest.mock("../config/redis.js"); 

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe("User Authentication", () => {
  
  describe("POST /api/auth/signup", () => {
    
    it("should return 201 given valid input", async () => {
      const userInput = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const { body, statusCode } = await request(app)
        .post("/api/auth/signup")
        .send(userInput);

      expect(statusCode).toBe(201);
      expect(body.user).toHaveProperty("_id");
      expect(body.user.email).toBe(userInput.email);
      expect(body).toHaveProperty("token");
    });

    it("should return 409 if user already exists", async () => {
      const userInput = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      await request(app).post("/api/auth/signup").send(userInput);

      const { statusCode } = await request(app)
        .post("/api/auth/signup")
        .send(userInput);

      expect(statusCode).toBe(409);
    });
  });
});