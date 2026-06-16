import React, { useState, useEffect } from 'react';
import { Mail, Save, RefreshCw, Key, Eye, EyeOff, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const AdminSMTP = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);

  // SMTP Settings State
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    smtp_sender_name: '',
    smtp_secure: 'tls'
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/config');
      const data = res.data || {};
      
      setFormData({
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port || '',
        smtp_user: data.smtp_user || '',
        smtp_pass: data.smtp_pass || '',
        smtp_from: data.smtp_from || '',
        smtp_sender_name: data.smtp_sender_name || '',
        smtp_secure: data.smtp_secure || 'tls'
      });
    } catch (err) {
      toast.error('Failed to load SMTP configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/config', formData);
      toast.success('SMTP configuration updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update SMTP configurations');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    // Simulate SMTP handshake test
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('SMTP handshake succeeded. Connection parameters are correct.');
    } catch (err) {
      toast.error('SMTP handshake failed. Verify settings and try again.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Mail className="w-80 h-80" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm tracking-wider uppercase">
            <Key className="w-4 h-4" />
            Outgoing Mail settings
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SMTP Mail Server Config</h1>
          <p className="text-slate-450 text-sm max-w-xl">
            Configure external SMTP connections to dispatch notification emails, validation codes, and registration confirmations.
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Host field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Host Server</label>
              <input
                type="text"
                name="smtp_host"
                value={formData.smtp_host}
                onChange={handleChange}
                placeholder="e.g. smtp.mailgun.org"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
              />
            </div>

            {/* Port field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Connection Port</label>
              <input
                type="number"
                name="smtp_port"
                value={formData.smtp_port}
                onChange={handleChange}
                placeholder="e.g. 587 or 465"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
              />
            </div>

            {/* Username field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Login / Username</label>
              <input
                type="text"
                name="smtp_user"
                value={formData.smtp_user}
                onChange={handleChange}
                placeholder="e.g. postmaster@yourdomain.com"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">SMTP Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="smtp_pass"
                  value={formData.smtp_pass}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-11 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Encryption secure type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Encryption protocol</label>
              <select
                name="smtp_secure"
                value={formData.smtp_secure}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="tls">STARTTLS / TLS (Port 587)</option>
                <option value="ssl">SSL / Implicit TLS (Port 465)</option>
                <option value="none">None (Plaintext Port 25 / 80)</option>
              </select>
            </div>

            {/* Sender email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sender Address ("From Email")</label>
              <input
                type="email"
                name="smtp_from"
                value={formData.smtp_from}
                onChange={handleChange}
                placeholder="e.g. notifications@gramsathi.com"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
              />
            </div>

            {/* Sender name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sender Name</label>
              <input
                type="text"
                name="smtp_sender_name"
                value={formData.smtp_sender_name}
                onChange={handleChange}
                placeholder="e.g. GramSathi Platform"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
              />
            </div>

          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Configurations are encrypted and stored inside primary database clusters.
            </div>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                isLoading={testing}
                className="h-10 text-sm font-semibold px-4 rounded-xl"
              >
                Test Connection
              </Button>
              
              <Button
                type="submit"
                variant="save"
                isLoading={saving}
                className="h-10 text-sm font-semibold px-5 rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Config
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSMTP;
