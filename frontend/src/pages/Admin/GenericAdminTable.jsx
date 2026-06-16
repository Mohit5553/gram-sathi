import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, Plus, RefreshCw, Download } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const GenericAdminTable = forwardRef(({ 
  title, 
  endpoint, 
  columns, 
  filtersConfig = [], 
  onAdd, 
  onEdit, 
  onDelete 
}, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState(() => {
    const initial = {};
    filtersConfig.forEach(f => {
      initial[f.name] = 'all';
    });
    return initial;
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting & Export States
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortConfig.key === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: field, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleExport = () => {
    if (data.length === 0) {
      toast.error('No data available to export');
      return;
    }
    
    // Create header row
    const headers = columns.map(c => `"${c.headerName}"`).join(',');
    
    // Create data rows
    const rows = data.map(row => {
      return columns.map(col => {
        let val = row[col.field];
        if (val === undefined || val === null) val = '';
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Table data exported successfully');
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: debouncedSearch,
        ...filters
      };

      // Remove 'all' strings so they aren't sent to the backend as literal filter values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await api.get(endpoint, { params });
      
      if (response.data && response.data.pagination) {
        // Serverside paginated format
        const rowData = response.data.data || [];
        setData(rowData.map(item => ({ ...item, id: item._id })));
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages || 1);
      } else {
        // Fallback to client-side data if backend is not paginated
        const rowData = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const rows = rowData.map(item => ({ ...item, id: item._id }));
        setData(rows);
        setTotal(rows.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error(`Error fetching ${title}`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, page, limit, debouncedSearch, JSON.stringify(filters)]);

  useImperativeHandle(ref, () => ({
    refresh: fetchData
  }));

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const hasActions = !!onEdit || !!onDelete;

  return (
    <div className="space-y-4">
      {/* Header section with Title, Search, Filters, and Add Button */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-heading">{title} Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">Total records: <span className="font-semibold text-slate-700">{total}</span></p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Dynamic Filters */}
          {filtersConfig.map((filter) => (
            <div key={filter.name} className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{filter.label}:</label>
              <select
                value={filters[filter.name]}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="block py-2 px-3 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Refresh Action */}
          <Button 
            variant="outline"
            size="icon"
            onClick={fetchData} 
            className="h-9 w-9 border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 p-0"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* Export Action */}
          <Button 
            variant="outline"
            size="icon"
            onClick={handleExport} 
            className="h-9 w-9 border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 p-0"
            title="Export to Excel / CSV"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Add New Button */}
          {onAdd && (
            <Button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 h-9 text-xs rounded-lg font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans cursor-pointer hover:bg-slate-100 select-none transition-colors"
                    style={{ width: col.width }}
                    onClick={() => handleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      {col.headerName}
                      {sortConfig.key === col.field ? (
                        sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                      ) : null}
                    </div>
                  </th>
                ))}
                {hasActions && (
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-primary"></div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center text-slate-500">
                    No records found
                  </td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    {columns.map((col) => (
                      <td key={col.field} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <Button
                              variant="edit"
                              size="icon"
                              onClick={() => onEdit(row)}
                              className="w-7 h-7 p-1 rounded text-white"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="delete"
                              size="icon"
                              onClick={() => onDelete(row)}
                              className="w-7 h-7 p-1 rounded text-white"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>
              Showing <span className="font-medium text-slate-800">{data.length}</span> of <span className="font-medium text-slate-800">{total}</span> records
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg border-slate-300 text-slate-600 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="text-slate-800">{page}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-600">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="h-8 w-8 rounded-lg border-slate-300 text-slate-600 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default GenericAdminTable;
