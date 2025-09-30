export const DashboardSkeleton = ({ showSidebar = true }) => {
  return (
    <div className="flex min-h-screen min-w-screen bg-[#F3FFF4]">
      {/* Sidebar Skeleton - Hidden on mobile */}
      {showSidebar && (
        <div className="hidden lg:block w-72 bg-[#F3FFF4] border-r border-[#DCFEDE] p-6">
          {/* Logo */}
          <div className="h-14 bg-[#DCFEDE] rounded-lg animate-pulse mb-8" />

          {/* Menu Items */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3">
                <div className="w-9 h-9 bg-[#DCFEDE] rounded-full animate-pulse" />
                <div className="flex-1 h-4 bg-[#DCFEDE] rounded animate-pulse" style={{ animationDelay: `${item * 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:py-8 lg:pr-10">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="h-6 sm:h-7 bg-[#DCFEDE] rounded animate-pulse w-48 sm:w-56 mb-2 sm:mb-3" />
          <div className="h-3 sm:h-4 bg-[#DCFEDE] rounded animate-pulse w-24 sm:w-32" style={{ animationDelay: '0.1s' }} />
        </div>

        {/* Stats Cards - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-[#E9FFEB] border border-[#DCFEDE] rounded-xl p-4 sm:p-6">
              <div className="h-3 bg-[#DCFEDE] rounded animate-pulse w-20 mb-3 sm:mb-4" style={{ animationDelay: `${card * 0.1}s` }} />
              <div className="h-7 sm:h-8 bg-[#DCFEDE] rounded animate-pulse w-14" style={{ animationDelay: `${card * 0.1 + 0.1}s` }} />
            </div>
          ))}
        </div>

        {/* Store Status Banner - Responsive */}
        <div className="bg-[#E9FFEB] rounded-xl p-4 sm:p-6 mb-6 lg:mb-8 relative overflow-hidden">
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 shimmer-effect" />
          
          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
            {/* Animated spinner */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <div className="absolute inset-0 border-3 sm:border-4 border-green-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 sm:border-4 border-green-500 rounded-full border-t-transparent spin-animation"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-green-700 font-semibold text-base sm:text-lg">Loading your dashboard</h3>
                <span className="loading-dots text-green-700 font-semibold text-base sm:text-lg"></span>
              </div>
              <p className="text-green-600 text-xs sm:text-sm">Please wait while we fetch your store data</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((action) => (
            <div key={action} className="bg-[#E9FFEB] rounded-xl p-4 sm:p-6 border border-[#DCFEDE]">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#DCFEDE] rounded-full animate-pulse flex-shrink-0" style={{ animationDelay: `${action * 0.1}s` }} />
                <div className="flex-1 min-w-0">
                  <div className="h-3 sm:h-4 bg-[#DCFEDE#DCFEDE] rounded animate-pulse w-24 sm:w-28 mb-2" style={{ animationDelay: `${action * 0.1 + 0.05}s` }} />
                  <div className="h-2 sm:h-3 bg-[#DCFEDE] rounded animate-pulse w-28 sm:w-36" style={{ animationDelay: `${action * 0.1 + 0.1}s` }} />
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

export default DashboardSkeleton;