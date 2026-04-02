export default function StoreLoading() {
  return (
    <div className="min-h-screen sm:bg-gray-100 sm:flex sm:justify-center sm:items-start">
      <div className="w-full sm:max-w-[568px] sm:min-h-screen bg-white animate-pulse">
        {/* Nav skeleton */}
        <div className="sticky top-0 z-50 border-b border-gray-100 bg-white px-4 py-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-200" />
        </div>
        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-[2px] mt-[2px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
