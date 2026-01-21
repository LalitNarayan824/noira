"use client";

import { useUsername } from "@/modules/hooks/useUsername";
import Loader from "./loader";

import { useCreateRoom } from "@/modules/hooks/useCreateRoom";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


const Page = ()=>{
  return (
    <Suspense>

      <Home/>
    </Suspense>
  )
}



function Home() {
  const { username } = useUsername();

  const { mutateAsync: createRoomMutation, isPending } = useCreateRoom();

  const searchParams = useSearchParams();

  const wasDestroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error");

  const handleCreateRoom = async () => {
    try {
      const res = await createRoomMutation();
      console.log("Room created:", res);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  if (isPending) {
    return <Loader message="Creating secure room..." />;
  }

  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center p-4 bg-black">
      <div className="w-full max-w-md">
        {wasDestroyed && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
            <strong className="font-semibold">Room Closed:</strong> The room
            you were in has been closed and all messages have been deleted.
          </div>
        )}

        {error == "room_not_found" && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
            <strong className="font-semibold">Error:</strong> The room you are
            trying to access does not exist.
          </div>
        )}

        {error == "room_full" && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
            <strong className="font-semibold">Error:</strong> The room you are
            trying to join is full.
          </div>
        ) }

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <div className="inline-block px-3 py-1 border border-gray-700 rounded-full text-xs text-gray-400 uppercase tracking-wider mb-4">
              Privacy-First Messaging
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4 text-white tracking-tight">
            Noira
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Minimal. Secure. Anonymous. Self-destructing.
          </p>
        </div>

        {/* main create room invoke */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
          {/* identity */}
          <div className="mb-8">
            <label className="block text-xs font-mono font-semibold text-gray-500 mb-3 uppercase tracking-widest">
              Your Anonymous Identity
            </label>
            <div className="w-full bg-black border border-gray-800 rounded-lg p-4 flex items-center justify-start group hover:border-gray-700 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-mono text-sm text-gray-300">
                {username || "generating..."}
              </span>
            </div>
          </div>

          {/* create room button */}
          <div className="w-full">
            <button
              onClick={() => handleCreateRoom()}
              className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95 uppercase tracking-wider text-sm cursor-pointer hover:bg-black hover:text-gray-400"
            >
              Create Secure Room
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


export default Page;