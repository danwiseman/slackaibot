import { Redis } from "ioredis";

export const cacheClient = new Redis({
    port: parseInt(process.env.REDISPORT || '6379', 10), // Redis port
    host: process.env.REDISHOST, // Redis host
    password: process.env.REDIS_PASSWORD,
});


export async function checkCachedEventId(eventID : string) {


}
