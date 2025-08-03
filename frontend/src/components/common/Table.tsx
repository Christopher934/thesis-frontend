import React from 'react';

const Table = ({ columns, renderRow, data }:
    {
        columns: { headers: string; accessor: string; className?: string; tooltip?: string; }[];
        renderRow: (item: any) => React.ReactNode;
        data: any[];
    }) => {
    return (
        <div className="overflow-x-auto">
            <table className='w-full mt-4 min-w-max'>
                <thead>
                    <tr className="text-center lg:text-left text-sm text-gray-500 bg-gray-50">
                        {columns.map((col) => (
                            <th 
                                key={col.accessor} 
                                className={`${col.className} text-center lg:text-left px-2 lg:px-4 py-3 font-semibold uppercase tracking-wider border-b border-gray-200`}
                                title={col.tooltip}
                            >
                                {col.headers}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => renderRow(item))}
                </tbody>
            </table>
        </div>
    )
}

export default Table