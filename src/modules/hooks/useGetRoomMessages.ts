import { client } from "@/lib/eden"
import { useQuery } from "@tanstack/react-query"


export const useGetRoomMessages = (roomId: string) => {

  return useQuery({
    queryKey:["messages" , roomId],
    queryFn: async()=>{
      const res = await client.messages.get({query : {roomId}})

      return res.data;

    }
  })

  


}