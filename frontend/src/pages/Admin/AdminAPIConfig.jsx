import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Key, ShieldCheck, HelpCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const API_GROUPS = [
  {
    title: 'Geographic Map Integrations',
    description: 'Provide keys for Google Maps API to support village service search maps and path routing.',
    fields: [
      { key: 'map_api_key', label: 'Google Maps Web API Key', placeholder: 'AIzaSy...', isSecret: true }
    ]
  },
  {
    title: 'Mobile Push Notifications',
    description: 'Settings for Firebase Cloud Messaging (FCM) credentials to dispatch transaction and security triggers.',
    fields: [
      { key: 'fcm_server_key', label: 'Firebase Server Key (Legacy / V1 Token)', placeholder: 'AAAA...', isSecret: true },
      { key: 'fcm_sender_id', label: 'FCM Sender ID / Project ID', placeholder: 'e.g. 1029384756', isSecret: false }
    ]
  },
  {
    title: 'Weather and Mandi APIs',
    description: 'Settings for synchronizing real-time agricultural mandi commodity prices and daily local weather forecasts.',
    fields: [
      { key: 'weather_api_key', label: 'OpenWeatherMap API Key', placeholder: 'e.g. f0129abc...', isSecret: true },
      { key: 'mandi_api_token', label: 'Govt. Open Data (Data.gov.in) Mandi API Key', placeholder: 'e.g. d68a12...', isSecret: true }
    ]
  },
  {
    title: 'SMS OTP Dispatch Gateway',
    description: 'Provide Twilio or local gateway configuration endpoints to deliver verification codes.',
    fields: [
      { key: 'sms_gateway_sid', label: 'SMS Gateway Account SID', placeholder: 'AC...', isSecret: false },
      { key: 'sms_gateway_token', label: 'SMS Gateway Auth Token / API Key', placeholder: 'e.g. auth_secret_key...', isSecret: true }
    ]
  }
];

const AdminAPIConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});

  // API Config State
  const [formData, setFormData] = useState({});

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/config');
      const data = res.data || {};
      
      const initialForm = {};
      API_GROUPS.forEach(group => {
        group.fields.forEach(field => {
          initialForm[field.key] = data[field.key] || '';
        });
      });
      setFormData(initialForm);
    } catch (err) {
      toast.error('Failed to load API configurations');
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

  const toggleVisibility = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/config', formData);
      toast.success('API configurations updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save configuration settings');
    } finally {
      setSaving(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-violet-850 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Settings className="w-80 h-80" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm tracking-wider uppercase">
            <Key className="w-4 h-4" />
            Integration Settings
          </div>
          <h1 className="text-3xl font-bold tracking-tight">API Gateways Configuration</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Configure integration endpoints, auth tokens, Google Maps keys, and notification triggers for third-party systems.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {API_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{group.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map(field => {
                  const hasValue = !!formData[field.key];
                  const isVisible = showSecrets[field.key];
                  return (
                    <div key={field.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {field.label}
                        </label>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          hasValue 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {hasValue ? 'Set' : 'Missing'}
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type={field.isSecret && !isVisible ? 'password' : 'text'}
                          name={field.key}
                          value={formData[field.key]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium font-mono text-sm"
                        />
                        {field.isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleVisibility(field.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                          >
                            {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Authentication keys are masked and encrypted client-to-server.
          </span>
          
          <Button
            type="submit"
            variant="save"
            isLoading={saving}
            className="h-10 text-sm font-semibold px-6 rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Credentials
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminAPIConfig;
