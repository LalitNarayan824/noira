"use client";

import { client } from "@/lib/eden";
import { useRealtime } from "@/lib/realtime-client";
import { useGetRoomMessages } from "@/modules/hooks/useGetRoomMessages";
import { useSendMessage } from "@/modules/hooks/useSendMessage";
import { useUsername } from "@/modules/hooks/useUsername";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const formatTimeRemaining = (seconds: number | null): string | null => {
  if (seconds === null) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const RoomsPage = () => {
  const [copyStatus, setCopyStatus] = useState<"copy link" | "copied">(
    "copy link",
  );
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const roomId = params.roomId as string;
  const { username } = useUsername();
  const router = useRouter();

  const { data:ttlData } = useQuery({
    queryKey:["ttl" , roomId],
    queryFn: async()=>{
      const res = await client.room.ttl.get({query:{roomId}})
      return res.data
    },
  })

  useEffect(()=>{
    if(ttlData?.ttl !== undefined){
      setTimeRemaining(ttlData.ttl)
    }
  }, [ttlData])

  useEffect(()=>{
    if(timeRemaining === null||timeRemaining<0) return;

    if(timeRemaining === 0){
      router.replace("/?destroyed=true" );
      return;
    }

    const interval = setInterval(()=>{
      setTimeRemaining((prev)=>{
        if(prev===null || prev<=1) {
          clearInterval(interval);
          return 0;
        }

        return prev-1;
      })
    }, 1000)

    return ()=>clearInterval(interval);

  } , [timeRemaining , router])

  const handleCopyRoomId = async () => {
    if (!navigator.clipboard) {
      return;
    }

    const url = window.location.href;

    navigator.clipboard.writeText(url);
    setCopyStatus("copied");

    setTimeout(() => {
      setCopyStatus("copy link");
    }, 2000);
  };

  const { mutate: sendMessage, isPending } = useSendMessage(roomId);

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    sendMessage({ text: input.trim() });
    setInput("");
    inputRef.current?.focus();
  };

  const { data: messages, isLoading , refetch:refetchMessages } = useGetRoomMessages(roomId);

  useRealtime({
    channels:[roomId],
    events: ["chat.destroy" , "chat.message"],
    onData:({event})=>{
      if(event === "chat.message"){
        refetchMessages()
      }

      if(event === "chat.destroy"){
        router.replace("/?destroyed=true" );



      }
    }
  })

  const {mutate:destroyRoom, isPending:isDestroying} = useMutation({
    mutationFn: async()=>{
      await client.room.delete(null ,{query:{roomId}})
    },
  })




  return (
    <main className="w-full h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 pb-6 pt-4 shrink-0">
        <div className="max-w-4xl mx-auto flex gap-6 justify-around">
          {/* room id and copy button*/}
          <div className="mb-6">
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">
              Room ID
            </span>

            <div className="flex items-center gap-3 mt-3">
              <span className="font-mono text-lg text-green-400 break-all">
                {roomId}
              </span>
              <button
                onClick={() => handleCopyRoomId()}
                className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-gray-300 hover:bg-gray-800 hover:border-gray-700 transition-colors hover:cursor-pointer"
              >
                {copyStatus}
              </button>
            </div>
          </div>

          {/* self destruct timer */}
          <div className="mb-6">
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest block mb-2">
              Self Destruct In
            </span>

            <div className="flex items-center gap-3 mt-5">
              <span
                className={`font-mono text-2xlfont-bold
                ${
                  timeRemaining !== null && timeRemaining <= 30
                    ? "animate-pulse text-red-400"
                    : "text-amber-400"
                }
                
                `}
              >
                {formatTimeRemaining(timeRemaining) ?? "--:--"}
              </span>
            </div>
          </div>

          {/* self destruct */}
          <div className="flex items-center justify-between pt-4">
            <button onClick={()=>destroyRoom()} className="px-4 py-2 bg-red-900/20 border border-red-800 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-900/40 hover:border-red-700 transition-all active:scale-95 hover:cursor-pointer">
              {isDestroying ? "Destroying..." : "Self Destruct"}
            </button>
          </div>
        </div>
      </header>

      {/* messages section */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages?.messages.length === 0 && !isLoading && (
            <p className="text-gray-600 italic text-center py-8">
              No messages yet. Start the conversation!
            </p>
          )}

          {messages?.messages.map((msg) => {
            const isCurrentUser = msg.sender === username;
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    isCurrentUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-100 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrentUser ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {isCurrentUser ? "You" : msg.sender}
                    </span>
                  </div>
                  <div className="flex items-center justify-around">
                    <p className="text-sm wrap-break-words mr-4">{msg.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      isCurrentUser ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* input section - sticky at bottom */}
      <div className="border-t border-gray-800 bg-black p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <input
              autoFocus
              ref={inputRef}
              type="text"
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim() != "") {
                  sendMessage({ text: input.trim() });
                  setInput("");
                  inputRef.current?.focus();
                }
              }}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-700"
            />
            <button
              disabled={!input.trim() || isPending}
              onClick={() => handleSendMessage()}
              className="px-4 py-3 bg-blue-900/20 border border-blue-800 rounded-lg text-sm font-semibold text-blue-400 hover:bg-blue-900/40 hover:border-blue-500 transition-all active:scale-95 hover:cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RoomsPage;
