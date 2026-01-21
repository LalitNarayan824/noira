import { client } from "@/lib/eden"
import { useMutation } from "@tanstack/react-query"
import { useUsername } from "./useUsername"


export const useSendMessage = (roomId :string) => {
  const { username } = useUsername();
 

  return useMutation({
    mutationFn: async({text } : {text:string})=>{
      await client.messages.post({sender: username , text} , { query :{roomId}})
    },
    
  })


}
