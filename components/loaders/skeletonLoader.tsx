export const DashboardSkeleton = ({ showSidebar = true }) => {
  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      {showSidebar && (
        <div className="w-72 bg-white border-r border-gray-200 p-6">
          {/* Logo */}
          <div className="h-14 bg-gradient-to-r from-green-100 to-green-50 rounded-lg animate-pulse mb-8" />

          {/* Menu Items */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${item * 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-7 bg-gray-200 rounded animate-pulse w-56 mb-3" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" style={{ animationDelay: '0.1s' }} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mb-4" style={{ animationDelay: `${card * 0.1}s` }} />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-14" style={{ animationDelay: `${card * 0.1 + 0.1}s` }} />
            </div>
          ))}
        </div>

        {/* Store Status Banner - Loading State */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 relative overflow-hidden">
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 shimmer-effect" />
          
          <div className="flex items-center gap-4 relative z-10">
            {/* Animated spinner */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent spin-animation"></div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-green-700 font-semibold text-lg">Loading your dashboard</h3>
                <span className="loading-dots text-green-700 font-semibold text-lg"></span>
              </div>
              <p className="text-green-600 text-sm">Please wait while we fetch your store data</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((action) => (
            <div key={action} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: `${action * 0.1}s` }} />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28 mb-2" style={{ animationDelay: `${action * 0.1 + 0.05}s` }} />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-36" style={{ animationDelay: `${action * 0.1 + 0.1}s` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .spin-animation {
          animation: spin-slow 1.5s linear infinite;
          transform: rotate(0deg);
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes dots {
          0%, 20% {
            content: '';
          }
          40% {
            content: '.';
          }
          60% {
            content: '..';
          }
          80%, 100% {
            content: '...';
          }
        }
        .loading-dots::after {
          content: '';
          animation: dots 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

