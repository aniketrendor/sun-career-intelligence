export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl w-full">
          <div className="flex items-center gap-2">
            <div className="h-6 w-32 bg-[#FAF6F0] rounded-full border border-[#DFD7CB]" />
            <div className="h-6 w-28 bg-[#FAF6F0] rounded-full border border-[#DFD7CB]" />
          </div>
          <div className="h-8 w-64 bg-[#F5EFE6] rounded-2xl" />
          <div className="h-4 w-96 bg-[#FAF6F0] rounded-xl" />
        </div>
        <div className="h-12 w-44 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB]" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-3xl bg-white border border-[#DFD7CB] shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-20 bg-[#FAF6F0] rounded-lg" />
              <div className="h-4 w-24 bg-[#F5EFE6] rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white border border-[#DFD7CB] rounded-3xl p-6 space-y-4">
          <div className="h-6 w-48 bg-[#F5EFE6] rounded-xl" />
          <div className="h-4 w-72 bg-[#FAF6F0] rounded-lg" />
          <div className="h-44 w-full bg-[#FAF6F0]/60 rounded-2xl border border-[#DFD7CB]" />
        </div>
        <div className="h-80 bg-white border border-[#DFD7CB] rounded-3xl p-6 space-y-4">
          <div className="h-6 w-40 bg-[#F5EFE6] rounded-xl" />
          <div className="h-4 w-52 bg-[#FAF6F0] rounded-lg" />
          <div className="h-44 w-full bg-[#FAF6F0]/60 rounded-2xl border border-[#DFD7CB]" />
        </div>
      </div>
    </div>
  )
}
