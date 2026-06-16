import React, { useState, useRef } from 'react';
import { Send, BellOff } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import GenericAdminTable from './GenericAdminTable';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const tableRef = useRef();

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      setSuccessMsg('');
      const response = await api.post('/admin/notifications/broadcast', { title, message, targetRole });
      toast.success('Broadcast sent successfully!');
      setSuccessMsg(response.data.message);
      setTitle('');
      setMessage('');
      setTargetRole('all');
      tableRef.current?.refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBroadcast = async (row) => {
    try {
      await api.delete(`/admin/notifications/${row._id}`);
      toast.success('Broadcast deleted from history');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete broadcast');
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', width: '25%' },
    { field: 'message', headerName: 'Message Body', width: '45%' },
    { 
      field: 'createdAt', 
      headerName: 'Broadcasted At', 
      width: '30%', 
      renderCell: ({ value }) => value ? new Date(value).toLocaleString() : 'N/A' 
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-slate-500 mt-1">Manage and broadcast push notifications</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Broadcast System Notification</h2>
              <p className="text-sm text-slate-500 mb-6">
                Send a push notification alert to all users or specific roles across the platform.
              </p>

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium animate-in fade-in">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Audience</label>
                  <select 
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)} 
                  >
                    <option value="all">All Users</option>
                    <option value="user">Standard Users Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Notification Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message Body <span className="text-rose-500">*</span></label>
                  <textarea 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    rows={5} 
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    variant="approve"
                    isLoading={loading}
                    className="flex items-center"
                  >
                    {loading ? 'Broadcasting...' : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Broadcast
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-sky-50 rounded-2xl border border-sky-100 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-sky-900 mb-4">Best Practices</h2>
              <ul className="space-y-4 text-sky-800 text-sm">
                <li className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  <p>Keep titles short and actionable (e.g., "New Update Available" or "Scheduled Maintenance").</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  <p>Avoid spamming users; only broadcast critical platform updates or major announcements.</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  <p>Target roles specifically instead of broadcasting to everyone when the message is only relevant to a subset of users.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <GenericAdminTable
          ref={tableRef}
          title="Broadcast History"
          endpoint="/admin/notifications"
          columns={columns}
          onDelete={handleDeleteBroadcast}
        />
      </div>
    </div>
  );
};

export default AdminNotifications;
