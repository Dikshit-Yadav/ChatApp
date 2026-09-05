import redisClient from "../config/redisClient.js";

export const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error(`Cache GET error [${key}]:`, err.message);
        return null;
    }
};

// set cache with a TTL
export const setCache = async (key, data, ttlSeconds = 300) => {
    try {
        await redisClient.set(key, JSON.stringify(data), "EX", ttlSeconds);
    } catch (err) {
        console.error(`Cache SET error [${key}]:`, err.message);
    }
};

// delete a specific cache key.
export const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error(`Cache DEL error [${key}]:`, err.message);
    }
};

// delete all keys matching a glob pattern.

export const deleteCachePattern = async (pattern) => {
    try {
        let cursor = "0";
        do {
            const [nextCursor, keys] = await redisClient.scan(
                cursor,
                "MATCH",
                pattern,
                "COUNT",
                100
            );
            cursor = nextCursor;
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } while (cursor !== "0");
    } catch (err) {
        console.error(`Cache PATTERN DEL error [${pattern}]:`, err.message);
    }
};
