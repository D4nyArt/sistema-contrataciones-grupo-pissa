export default function UserSkeleton () {
    return(
        <div className="flex flex-row animate-pulse">
            <div className="size-10 rounded-full bg-gray-300 mr-2"></div>
            <div className="flex flex-col">
                <div className="w-26 h-4 rounded bg-gray-300 mb-2"></div>
                <div className="w-40 h-2 rounded bg-gray-300"></div>
            </div>
        </div>
    )
}