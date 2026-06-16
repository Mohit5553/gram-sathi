import React, { useState, useRef } from 'react';
import GenericAdminTable from './GenericAdminTable';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, X, Eye, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminVerifications = () => {
  const tableRef = useRef();
  
  // Document preview modal state
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Rejection modal state
  const [rejectionUserId, setRejectionUserId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/verifications/${id}/approve`);
      toast.success('Provider verification approved and badge activated!');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve verification');
    }
  };

  const handleSuspend = async (id) => {
    try {
      await api.put(`/admin/verifications/${id}/suspend`);
      toast.success('Provider privileges and verification badge suspended.');
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend verification');
    }
  };

  const handleOpenRejectModal = (id) => {
    setRejectionUserId(id);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      setRejecting(true);
      await api.put(`/admin/verifications/${rejectionUserId}/reject`, { rejectionReason });
      toast.success('Verification request rejected.');
      setIsRejectModalOpen(false);
      tableRef.current?.refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject verification');
    } finally {
      setRejecting(false);
    }
  };

  const handlePreviewDocument = (url, title) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
  };

  const columns = [
    { field: 'name', headerName: 'Provider Name', width: '15%' },
    { field: 'email', headerName: 'Email Address', width: '18%' },
    { field: 'mobile', headerName: 'Mobile Number', width: '12%', renderCell: ({ value }) => value || 'N/A' },
    {
      field: 'aadhaarCard',
      headerName: 'Aadhaar Card',
      width: '12%',
      renderCell: ({ row }) => {
        const url = row.verification?.aadhaarCard;
        if (!url) return <span className="text-slate-400 text-xs">Not Uploaded</span>;
        return (
          <Button
            variant="view"
            size="sm"
            onClick={() => handlePreviewDocument(url, `${row.name}'s Aadhaar Card`)}
            className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded h-7 text-white"
          >
            <Eye size={12} />
            View
          </Button>
        );
      }
    },
    {
      field: 'panCard',
      headerName: 'PAN Card (Opt)',
      width: '12%',
      renderCell: ({ row }) => {
        const url = row.verification?.panCard;
        if (!url) return <span className="text-slate-400 text-xs">Not Uploaded</span>;
        return (
          <Button
            variant="view"
            size="sm"
            onClick={() => handlePreviewDocument(url, `${row.name}'s PAN Card`)}
            className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded h-7 text-white"
          >
            <Eye size={12} />
            View
          </Button>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: '12%',
      renderCell: ({ row }) => {
        const status = row.verification?.status || 'unsubmitted';
        let bgColor = 'bg-slate-100 text-slate-800';
        if (status === 'approved') bgColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        else if (status === 'pending') bgColor = 'bg-amber-100 text-amber-800 border-amber-200';
        else if (status === 'rejected') bgColor = 'bg-rose-100 text-rose-800 border-rose-200';
        else if (status === 'suspended') bgColor = 'bg-red-100 text-red-800 border-red-200';

        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${bgColor}`}>
            {status}
          </span>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: '19%',
      renderCell: ({ row }) => {
        const status = row.verification?.status;
        return (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {status !== 'approved' && (
              <Button
                variant="approve"
                size="sm"
                onClick={() => handleApprove(row._id)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg h-7"
                title="Approve Profile"
              >
                <Check size={12} />
                Approve
              </Button>
            )}
            {status !== 'rejected' && status !== 'approved' && (
              <Button
                variant="reject"
                size="sm"
                onClick={() => handleOpenRejectModal(row._id)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg h-7 text-white"
                title="Reject Request"
              >
                <X size={12} />
                Reject
              </Button>
            )}
            {status === 'approved' && (
              <Button
                variant="reject"
                size="sm"
                onClick={() => handleSuspend(row._id)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg h-7 text-white"
                title="Suspend Profile"
              >
                <ShieldAlert size={12} />
                Suspend
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const filtersConfig = [
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Submissions' },
        { value: 'pending', label: 'Pending Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'suspended', label: 'Suspended' }
      ]
    }
  ];

  return (
    <>
      <GenericAdminTable
        ref={tableRef}
        title="Provider Verifications"
        endpoint="/admin/verifications"
        columns={columns}
        filtersConfig={filtersConfig}
      />

      {/* Document View Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">{previewTitle}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewUrl('')}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 h-8 w-8 rounded-lg animate-none"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 flex items-center justify-center bg-slate-50 min-h-[300px]">
              <img
                src={previewUrl}
                alt="Document Preview"
                className="max-h-[500px] w-auto object-contain rounded border border-slate-200 shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-slate-150">
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-rose-50/50">
              <h3 className="font-bold text-slate-800 text-md flex items-center gap-1.5 text-rose-700">
                <ShieldAlert className="w-4 h-4" />
                Reject Verification Request
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors h-8 w-8 rounded-lg animate-none"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Reason for Rejection"
                placeholder="e.g. Uploaded Aadhaar card image is blurry or illegible."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button variant="cancel" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="reject"
                onClick={handleRejectConfirm}
                isLoading={rejecting}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminVerifications;
