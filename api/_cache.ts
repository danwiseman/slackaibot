import { createClient } from "redis";

export const cacheClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDISHOST,
        port: parseInt(process.env.REDISPORT || '6379', 10)
    }
});

export async function checkCachedEventId(eventID : string) {


}
