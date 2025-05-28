function SkeletonNotification() {
    return (
      <div className="flex items-center space-x-4 px-4 py-2 animate-pulse border-b border-gray-200">
            <div className="rounded-full bg-gray-300 h-6 w-6" />
            <div className="rounded bg-gray-300 h-6 w-6" />
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
      </div>
    );
}  