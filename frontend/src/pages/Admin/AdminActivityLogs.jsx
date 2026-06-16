import React, { useRef } from 'react';
import { Activity, ShieldCheck, Terminal, Clock, RefreshCw } from 'lucide-react';
import GenericAdminTable from './GenericAdminTable';

const AdminActivityLogs = () => {
  const tableRef = useRef();

  const columns = [
    { 
      field: 'createdAt', 
      headerName: 'Timestamp', 
      width: '15%',
      renderCell: ({ value }) => (
        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {value ? new Date(value).toLocaleString() : 'N/A'}
        </div>
      )
    },
    { 
      field: 'userName', 
      headerName: 'Actor', 
      width: '20%',
      renderCell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.userName}</span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium w-fit mt-1 border ${
            row.userRole === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
            row.userRole === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
            row.userRole === 'provider' ? 'bg-amber-50 text-amber-700 border-amber-100' :
            row.userRole === 'user' ? 'bg-sky-50 text-sky-700 border-sky-100' :
            'bg-slate-50 text-slate-600 border-slate-100'
          }`}>
            {row.userRole ? row.userRole.charAt(0).toUpperCase() + row.userRole.slice(1).replace('_', ' ') : 'Guest'}
          </span>
        </div>
      )
    },
    { 
      field: 'action', 
      headerName: 'Action Category', 
      width: '20%',
      renderCell: ({ value }) => {
        let colorClass = 'bg-slate-50 text-slate-700 border-slate-200';
        if (value.startsWith('AUTH_')) {
          colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
        } else if (value.startsWith('BOOKING_')) {
          colorClass = 'bg-sky-50 text-sky-700 border-sky-100';
        } else if (value.startsWith('ADMIN_')) {
          colorClass = 'bg-rose-50 text-rose-700 border-rose-100';
        } else if (value.startsWith('CMS_') || value.startsWith('SCHEME_')) {
          colorClass = 'bg-purple-50 text-purple-700 border-purple-100';
        }

        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${colorClass}`}>
            {value}
          </span>
        );
      }
    },
    { 
      field: 'details', 
      headerName: 'Description & Context', 
      width: '30%',
      renderCell: ({ row }) => (
        <div className="space-y-1.5">
          <p className="text-slate-800 text-sm font-medium whitespace-normal break-words">{row.details}</p>
          {row.metadata && Object.keys(row.metadata).length > 0 && (
            <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-600 max-h-24 overflow-y-auto border border-slate-100">
              <pre className="whitespace-pre-wrap">{JSON.stringify(row.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      )
    },
    {
      field: 'ipAddress',
      headerName: 'Connection Info',
      width: '15%',
      renderCell: ({ row }) => (
        <div className="text-xs text-slate-500 space-y-1 font-mono">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">IP:</span>
            <span>{row.ipAddress || 'N/A'}</span>
          </div>
          <div className="max-w-[150px] truncate text-[10px] text-slate-400" title={row.userAgent}>
            {row.userAgent || 'System Process'}
          </div>
        </div>
      )
    }
  ];

  const filtersConfig = [
    {
      name: 'role',
      label: 'Actor Role',
      options: [
        { label: 'All Roles', value: 'all' },
        { label: 'Admin', value: 'admin' },
        { label: 'Provider', value: 'provider' },
        { label: 'User', value: 'user' },
        { label: 'Guest / System', value: 'guest' }
      ]
    },
    {
      name: 'category',
      label: 'Category',
      options: [
        { label: 'All Activities', value: 'all' },
        { label: 'Login Events', value: 'auth' },
        { label: 'Booking Events', value: 'booking' },
        { label: 'Admin Updates', value: 'admin' },
        { label: 'Content Changes', value: 'content' }
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Premium Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Terminal className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Security Audit Trail
            </div>
            <h1 className="text-3xl font-bold tracking-tight">System Activity Log</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Monitor logins, booking transitions, administrative configuration shifts, and core CMS updates across the GramSathi network.
            </p>
          </div>
          <button
            onClick={() => tableRef.current?.refresh()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm w-fit self-end md:self-center"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-1 sm:p-2">
        <GenericAdminTable
          ref={tableRef}
          title="Audit Log"
          endpoint="/admin/audit-logs"
          columns={columns}
          filtersConfig={filtersConfig}
        />
      </div>
    </div>
  );
};

export default AdminActivityLogs;
