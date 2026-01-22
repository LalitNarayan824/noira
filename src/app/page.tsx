"use client";

import { useUsername } from "@/modules/hooks/useUsername";
import Loader from "./loader";

import { useCreateRoom } from "@/modules/hooks/useCreateRoom";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


const Page = () => {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
};

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
    <main className="relative w-full min-h-screen flex flex-col justify-center items-center px-4 py-10 sm:py-16 bg-black">
      <div className="absolute top-6 right-6">
  <GitHubLink />
</div>

      <div className="w-full max-w-lg lg:max-w-xl">
        {/* Alerts */}
        {wasDestroyed && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            <strong className="font-semibold">Room Closed:</strong> The room you
            were in has been closed and all messages have been deleted.
          </div>
        )}

        {error === "room_not_found" && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            <strong className="font-semibold">Error:</strong> The room you are
            trying to access does not exist.
          </div>
        )}

        {error === "room_full" && (
          <div className="bg-red-900/40 border border-red-700 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            <strong className="font-semibold">Error:</strong> The room you are
            trying to join is full.
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="mb-5">
            <div className="inline-block px-3 py-1 border border-gray-700 rounded-full text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest">
              Privacy-First Messaging
            </div>
          </div>
          <div className="mb-6 flex justify-center items-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white tracking-tight">
            Noira
          </h1>
            <img
              src="/icon.png"
              alt="icon"
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>

          

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            Minimal. 2-people. Anonymous. Self-destructing.
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Identity */}
          <div className="mb-8">
            <label className="block text-[10px] sm:text-xs font-mono font-semibold text-gray-500 mb-3 uppercase tracking-widest">
              Your Anonymous Identity
            </label>

            <div className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-700 transition-colors">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-sm text-gray-300 truncate">
                {username || "generating..."}
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => handleCreateRoom()}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-lg uppercase tracking-wider text-sm
                   transition-all duration-200
                   hover:bg-black hover:text-gray-400 hover:border hover:border-gray-700
                   active:scale-[0.98]"
          >
            Create Secure Room
          </button>
        </div>
      </div>
    </main>
  );
}

export default Page;





function GitHubLink(){
  return (
    <a
  href="https://github.com/LalitNarayan824/noira"
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
>
  View source
</a>

  )
}



