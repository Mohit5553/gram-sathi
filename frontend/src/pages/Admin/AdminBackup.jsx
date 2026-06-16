import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Upload, Download, RefreshCw, Trash2, 
  Play, ShieldAlert, Calendar, CheckCircle2, XCircle, HardDrive, FileArchive, Clock 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const AdminBackup = () => {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState({ totalSize: 0, successCount: 0, failedCount: 0, storageUsedHuman: '0.00 MB' });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Restore Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [confirmInput, setConfirmInput] = useState('');

  // Upload state
  const fileInputRef = useRef(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/backups');
      setBackups(res.data.data.reverse() || []);
      setStats(res.data.stats || { totalSize: 0, successCount: 0, failedCount: 0, storageUsedHuman: '0.00 MB' });
    } catch (error) {
      toast.error('Failed to fetch backup ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/admin/backups');
      toast.success(res.data.message || 'Backup created successfully!');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create backup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await api.get(`/admin/backups/download/${filename}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup download started');
    } catch (error) {
      toast.error('Failed to download backup file');
    }
  };

  const openRestoreModal = (backup) => {
    setSelectedBackup(backup);
    setConfirmInput('');
    setConfirmModalOpen(true);
  };

  const handleRestore = async () => {
    if (confirmInput !== 'RESTORE') {
      toast.error('Confirmation mismatch! Please type RESTORE to confirm.');
      return;
    }

    try {
      setActionLoading(true);
      setConfirmModalOpen(false);
      const res = await api.post(`/admin/backups/restore/${selectedBackup.filename}`);
      toast.success(res.data.message || 'System restore completed successfully!');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'System restoration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete backup file: ${filename}?`)) return;

    try {
      setActionLoading(true);
      const res = await api.delete(`/admin/backups/${filename}`);
      toast.success(res.data.message || 'Backup deleted successfully');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete backup file');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.gz')) {
      toast.error('Only compressed backup archives (.json.gz) are allowed');
      return;
    }

    const confirmUpload = window.confirm(
      `WARNING: Uploading and restoring "${file.name}" will completely overwrite the active database collections. Do you want to continue?`
    );
    if (!confirmUpload) return;

    const formData = new FormData();
    formData.append('backup', file);

    try {
      setActionLoading(true);
      const res = await api.post('/admin/backups/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(res.data.message || 'Backup uploaded and system restored successfully!');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload and restore backup');
    } finally {
      setActionLoading(false);
      e.target.value = '';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Database className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Backup & Recovery</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Export database collection archives, monitor logs, and restore the system state. Restoring from a backup will overwrite active collections.
            </p>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".gz" 
            />
            <Button
              onClick={handleUploadClick}
              variant="secondary"
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-all shadow-sm rounded-xl h-10"
            >
              <Upload className="w-4 h-4" />
              Upload & Restore
            </Button>
            <Button
              onClick={handleCreateBackup}
              variant="primary"
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm transition-all shadow-sm rounded-xl h-10"
            >
              <Play className="w-4 h-4" />
              Backup Now
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Storage Used</div>
            <div className="text-2xl font-bold text-slate-900">{stats.storageUsedHuman}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Successful Backups</div>
            <div className="text-2xl font-bold text-slate-900">{stats.successCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Failed Attempts</div>
            <div className="text-2xl font-bold text-slate-900">{stats.failedCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Scheduler Status</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Daily Automated (2:00 AM)</div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-heading">
            <FileArchive className="w-5 h-5 text-indigo-500" />
            Backup Ledger
          </h2>
          <Button 
            variant="outline"
            size="icon"
            onClick={fetchBackups} 
            className="h-9 w-9 border-slate-200 text-slate-600 p-0"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Timestamp</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Filename</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">File Size</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Trigger Type</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-36 font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-indigo-600"></div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-sans">
                    No backup records found on disk.
                  </td>
                </tr>
              ) : (
                backups.map((row) => (
                  <tr key={row.filename} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(row.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 font-mono">
                      {row.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                      {formatBytes(row.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-mono ${
                        row.triggerType === 'scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {row.triggerType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-mono ${
                        row.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {row.status === 'success' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="view"
                            size="icon"
                            onClick={() => handleDownload(row.filename)}
                            className="w-7 h-7 p-1.5 rounded-lg text-white"
                            title="Download backup file"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="update"
                            size="icon"
                            onClick={() => openRestoreModal(row)}
                            className="w-7 h-7 p-1.5 rounded-lg text-white"
                            title="Restore database from this file"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="delete"
                            size="icon"
                            onClick={() => handleDelete(row.filename)}
                            className="w-7 h-7 p-1.5 rounded-lg text-white"
                            title="Delete backup file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 flex flex-col gap-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600 shrink-0 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-heading">Confirm Database Restoration</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  This action is highly critical. It will completely overwrite the active system database collections with the contents of:
                </p>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs font-mono font-bold text-slate-800 mt-2 select-all break-all">
                  {selectedBackup?.filename}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 font-sans">
                Type the word <span className="text-rose-600 font-extrabold font-mono">RESTORE</span> in all caps to confirm:
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none rounded-xl text-sm font-mono font-bold"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="RESTORE"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="cancel"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="delete"
                onClick={handleRestore}
                disabled={confirmInput !== 'RESTORE'}
                className="text-white"
              >
                Confirm Restore
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackup;
