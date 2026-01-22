"use client"

import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/eden";
import { useRouter } from "next/navigation";


export const useCreateRoom = () =>{
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post()

      if (res.error) {
        throw new Error("Failed to create room");
      }

      return res.data;
    },
    onSuccess:(data)=>{
      router.push(`/room/${data.roomId}`);
      // console.log("Room created successfully:", data);
    }
  });



}




  
