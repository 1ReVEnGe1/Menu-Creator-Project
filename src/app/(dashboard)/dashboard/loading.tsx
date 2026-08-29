export default function DashboardPageLoading() {
  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100">
        <div className="space-y-3">
          <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />

          <div className="h-4 w-72 max-w-full bg-slate-100 rounded-lg animate-pulse" />
        </div>

        <div className="h-11 w-32 bg-slate-100 rounded-xl animate-pulse" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Main content */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
        <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse" />

        <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-24 bg-white border border-slate-100 rounded-3xl p-5">
      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-3" />

      <div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />
    </div>
  );
}