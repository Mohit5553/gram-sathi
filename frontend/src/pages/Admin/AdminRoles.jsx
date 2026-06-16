import React, { useState, useRef } from 'react';
import { Shield, Key, Check, Plus, AlertCircle, RefreshCw, X, ShieldAlert, Award } from 'lucide-react';
import GenericAdminTable from './GenericAdminTable';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const PREDEFINED_PERMISSIONS = [
  { value: 'manage_users', label: 'Manage Users & Admins', description: 'Allows editing user accounts, upgrading roles, and managing statuses.' },
  { value: 'manage_content', label: 'Manage Content', description: 'Allows editing schemes, emergency contacts, noticeboards, and CMS pages.' },
  { value: 'system_config', label: 'System Configuration', description: 'Access to SMTP mail server settings and external third-party API keys.' },
  { value: 'database_backups', label: 'Database Backups', description: 'Access to manual backups, restorations, archive uploads, and deletions.' },
  { value: 'audit_trails', label: 'Security Audit Logs', description: 'Allows viewing and exporting the system security logs.' }
];

const AdminRoles = () => {
  const tableRef = useRef();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [userRole, setUserRole] = useState('user');
  const [userStatus, setUserStatus] = useState('active');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [newCustomPermission, setNewCustomPermission] = useState('');

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setUserRole(user.role || 'user');
    setUserStatus(user.status || 'active');
    setSelectedPermissions(user.permissions || []);
    setNewCustomPermission('');
    setIsEditOpen(true);
  };

  const togglePermission = (perm) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const addCustomPermission = (e) => {
    e.preventDefault();
    const formatted = newCustomPermission.trim().toLowerCase().replace(/\s+/g, '_');
    if (!formatted) return;

    if (selectedPermissions.includes(formatted)) {
      toast.error('Permission already added');
      return;
    }

    setSelectedPermissions(prev => [...prev, formatted]);
    setNewCustomPermission('');
    toast.success(`Custom permission "${formatted}" added`);
  };

  const removeCustomPermission = (perm) => {
    setSelectedPermissions(prev => prev.filter(p => p !== perm));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/users/${selectedUser._id}`, {
        role: userRole,
        status: userStatus,
        permissions: selectedPermissions
      });
      toast.success('User roles & permissions updated successfully');
      setIsEditOpen(false);
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user security profile');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'User Details', 
      width: '25%',
      renderCell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.name || 'Unnamed User'}</span>
          <span className="text-xs text-slate-500">{row.email}</span>
        </div>
      )
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: '15%', 
      renderCell: ({ value }) => {
        let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-200';
        if (value === 'super_admin') {
          badgeStyle = 'bg-purple-100 text-purple-800 border-purple-200';
        } else if (value === 'admin') {
          badgeStyle = 'bg-indigo-100 text-indigo-800 border-indigo-200';
        } else if (value === 'provider') {
          badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
            {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
          </span>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: '15%',
      renderCell: ({ value }) => {
        let badgeStyle = 'bg-emerald-105 text-emerald-800 border-emerald-200';
        if (value === 'suspended') {
          badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
        } else if (value === 'blocked' || value === 'banned') {
          badgeStyle = 'bg-rose-100 text-rose-800 border-rose-200';
        }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    { 
      field: 'permissions', 
      headerName: 'Assigned Permissions', 
      width: '35%',
      renderCell: ({ value }) => {
        if (!value || value.length === 0) {
          return <span className="text-xs text-slate-400 font-mono">No direct permissions</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[320px] max-h-16 overflow-y-auto">
            {value.map(perm => (
              <span key={perm} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-50 text-slate-600 border border-slate-100">
                {perm}
              </span>
            ))}
          </div>
        );
      }
    }
  ];

  const filtersConfig = [
    {
      name: 'role',
      label: 'Role',
      options: [
        { label: 'All Roles', value: 'all' },
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Provider', value: 'provider' },
        { label: 'User', value: 'user' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Blocked', value: 'blocked' }
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Shield className="w-80 h-80" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm tracking-wider uppercase">
            <Award className="w-4 h-4" />
            Security & Controls
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Configure system roles, granularly toggle permission matrices, and manage account statuses across all admins, providers, and customer profiles.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-1 sm:p-2">
        <GenericAdminTable
          ref={tableRef}
          title="Role & Permission"
          endpoint="/admin/users"
          columns={columns}
          filtersConfig={filtersConfig}
          onEdit={handleEditClick}
        />
      </div>

      {/* Slide-out / Popover Modal for Editing Permissions */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Configure Security Profile</h3>
                  <p className="text-xs text-slate-500">Modifying profile for: <span className="font-semibold text-slate-700">{selectedUser.name}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="py-6 space-y-6">
              
              {/* Role & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Account Status</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Predefined Permissions Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Enterprise Permissions Matrix</label>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                  {PREDEFINED_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.value);
                    return (
                      <label 
                        key={perm.value} 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked 
                          ? 'bg-white border-indigo-200 shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-slate-100/70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.value)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="space-y-0.5">
                          <span className="text-sm font-semibold text-slate-800">{perm.label}</span>
                          <p className="text-xs text-slate-500">{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Permission tags section */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Custom Permissions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomPermission}
                    onChange={(e) => setNewCustomPermission(e.target.value)}
                    placeholder="e.g. manage_mandi_prices"
                    className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button type="button" variant="outline" onClick={addCustomPermission} size="sm" className="h-9 px-4 rounded-lg">
                    <Plus className="w-4 h-4 mr-1.5" /> Add
                  </Button>
                </div>

                {/* Custom permissions list */}
                {selectedPermissions.filter(p => !PREDEFINED_PERMISSIONS.some(pre => pre.value === p)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedPermissions
                      .filter(p => !PREDEFINED_PERMISSIONS.some(pre => pre.value === p))
                      .map((perm) => (
                        <span 
                          key={perm} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {perm}
                          <button 
                            type="button" 
                            onClick={() => removeCustomPermission(perm)}
                            className="text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" onClick={() => setIsEditOpen(false)} variant="cancel" size="sm">
                  Cancel
                </Button>
                <Button type="submit" variant="update" size="sm" isLoading={loading}>
                  Save System Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
