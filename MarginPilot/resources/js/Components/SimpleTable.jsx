export default function SimpleTable({ columns, rows, emptyLabel = "Aucune donnée pour l'instant" }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100">
                        {columns.map((col) => (
                            <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                                        <svg className="h-5 w-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-slate-400">{emptyLabel}</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {rows.map((row, index) => (
                        <tr key={row.id ?? index} className="transition-colors duration-150 hover:bg-violet-50/30">
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3.5 text-slate-700">
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
