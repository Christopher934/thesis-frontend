import React from 'react';

const Table = ({ columns, renderRow, data }:
    {
        columns: { headers: string; accessor: string; className?: string; }[];
        renderRow: (item: any) => React.ReactNode;
        data: any[];
    }) => {
    return (
        <table className='w-full mt-4'>
            <thead>
                <tr className="text-center lg:text-left text-sm text-gray-500">
                    {columns.map((col) => (
                        <th key={col.accessor} className={`${col.className} text-center lg:text-left px-4 lg:px-6 py-3`}>{col.headers}</th>
                    ))}
                </tr>
            </thead>
            <tbody>{data.map((item) => renderRow(item))}</tbody>
        </table>
    )
}

export default Table