interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {count > 1 ? (
        Array.from({ length: count }).map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 rounded mb-2">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))
      ) : (
        <div className="animate-pulse bg-gray-200 rounded">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      )}
    </div>
  );
}

export function DepartmentSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`p-4 bg-white rounded-xl border border-gray-200 fade-in-delay-${Math.min(index, 3)}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DoctorSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`p-4 bg-white rounded-xl border border-gray-200 fade-in-delay-${Math.min(index, 3)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
            <div className="w-20 h-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 