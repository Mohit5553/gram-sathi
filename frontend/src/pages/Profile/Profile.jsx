import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import UserBookings from '../Bookings/UserBookings';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { 
  Camera, Save, Bell, User as UserIcon, CalendarDays, MapPin, 
  Bookmark, Download, CheckCircle2, Briefcase, UploadCloud, 
  ShieldCheck, ShieldAlert, FileText, Check, Clock, X
} from 'lucide-react';
import LocationSelector from '../../components/common/LocationSelector';
import { usePWA } from '../../context/PWAContext';
import { updateProfile } from '../../redux/authSlice';

const Profile = () => {
  const { isInstallable, isInstalled, install } = usePWA();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    block: '',
    district: '',
    state: ''
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    push: true,
    sms: true,
    email: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [savedSchemes, setSavedSchemes] = useState([]);
  
  const [aadhaarUrl, setAadhaarUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [aadhaarUploading, setAadhaarUploading] = useState(false);
  const [panUploading, setPanUploading] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const data = response.data;
        setProfile(data);
        setFormData({
          name: data.name || '',
          mobile: data.mobile || '',
          village: data.village || '',
          block: data.block || '',
          district: data.district || '',
          state: data.state || ''
        });
        if (data.notificationPreferences) {
          setNotificationPrefs(data.notificationPreferences);
        }
        if (data.verification) {
          setAadhaarUrl(data.verification.aadhaarCard || '');
          setPanUrl(data.verification.panCard || '');
        }
        
        const savedRes = await api.get('/schemes/saved');
        setSavedSchemes(savedRes.data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAadhaarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('images', file);

    try {
      setAadhaarUploading(true);
      const response = await api.post('/upload', imgData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAadhaarUrl(response.data.urls[0]);
      toast.success('Aadhaar Card uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload Aadhaar Card');
    } finally {
      setAadhaarUploading(false);
    }
  };

  const handlePanUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('images', file);

    try {
      setPanUploading(true);
      const response = await api.post('/upload', imgData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPanUrl(response.data.urls[0]);
      toast.success('PAN Card uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload PAN Card');
    } finally {
      setPanUploading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!aadhaarUrl) {
      toast.error('Aadhaar Card image is required.');
      return;
    }

    try {
      setSubmittingVerification(true);
      const response = await api.post('/auth/verify-request', {
        aadhaarCard: aadhaarUrl,
        panCard: panUrl
      });
      setProfile({ ...profile, verification: response.data.verification });
      toast.success('Verification request submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit verification request');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrefChange = async (e) => {
    const updatedPrefs = { ...notificationPrefs, [e.target.name]: e.target.checked };
    setNotificationPrefs(updatedPrefs);
    
    try {
      await api.put(`/auth/profile`, { notificationPreferences: updatedPrefs });
      toast.success('Preferences updated!');
    } catch (error) {
      toast.error('Failed to update preferences');
      setNotificationPrefs(notificationPrefs);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await api.put(`/auth/profile`, formData);
      const updatedUser = response.data.user;
      setProfile(updatedUser);
      dispatch(updateProfile(updatedUser));
      toast.success('Profile updated successfully!');
      
      if (updatedUser?.profileCompleted) {
        if (updatedUser.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (updatedUser.role === 'provider') {
          navigate('/provider/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('images', file);

    try {
      setUploading(true);
      const response = await api.post('/upload', imgData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = response.data.urls[0];

      await api.put(`/auth/profile`, { profileImage: imageUrl });
      setProfile({ ...profile, profileImage: imageUrl });
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
      </header>

      {(!profile?.profileCompleted || location.state?.forceComplete) && (
        <div className="mb-8 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-lg mb-1">Complete Your Profile Details</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                Please provide your <strong>Full Name</strong>, <strong>State</strong>, <strong>District</strong>, and <strong>Village</strong> below to unlock full access to GramSathi. These fields are mandatory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        {[
          { label: 'Personal Info', icon: UserIcon },
          { label: 'Notification Preferences', icon: Bell },
          { label: 'Booking History', icon: CalendarDays },
          { label: 'Saved Schemes', icon: Bookmark },
          { label: 'Provider Verification', icon: Briefcase }
        ].map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = tabValue === idx;
          return (
            <button
              key={idx}
              onClick={() => setTabValue(idx)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-sky-500 text-sky-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {/* Panel 0: Personal Info */}
        <div className={tabValue === 0 ? 'block' : 'hidden'}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Column */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center sticky top-8">
                <div className="relative inline-block mb-4 group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 mx-auto">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UserIcon className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  
                  <input
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-sky-600 text-white p-2 rounded-full shadow-lg hover:bg-sky-700 transition-colors">
                      {uploading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </div>
                  </label>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 mb-1">{profile?.name || 'User'}</h2>
                <p className="text-slate-500 text-sm mb-4">{profile?.email}</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 uppercase tracking-wider mb-6">
                  {profile?.role || 'user'}
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-2 flex flex-col gap-3">
                  {isInstallable && (
                    <button 
                      onClick={install}
                      className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install GramSathi App
                    </button>
                  )}
                  {isInstalled && (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      App Installed & Running Offline
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      // We can just clear local storage and reload since redux is mostly handled via app level
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Edit Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input 
                      label="Full Name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input 
                      label="Mobile Number" 
                      name="mobile" 
                      value={formData.mobile} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <LocationSelector
                      state={formData.state}
                      district={formData.district}
                      block={formData.block}
                      village={formData.village}
                      onChange={(updated) => {
                        setFormData(prev => ({
                          ...prev,
                          state: updated.state,
                          district: updated.district,
                          block: updated.block,
                          village: updated.village
                        }));
                      }}
                      required={false}
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={handleSaveProfile} 
                    isLoading={saving}
                    className="w-full md:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 1: Notification Preferences */}
        <div className={tabValue === 1 ? 'block' : 'hidden'}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Notification Preferences</h3>
            <p className="text-slate-500 text-sm mb-8">
              Choose how you want to be notified about your bookings, government schemes, and lost & found updates.
            </p>
            
            <div className="space-y-6">
              {[
                { id: 'push', label: 'Push Notifications', desc: 'Receive alerts on your browser or app' },
                { id: 'email', label: 'Email Notifications', desc: 'Receive updates in your inbox' },
                { id: 'sms', label: 'SMS Notifications', desc: 'Receive text messages on your phone' }
              ].map((pref) => (
                <label key={pref.id} className="flex items-start cursor-pointer group">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{pref.label}</div>
                    <div className="text-sm text-slate-500">{pref.desc}</div>
                  </div>
                  <div className="relative ml-4">
                    <input 
                      type="checkbox" 
                      name={pref.id}
                      className="sr-only"
                      checked={notificationPrefs[pref.id]}
                      onChange={handlePrefChange}
                    />
                    <div className={`block w-12 h-7 rounded-full transition-colors ${notificationPrefs[pref.id] ? 'bg-sky-500' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${notificationPrefs[pref.id] ? 'transform translate-x-5' : ''}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Booking History */}
        <div className={tabValue === 2 ? 'block' : 'hidden'}>
          <UserBookings hideTitle />
        </div>

        {/* Panel 3: Saved Schemes */}
        <div className={tabValue === 3 ? 'block' : 'hidden'}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Bookmark className="w-5 h-5 mr-2 text-sky-500" />
              Saved Government Schemes
            </h3>
            
            {savedSchemes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p>You haven't saved any government schemes yet.</p>
                <Button variant="ghost" onClick={() => window.location.href='/schemes'} className="mt-4">
                  Browse Schemes
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedSchemes.map(scheme => (
                  <div key={scheme._id} className="border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition-colors flex flex-col">
                    <h4 className="font-bold text-slate-900 line-clamp-1 mb-2">{scheme.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{scheme.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                        {scheme.department || 'General'}
                      </span>
                      <a href={`/schemes/${scheme._id}`} className="text-sm font-bold text-sky-600 hover:text-sky-700">
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 4: Provider Verification */}
        <div className={tabValue === 4 ? 'block' : 'hidden'}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-3xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
              Provider Profile Verification
            </h3>
            <p className="text-slate-500 text-sm mb-8">
              Verify your identity by uploading official identification. Once verified, a checkmark badge will appear next to your listings, boosting user trust.
            </p>

            {profile?.verification?.status === 'approved' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 text-center">
                <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-2">Verification Approved!</h4>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm mb-4">
                  Your profile has been fully verified by the administrator. Your verified badge is now active.
                </p>
                <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-bold uppercase tracking-wide">
                  <Check className="w-3.5 h-3.5" />
                  Verified Badge Active
                </div>
              </div>
            )}

            {profile?.verification?.status === 'pending' && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 text-center">
                <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
                <h4 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">Verification Pending Approval</h4>
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  We have received your verification request. An administrator is currently reviewing your documents. This usually takes less than 24 hours.
                </p>
              </div>
            )}

            {profile?.verification?.status === 'suspended' && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 text-center">
                <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-rose-800 dark:text-rose-300 mb-2">Verification Suspended</h4>
                <p className="text-rose-600 dark:text-rose-400 text-sm">
                  Your provider verification privileges have been suspended. Please contact GramSathi administrator support for details.
                </p>
              </div>
            )}

            {(profile?.verification?.status === 'unsubmitted' || profile?.verification?.status === 'rejected' || !profile?.verification?.status) && (
              <div>
                {profile?.verification?.status === 'rejected' && (
                  <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 rounded-xl text-sm">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      Verification Request Rejected
                    </div>
                    <p className="opacity-90">Reason: {profile?.verification?.rejectionReason || 'No reason specified'}</p>
                    <p className="mt-2 text-xs font-semibold uppercase">Please re-upload valid documents and resubmit.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Aadhaar Upload Box */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-6 text-center transition-colors">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Aadhaar Card (Required)</h4>
                    <p className="text-xs text-slate-500 mb-4">Upload a clear photo of your Aadhaar Card (front or back).</p>
                    
                    {aadhaarUrl ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-100 mb-3 bg-slate-50">
                        <img src={aadhaarUrl} alt="Aadhaar Card" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => setAadhaarUrl('')}
                          className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-block">
                        <input
                          accept="image/jpeg, image/png, image/webp"
                          className="hidden"
                          id="aadhaar-upload-input"
                          type="file"
                          onChange={handleAadhaarUpload}
                          disabled={aadhaarUploading}
                        />
                        <label 
                          htmlFor="aadhaar-upload-input" 
                          className="inline-flex items-center px-4 py-2 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl cursor-pointer transition-colors"
                        >
                          {aadhaarUploading ? 'Uploading...' : 'Choose File'}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* PAN Upload Box */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-6 text-center transition-colors">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-900 mb-1">PAN Card (Optional)</h4>
                    <p className="text-xs text-slate-500 mb-4">Upload a clear photo of your PAN Card for priority registration.</p>
                    
                    {panUrl ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-100 mb-3 bg-slate-50">
                        <img src={panUrl} alt="PAN Card" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => setPanUrl('')}
                          className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-block">
                        <input
                          accept="image/jpeg, image/png, image/webp"
                          className="hidden"
                          id="pan-upload-input"
                          type="file"
                          onChange={handlePanUpload}
                          disabled={panUploading}
                        />
                        <label 
                          htmlFor="pan-upload-input" 
                          className="inline-flex items-center px-4 py-2 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl cursor-pointer transition-colors"
                        >
                          {panUploading ? 'Uploading...' : 'Choose File'}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitVerification}
                    disabled={!aadhaarUrl || submittingVerification}
                    isLoading={submittingVerification}
                    className="w-full md:w-auto"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Submit Verification Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
