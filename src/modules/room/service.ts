import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";


const ROOM_TTL = 600;

export const createRoom = async () => {
  const roomId = nanoid();
 

  await Promise.all([
    redis.hset(`meta:${roomId}`, {
      connected: [],
      createdAt: Date.now().toString(),
    }),
    redis.expire(`meta:${roomId}`, ROOM_TTL),
  ]);

  // await redis.hset(`meta:${roomId}`, {
  //   connected:[],
  //   createdAt: Date.now().toString(),
  // });

  // await redis.expire(`meta:${roomId}`, ROOM_TTL);



  return { roomId };
};
