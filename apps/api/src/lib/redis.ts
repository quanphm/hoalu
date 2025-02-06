import RedisClient from "ioredis";

export const redis = new RedisClient(process.env.REDIS_URL);
