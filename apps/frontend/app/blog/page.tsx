export default function Blog() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white">Blog</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-1 w-16 bg-ts-blue rounded-full" />
          <div className="h-1 w-16 bg-go-teal rounded-full" />
        </div>
        <p className="text-gray-400 text-xl">Coming soon...</p>
      </div>
    </div>
  );
}
