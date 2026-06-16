import React, { useState, useRef } from 'react';
import GenericAdminTable from './GenericAdminTable';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { X, Trash2, Edit2, ShieldAlert, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';

// ==========================================
// COMMON MODAL COMPONENTS
// ==========================================

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', isDanger = true }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 relative z-10 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="cancel" size="sm">
            Cancel
          </Button>
          <Button 
            onClick={() => { onConfirm(); onClose(); }} 
            variant={isDanger ? 'delete' : 'save'}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1. ADMIN USERS
// ==========================================

export const AdminUsers = () => {
  const tableRef = useRef();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // User form state
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', role: 'user', village: '', district: '', state: '', status: 'active' });

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role: user.role || 'user',
      village: user.village || '',
      district: user.district || '',
      state: user.state || '',
      status: user.status || 'active'
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${selectedUser._id}`, formData);
      toast.success('User updated successfully');
      setIsEditOpen(false);
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/users/${selectedUser._id}`);
      toast.success('User deleted successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: '20%' },
    { field: 'mobile', headerName: 'Mobile', width: '15%' },
    { field: 'email', headerName: 'Email', width: '20%' },
    { field: 'role', headerName: 'Role', width: '10%', renderCell: ({ value }) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${value === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'}`}>
        {value}
      </span>
    )},
    { field: 'village', headerName: 'Village', width: '15%' },
    { field: 'status', headerName: 'Status', width: '10%', renderCell: ({ value }) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${value === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
        {value}
      </span>
    )},
    { field: 'createdAt', headerName: 'Joined', width: '10%', renderCell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A' }
  ];

  const filtersConfig = [
    { 
      name: 'role', 
      label: 'Role', 
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ] 
    },
    { 
      name: 'status', 
      label: 'Status', 
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'banned', label: 'Banned' }
      ] 
    }
  ];

  return (
    <>
      <GenericAdminTable 
        ref={tableRef} 
        title="Users" 
        endpoint="/admin/users" 
        columns={columns} 
        filtersConfig={filtersConfig}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Edit User Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Edit User Profile</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mobile</label>
                  <input type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="user">User</option>
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Village</label>
                  <input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button type="button" onClick={() => setIsEditOpen(false)} variant="cancel" size="sm">Cancel</Button>
                <Button type="submit" variant="save" size="sm">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      <ConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to permanently delete user ${selectedUser?.name}? This action cannot be undone.`}
      />
    </>
  );
};

// ==========================================
// 2. ADMIN PROVIDERS
// ==========================================

export const AdminProviders = () => {
  const tableRef = useRef();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/providers/${id}/status`, { status: newStatus });
      toast.success('Provider status updated successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteClick = (provider) => {
    setSelectedProvider(provider);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/providers/${selectedProvider._id}`);
      toast.success('Provider and associated services deleted successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete provider');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: '20%' },
    { field: 'mobile', headerName: 'Mobile', width: '15%' },
    { field: 'village', headerName: 'Village', width: '15%' },
    { field: 'status', headerName: 'Status', width: '15%', renderCell: ({ value }) => {
        let bgColor = 'bg-slate-100 text-slate-800';
        if(value === 'active') bgColor = 'bg-emerald-100 text-emerald-800';
        else if(value === 'inactive') bgColor = 'bg-amber-100 text-amber-800';
        else if(value === 'banned') bgColor = 'bg-rose-100 text-rose-800';
        else if(value === 'pending') bgColor = 'bg-blue-100 text-blue-800';
        
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${bgColor}`}>
            {value}
          </span>
        );
    }},
    { field: 'createdAt', headerName: 'Registered', width: '15%', renderCell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A' },
    { field: 'actions', headerName: 'Update Status', width: '20%', renderCell: ({ row }) => (
      <select
        value={row.status}
        onChange={(e) => handleStatusChange(row._id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="block py-1.5 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none text-xs font-medium"
      >
        <option value="pending">Pending</option>
        <option value="active">Active (Approve)</option>
        <option value="inactive">Inactive (Suspend)</option>
        <option value="banned">Ban</option>
      </select>
    )}
  ];

  const filtersConfig = [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'banned', label: 'Banned' }
      ]
    }
  ];

  return (
    <>
      <GenericAdminTable 
        ref={tableRef} 
        title="Service Providers" 
        endpoint="/admin/providers" 
        columns={columns} 
        filtersConfig={filtersConfig}
        onDelete={handleDeleteClick}
      />

      <ConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Provider"
        message={`Are you sure you want to permanently delete service provider ${selectedProvider?.name}? This will also remove all their active machinery and labour listings.`}
      />
    </>
  );
};

// ==========================================
// 3. ADMIN BOOKINGS
// ==========================================

export const AdminBookings = () => {
  const tableRef = useRef();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: newStatus });
      toast.success('Booking status updated successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleDeleteClick = (booking) => {
    setSelectedBooking(booking);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/bookings/${selectedBooking._id}`);
      toast.success('Booking record deleted successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const columns = [
    { field: 'user', headerName: 'Customer Name', width: '15%', renderCell: ({ row }) => row?.user?.name || 'Unknown' },
    { field: 'serviceType', headerName: 'Service Type', width: '12%', renderCell: ({ value }) => <span className="capitalize">{value}</span> },
    { field: 'bookingDate', headerName: 'Booking Date', width: '15%', renderCell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A' },
    { field: 'durationHours', headerName: 'Duration', width: '10%', renderCell: ({ value }) => `${value || 0} Hours` },
    { field: 'totalAmount', headerName: 'Amount', width: '10%', renderCell: ({ value }) => `₹${value || 0}` },
    { field: 'status', headerName: 'Status', width: '15%', renderCell: ({ value }) => {
        let bgColor = 'bg-slate-100 text-slate-800';
        if(value === 'completed') bgColor = 'bg-emerald-100 text-emerald-800';
        else if(value === 'cancelled' || value === 'rejected') bgColor = 'bg-rose-100 text-rose-800';
        else if(value === 'pending') bgColor = 'bg-amber-100 text-amber-800';
        else if(value === 'accepted') bgColor = 'bg-sky-100 text-sky-800';
        else if(value === 'in_progress') bgColor = 'bg-blue-100 text-blue-800';
        
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${bgColor}`}>
            {value?.replace('_', ' ')}
          </span>
        );
    }},
    { field: 'actions', headerName: 'Override Status', width: '15%', renderCell: ({ row }) => (
      <select
        value={row.status}
        onChange={(e) => handleStatusChange(row._id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="block py-1.5 px-2.5 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none text-xs font-medium"
      >
        <option value="pending">Pending</option>
        <option value="accepted">Accepted</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="rejected">Rejected</option>
      </select>
    )}
  ];

  const filtersConfig = [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      name: 'serviceType',
      label: 'Service',
      options: [
        { value: 'all', label: 'All Services' },
        { value: 'tractor', label: 'Tractor' },
        { value: 'jcb', label: 'JCB' },
        { value: 'labour', label: 'Labour' },
        { value: 'electrician', label: 'Electrician' },
        { value: 'plumber', label: 'Plumber' }
      ]
    }
  ];

  return (
    <>
      <GenericAdminTable 
        ref={tableRef} 
        title="Bookings" 
        endpoint="/admin/bookings" 
        columns={columns} 
        filtersConfig={filtersConfig}
        onDelete={handleDeleteClick}
      />

      <ConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Booking Record"
        message="Are you sure you want to permanently delete this booking log? This will remove all associated timeline history."
      />
    </>
  );
};

// ==========================================
// 4. ADMIN SCHEMES (WITH CREATION & EDIT MODALS)
// ==========================================

export const AdminSchemes = () => {
  const tableRef = useRef();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({ title: '', department: '', eligibility: '', benefits: '', detailsUrl: '', deadline: '', status: 'active' });

  const handleAddClick = () => {
    setSelectedScheme(null);
    setFormData({ title: '', department: '', eligibility: '', benefits: '', detailsUrl: '', deadline: '', status: 'active' });
    setIsFormOpen(true);
  };

  const handleEditClick = (scheme) => {
    setSelectedScheme(scheme);
    setFormData({
      title: scheme.title || '',
      department: scheme.department || '',
      eligibility: scheme.eligibility || '',
      benefits: scheme.benefits || '',
      detailsUrl: scheme.detailsUrl || '',
      deadline: scheme.deadline ? new Date(scheme.deadline).toISOString().substring(0, 10) : '',
      status: scheme.status || 'active'
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (scheme) => {
    setSelectedScheme(scheme);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedScheme) {
        // Edit mode
        await api.put(`/schemes/${selectedScheme._id}`, formData);
        toast.success('Scheme updated successfully');
      } else {
        // Create mode
        await api.post('/schemes', formData);
        toast.success('Scheme created successfully');
      }
      setIsFormOpen(false);
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save scheme');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/schemes/${selectedScheme._id}`);
      toast.success('Scheme deleted successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete scheme');
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', width: '30%' },
    { field: 'department', headerName: 'Department', width: '25%' },
    { field: 'deadline', headerName: 'Deadline', width: '20%', renderCell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A' },
    { field: 'status', headerName: 'Status', width: '25%', renderCell: ({ value }) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${value === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
        {value}
      </span>
    )}
  ];

  return (
    <>
      <GenericAdminTable 
        ref={tableRef} 
        title="Government Schemes" 
        endpoint="/schemes" 
        columns={columns} 
        onAdd={handleAddClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{selectedScheme ? 'Edit Government Scheme' : 'Add New Government Scheme'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deadline Date</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Eligibility Criteria</label>
                <textarea value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} rows={2} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Benefits</label>
                <textarea value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} rows={2} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">External Details Link</label>
                  <input type="url" placeholder="https://" value={formData.detailsUrl} onChange={e => setFormData({...formData, detailsUrl: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button type="button" onClick={() => setIsFormOpen(false)} variant="cancel" size="sm">Cancel</Button>
                <Button type="submit" variant="save" size="sm">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Scheme Confirmation */}
      <ConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Government Scheme"
        message={`Are you sure you want to permanently delete scheme "${selectedScheme?.title}"? Users will no longer be able to bookmark it.`}
      />
    </>
  );
};

// ==========================================
// 5. ADMIN EMERGENCY CONTACTS (WITH CRUD)
// ==========================================

export const AdminEmergency = () => {
  const tableRef = useRef();
  const [selectedContact, setSelectedContact] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({ name: '', number: '', category: 'Police', village: '', status: 'active' });

  const handleAddClick = () => {
    setSelectedContact(null);
    setFormData({ name: '', number: '', category: 'Police', village: '', status: 'active' });
    setIsFormOpen(true);
  };

  const handleEditClick = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      number: contact.number || '',
      category: contact.category || 'Police',
      village: contact.village || '',
      status: contact.status || 'active'
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (contact) => {
    setSelectedContact(contact);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContact) {
        await api.put(`/admin/emergency/${selectedContact._id}`, formData);
        toast.success('Contact updated successfully');
      } else {
        await api.post('/admin/emergency', formData);
        toast.success('Contact created successfully');
      }
      setIsFormOpen(false);
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/emergency/${selectedContact._id}`);
      toast.success('Contact deleted successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Contact Name', width: '30%' },
    { field: 'category', headerName: 'Category', width: '20%' },
    { field: 'number', headerName: 'Phone Number', width: '20%' },
    { field: 'village', headerName: 'Village', width: '15%' },
    { field: 'status', headerName: 'Status', width: '15%', renderCell: ({ value }) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${value === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
        {value}
      </span>
    )}
  ];

  const filtersConfig = [
    {
      name: 'category',
      label: 'Category',
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'Police', label: 'Police' },
        { value: 'Ambulance', label: 'Ambulance' },
        { value: 'Fire', label: 'Fire' },
        { value: 'Hospital', label: 'Hospital' },
        { value: 'Disaster Management', label: 'Disaster Management' },
        { value: 'Gram Panchayat', label: 'Gram Panchayat' },
        { value: 'Electricity', label: 'Electricity' },
        { value: 'Water Supply', label: 'Water Supply' }
      ]
    }
  ];

  return (
    <>
      <GenericAdminTable 
        ref={tableRef} 
        title="Emergency Contacts" 
        endpoint="/admin/emergency" 
        columns={columns} 
        filtersConfig={filtersConfig}
        onAdd={handleAddClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{selectedContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input type="text" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="Police">Police</option>
                    <option value="Ambulance">Ambulance</option>
                    <option value="Fire">Fire Department</option>
                    <option value="Hospital">Hospital/Clinic</option>
                    <option value="Disaster Management">Disaster Management</option>
                    <option value="Gram Panchayat">Gram Panchayat</option>
                    <option value="Electricity">Electricity Dept</option>
                    <option value="Water Supply">Water Supply Dept</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Village/Town Limit</label>
                <input type="text" placeholder="e.g. All India, Local village" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button type="button" onClick={() => setIsFormOpen(false)} variant="cancel" size="sm">Cancel</Button>
                <Button type="submit" variant="save" size="sm">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Emergency Contact"
        message={`Are you sure you want to permanently delete emergency contact "${selectedContact?.name}"?`}
      />
    </>
  );
};

// ==========================================
// 6. ADMIN LOST & FOUND MANAGEMENT
// ==========================================

export const AdminLostFound = () => {
  const tableRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/lost-found/${id}`, { status: newStatus });
      toast.success('Report status updated successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update report status');
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/lost-found/${selectedItem._id}`);
      toast.success('Report deleted successfully');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report');
    }
  };

  const columns = [
    { field: 'title', headerName: 'Item Title', width: '25%' },
    { field: 'type', headerName: 'Type', width: '10%', renderCell: ({ value }) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${value === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
        {value}
      </span>
    )},
    { field: 'location', headerName: 'Location', width: '20%' },
    { field: 'contactName', headerName: 'Reporter', width: '15%' },
    { field: 'status', headerName: 'Status', width: '15%', renderCell: ({ row, value }) => (
      <select
        value={value}
        onChange={(e) => handleStatusChange(row._id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="block py-1 py-2 border border-slate-300 bg-white rounded-md text-xs font-medium"
      >
        <option value="open">Open</option>
        <option value="resolved">Resolved</option>
      </select>
    )},
    { field: 'createdAt', headerName: 'Reported Date', width: '15%', renderCell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A' }
  ];

  const filtersConfig = [
    {
      name: 'type',
      label: 'Type',
      options: [
        { value: 'all', label: 'All' },
        { value: 'lost', label: 'Lost' },
        { value: 'found', label: 'Found' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All' },
        { value: 'open', label: 'Open' },
        { value: 'resolved', label: 'Resolved' }
      ]
    }
  ];

  return (
    <>
      <GenericAdminTable 
        ref={tableRef} 
        title="Lost & Found Items" 
        endpoint="/admin/lost-found" 
        columns={columns} 
        filtersConfig={filtersConfig}
        onDelete={handleDeleteClick}
      />

      <ConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lost & Found Report"
        message={`Are you sure you want to permanently delete the report for "${selectedItem?.title}"?`}
      />
    </>
  );
};

// ==========================================
// 7. PLATFORM SPECIFIC LISTINGS TABLES (READ-ONLY)
// ==========================================

export const AdminTractors = () => {
  const columns = [
    { field: 'tractorType', headerName: 'Tractor Model', width: '25%' },
    { field: 'brand', headerName: 'Brand', width: '20%' },
    { field: 'ratePerHour', headerName: 'Rate / Hour', width: '15%', renderCell: ({ value }) => `₹${value}` },
    { field: 'village', headerName: 'Village', width: '20%' },
    { field: 'isAvailable', headerName: 'Available', width: '20%', renderCell: ({ value }) => value ? (
      <span className="text-emerald-600 font-bold">Yes</span>
    ) : (
      <span className="text-slate-400 font-medium">No</span>
    ) }
  ];
  return <GenericAdminTable title="Tractor Machinery Listings" endpoint="/tractor" columns={columns} />;
};

export const AdminJCB = () => {
  const columns = [
    { field: 'village', headerName: 'Village', width: '30%' },
    { field: 'ratePerHour', headerName: 'Rate / Hour', width: '25%', renderCell: ({ value }) => `₹${value}` },
    { field: 'rating', headerName: 'Rating', width: '25%', renderCell: ({ value }) => `★ ${value || '0'}` },
    { field: 'isAvailable', headerName: 'Available', width: '20%', renderCell: ({ value }) => value ? (
      <span className="text-emerald-600 font-bold">Yes</span>
    ) : (
      <span className="text-slate-400 font-medium">No</span>
    ) }
  ];
  return <GenericAdminTable title="JCB Heavy Machinery Listings" endpoint="/jcb" columns={columns} />;
};

export const AdminLabour = () => {
  const columns = [
    { field: 'village', headerName: 'Village', width: '25%' },
    { field: 'skill', headerName: 'Skill Specialty', width: '30%' },
    { field: 'dailyRate', headerName: 'Daily Rate', width: '25%', renderCell: ({ value }) => `₹${value}` },
    { field: 'isAvailable', headerName: 'Available', width: '20%', renderCell: ({ value }) => value ? (
      <span className="text-emerald-600 font-bold">Yes</span>
    ) : (
      <span className="text-slate-400 font-medium">No</span>
    ) }
  ];
  return <GenericAdminTable title="Labour Profiles" endpoint="/labour" columns={columns} />;
};

export const AdminElectrician = () => {
  const columns = [
    { field: 'village', headerName: 'Village', width: '30%' },
    { field: 'visitCharge', headerName: 'Callout Fee', width: '25%', renderCell: ({ value }) => `₹${value}` },
    { field: 'experienceYears', headerName: 'Experience', width: '25%', renderCell: ({ value }) => `${value} Yrs` },
    { field: 'isAvailable', headerName: 'Available', width: '20%', renderCell: ({ value }) => value ? (
      <span className="text-emerald-600 font-bold">Yes</span>
    ) : (
      <span className="text-slate-400 font-medium">No</span>
    ) }
  ];
  return <GenericAdminTable title="Electrician Profiles" endpoint="/electrician" columns={columns} />;
};

export const AdminPlumber = () => {
  const columns = [
    { field: 'village', headerName: 'Village', width: '30%' },
    { field: 'visitCharge', headerName: 'Callout Fee', width: '25%', renderCell: ({ value }) => `₹${value}` },
    { field: 'experienceYears', headerName: 'Experience', width: '25%', renderCell: ({ value }) => `${value} Yrs` },
    { field: 'isAvailable', headerName: 'Available', width: '20%', renderCell: ({ value }) => value ? (
      <span className="text-emerald-600 font-bold">Yes</span>
    ) : (
      <span className="text-slate-400 font-medium">No</span>
    ) }
  ];
  return <GenericAdminTable title="Plumber Profiles" endpoint="/plumber" columns={columns} />;
};
