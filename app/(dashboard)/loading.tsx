export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  );
}
