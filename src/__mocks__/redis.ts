import { jest } from '@jest/globals';

export const redisClient = {
  connect: jest.fn(),
  on: jest.fn(),
  get: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  quit: jest.fn(),
};

export const connectRedis = jest.fn();