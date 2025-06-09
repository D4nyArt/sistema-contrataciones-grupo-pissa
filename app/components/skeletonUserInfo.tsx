export default function SkeletonUserInfo () {
    return(
        <div className="flex flex-col animate-pulse">
            <div className="w-25 h-5 bg-gray-300 mb-8 rounded"></div>
            <div className="flex flex-row items-center mb-6 rounded">
                <div className="size-15 bg-gray-300 rounded-full mr-4"></div>
                <div>
                    <div className="w-60 h-5 bg-gray-300 mb-2 rounded"></div>
                    <div className="w-25 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="ml-auto flex">
                    <div className="w-35 h-11 rounded-lg bg-gray-300 mr-2"></div>
                    <div className="w-35 h-11 rounded-lg bg-gray-300"></div>
                </div>
            </div>
            <div className="flex flex-row space-x-6 mb-8">
                <div className="w-22 h-5 bg-gray-300 rounded"></div>
                <div className="w-22 h-5 bg-gray-300 rounded"></div>
                <div className="w-22 h-5 bg-gray-300 rounded"></div>
                <div className="w-22 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="w-full h-115 bg-gray-300 rounded-lg"></div>
        </div>
    )
}