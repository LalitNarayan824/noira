

const Loader = ({message}:{message : string}) => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-600">{message || "Loading..."}</p>
      </div>
    </div>
  )
}

export default Loader
