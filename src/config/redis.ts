import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Could not connect to Redis", error);
    process.exit(1);
  }
};

export { redisClient, connectRedis };