import { NextRequest, NextResponse } from "next/server"
import { redis } from "./lib/redis";
import { nanoid } from "nanoid";


export const proxy = async (req : NextRequest)=>{

  // console.log("proxy runs");


  // check if the url is correct -> https://site/room/roomId
  const pathname = req.nextUrl.pathname
  const roomMatch = pathname.match(/^\/room\/([^/]+)$/)
  if(!roomMatch) return NextResponse.redirect(new URL("/?error=room_not_found", req.url));


  // if correct , get the roomId and fetch the room info
  const roomId = roomMatch[1];
  const meta = await redis.hgetall<{connected:string[] , createdAt:number}>(`meta:${roomId}`)

  // something wrong with roomId
  if(!meta){
    return NextResponse.redirect(new URL("/?error=room_not_found", req.url));
  }

  // check if user already has a token
  const existingToken = req.cookies.get("x-auth-token")?.value;

  // user was already in the room , and for some reason got out , but wants to join again
  // USER IS ALLOWED TO JOIN
  if(existingToken && meta.connected.includes(existingToken)){
    
    return NextResponse.next();

  }
  // for now max number of people that can join is 2
  // ANY USER NOW NOT ALLOWED
  if(meta.connected.length>=2){
    return NextResponse.redirect(new URL("/?error=room_full" , req.url));
  }



  // create a token for the user ,put in the browser cookie , and set the token in redis roomId
  // console.log("proxy setting token for user")

  const token = nanoid();

  const response = NextResponse.next();

  response.cookies.set("x-auth-token" , token , {
    path:"/",
    httpOnly:true,
    secure: process.env.NODE_ENV === "production",
    sameSite:"strict",
    maxAge: 60 * 11, 
  });

  await redis.hset(`meta:${roomId}` , {
    connected : [...meta.connected , token]
  });

  return response;


}


export const config = {
  matcher: "/room/:path*",
}