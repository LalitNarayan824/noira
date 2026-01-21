import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";

const ROOM_TTL = 600;

export const createRoom = async () => {
  const roomId = nanoid();

  await redis.set("workingNew", "true" );
  await redis.expire("workingNew", 60);

  await redis.hset(`meta:${roomId}`, {
    connected:[],
    createdAt: Date.now().toString(),
  });

  // await redis.sadd(`users:${roomId}`, "__init__");
  // await redis.srem(`users:${roomId}`, "__init__");

  await redis.expire(`meta:${roomId}`, ROOM_TTL);
  // await redis.expire(`users:${roomId}`, ROOM_TTL);

  return { roomId };
};
