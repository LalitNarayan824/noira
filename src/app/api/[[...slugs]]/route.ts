
import { createRoom } from "@/modules/room/service";

import { Elysia } from "elysia";



const room = new Elysia({ prefix: "/room" }).post("/create", async () => {
  return await createRoom();
});

const app = new Elysia({ prefix: "/api" }).use(room);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
