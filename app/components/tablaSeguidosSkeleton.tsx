export default function SeguidosSkeleton () {
    return(
        <table className="table-auto w-full border-separate border-spacing-y-2 animate-pulse">
            <thead>
                <tr>
                <th className="py-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                </th>
                <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </th>
                <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </th>
                <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </th>
                <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className="py-2 border-b border-gray-300">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-4 border-b border-gray-300">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                <td className="px-4 py-4 border-b border-gray-300">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                <td className="px-4 py-4 border-b border-gray-300">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                <td className="px-4 py-4 border-b border-gray-300">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                </tr>
            </tbody>
        </table>
    )
}