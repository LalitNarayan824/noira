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
 const bottomRef = useRef<HTMLDivElement | null>(null);



  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } });
      return res.data;
    },
  });

  


  useEffect(() => {
    if (ttlData?.ttl !== undefined) {
      setTimeRemaining(ttlData.ttl);
    }
  }, [ttlData]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return;

    if (timeRemaining === 0) {
      router.replace("/?destroyed=true");
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, router]);

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

  const {
    data: messages,
    isLoading,
    refetch: refetchMessages,
  } = useGetRoomMessages(roomId);

  useRealtime({
    channels: [roomId],
    events: ["chat.destroy", "chat.message"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetchMessages();
      }

      if (event === "chat.destroy") {
        router.replace("/?destroyed=true");
      }
    },
  });

  const { mutate: destroyRoom, isPending: isDestroying } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    },
  });

  useEffect(() => {
  bottomRef?.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages?.messages.length]);

  return (
    <main className="w-full min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between gap-6">
          {/* Room Info */}
          <div>
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">
              Room ID
            </span>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-lg text-green-400 break-all">
                {roomId}
              </span>
              <button
                onClick={handleCopyRoomId}
                className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-gray-300 hover:bg-gray-800 transition"
              >
                {copyStatus}
              </button>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest block mb-1">
              Self Destruct In
            </span>
            <span
              className={`font-mono text-2xl font-bold ${
                timeRemaining !== null && timeRemaining <= 30
                  ? "animate-pulse text-red-400"
                  : "text-amber-400"
              }`}
            >
              {formatTimeRemaining(timeRemaining) ?? "--:--"}
            </span>
          </div>

          {/* Destroy Button */}
          <button
            onClick={() => destroyRoom()}
            className="px-4 py-2 bg-red-900/20 border border-red-800 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-900/40 transition active:scale-95"
          >
            {isDestroying ? "Destroying..." : "Self Destruct"}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages?.messages.length === 0 && !isLoading && (
            <p className="text-gray-600 italic text-center py-12">
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
                  className={`max-w-[85%] sm:max-w-md lg:max-w-lg px-4 py-3 rounded-xl
                ${
                  isCurrentUser
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                }`}
                >
                  <span
                    className={`text-xs font-semibold block mb-1
                  ${isCurrentUser ? "text-blue-200" : "text-gray-400"}`}
                  >
                    {isCurrentUser ? "You" : msg.sender}
                  </span>

                  <div className="flex items-end justify-between gap-3">
                    <p className="text-sm wrap=break-words">{msg.text}</p>
                    <span
                      className={`text-[10px] whitespace-nowrap
                    ${isCurrentUser ? "text-blue-200" : "text-gray-500"}`}
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
          <div ref={bottomRef} />

        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-gray-800 bg-black px-4 py-3 sm:py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex gap-3">
          <input
            autoFocus
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                sendMessage({ text: input.trim() });
                setInput("");
                inputRef.current?.focus();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm
                   focus:outline-none focus:border-gray-700"
          />

          <button
            disabled={!input.trim() || isPending}
            onClick={handleSendMessage}
            className="px-4 py-3 bg-blue-900/20 border border-blue-800 rounded-lg text-sm font-semibold text-blue-400
                   hover:bg-blue-900/40 hover:border-blue-500 transition
                   active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default RoomsPage;
