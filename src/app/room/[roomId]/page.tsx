"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";

const formatTimeRemaining = (seconds: number | null): string | null => {
  if (seconds === null) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}


const RoomsPage = () => {
  const [copyStatus , setCopyStatus] = useState< "copy link" | "copied" >("copy link");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(120);
  const [input , setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);


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
  
  }



  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <main className="w-full min-h-screen bg-black text-white p-4">
      <header className="border-b border-gray-800 pb-6 mb-8">
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
              <button onClick={()=>handleCopyRoomId()} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-gray-300 hover:bg-gray-800 hover:border-gray-700 transition-colors hover:cursor-pointer">
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
              <span className={`font-mono text-2xlfont-bold
                ${timeRemaining !== null && timeRemaining <= 30 ? "animate-pulse text-red-400"
                 : "text-amber-400"}
                
                `}>
                {formatTimeRemaining(timeRemaining) ?? "--:--"}
              </span>
            </div>
          </div>

          

          {/* self destruct */}
          <div className="flex items-center justify-between pt-4">
            

            <button className="px-4 py-2 bg-red-900/20 border border-red-800 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-900/40 hover:border-red-700 transition-all active:scale-95 hover:cursor-pointer">
              Self Destroy
            </button>
          </div>
        </div>
      </header>

      {/* messages section */}
      <div className="max-w-4xl mx-auto mt-8"> 
        <p className="text-gray-600 italic">No messages yet. Start the conversation!</p>
      </div>

      {/* input section */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mt-6">
          <input
            autoFocus
            type="text"
            value={input}
            onKeyDown={(e)=>{
              if(e.key === "Enter" && input.trim()!=""){
                // todo : send message
                inputRef.current?.focus();
              }
            }}
            onChange={e=>setInput(e.target.value) }
            placeholder="Type a message..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-700"
          />
          <button className="px-4 py-3 bg-blue-900/20 border border-blue-800 rounded-lg text-sm font-semibold text-blue-400 hover:bg-blue-900/40 hover:border-blue-500 transition-all active:scale-95 hover:cursor-pointer">
            Send
          </button>
        </div>
      </div>

      

    </main>
  );
};

export default RoomsPage;
