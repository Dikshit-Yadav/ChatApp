import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
    },
    enableReadyCheck: true,
    lazyConnect: false,
});

redisClient.on("connect", () => {
    console.log("Connected to Redis");
});

redisClient.on("ready", async () => {
    try {
        // config LRU eviction 
        const maxMemory = process.env.REDIS_MAX_MEMORY || "100mb";
        await redisClient.config("SET", "maxmemory", maxMemory);
        await redisClient.config("SET", "maxmemory-policy", "allkeys-lru");
        console.log(`Redis LRU eviction configured: maxmemory=${maxMemory}, policy=allkeys-lru`);
    } catch (err) {
        console.warn("Could not set Redis eviction policy ", err.message);
    }
});

redisClient.on("error", (err) => {
    console.error("Redis connection error:", err.message);
});

export default redisClient;
