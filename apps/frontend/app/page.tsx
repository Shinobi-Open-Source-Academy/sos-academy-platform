export default function Index() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-8">
        <img
          src="/shinobiLogo.png"
          alt="SOS Academy"
          width={200}
          height={200}
          className="mx-auto"
        />
        <h1 className="text-6xl md:text-8xl font-bold text-white">Coming Soon</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-1 w-16 bg-ts-blue rounded-full" />
          <div className="h-1 w-16 bg-go-teal rounded-full" />
        </div>
        <p className="text-gray-400 text-xl">Building something amazing...</p>
      </div>
    </div>
  );
}
