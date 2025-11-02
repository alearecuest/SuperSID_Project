import React, { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const DataTable = <T extends { id: string | number }>({
  data,
  columns,
  title,
  selectable = false,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>): React.ReactElement => {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map(row => row.id)));
    }
  };

  return (
    <div className="data-table-container">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : sortedData.length === 0 ? (
        <div className="text-center py-8 text-muted">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {selectable && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    className={`px-4 py-3 text-left font-semibold text-sm ${
                      col.sortable ? 'cursor-pointer hover:bg-bg-tertiary' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map(row => (
                <tr
                  key={row.id}
                  className={`border-b border-border hover:bg-bg-tertiary transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable;