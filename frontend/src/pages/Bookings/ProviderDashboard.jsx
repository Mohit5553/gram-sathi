import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import Button from '../../components/ui/Button';
import BookingTimeline from '../../components/bookings/BookingTimeline';
import Input from '../../components/ui/Input';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, Wrench, 
  CalendarRange, DollarSign, Activity, Clock, User, 
  Plus, Edit2, Trash2, Check, X, Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationSelector from '../../components/common/LocationSelector';

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard & Stats
  const [dashboardData, setDashboardData] = useState({ 
    stats: { earnings: 0, active: 0, pending: 0, completedJobs: 0 }, 
    services: [] 
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Bookings list and pagination
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const { socket } = useSocket();

  // Integrated Profile State
  const [profile, setProfile] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', mobile: '', village: '', block: '', district: '', state: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Service Creation/Modification State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // null for create mode
  const [serviceType, setServiceType] = useState('Tractor'); // default when creating

  // Service form fields
  const [serviceFormData, setServiceFormData] = useState({
    tractorType: '',
    brand: '',
    ratePerHour: '',
    dailyRate: '',
    visitCharge: '',
    experienceYears: '',
    specialization: '',
    skillType: 'skilled',
    village: '',
    block: '',
    district: '',
    state: ''
  });
  const [serviceSaving, setServiceSaving] = useState(false);

  // Service deletion confirmation state
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Availability Management States
  const [selectedAvailabilityService, setSelectedAvailabilityService] = useState(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [vacationMode, setVacationMode] = useState(false);
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("18:00");
  const [weekly, setWeekly] = useState({
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true
  });
  const [blockedDatesText, setBlockedDatesText] = useState("");
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  const handleOpenAvailabilityModal = (service) => {
    setSelectedAvailabilityService(service);
    const fullService = dashboardData.services.find(s => s.id === service.id);
    const avail = fullService?.availability || {};
    setVacationMode(avail.vacationMode || false);
    setStartHour(avail.daily?.startHour || "08:00");
    setEndHour(avail.daily?.endHour || "18:00");
    setWeekly(avail.weekly || {
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true
    });
    setBlockedDatesText(avail.blockedDates?.join(', ') || '');
    setIsAvailabilityModalOpen(true);
  };

  const handleSaveAvailability = async () => {
    try {
      setAvailabilitySaving(true);
      const blockedDates = blockedDatesText.split(',')
        .map(d => d.trim())
        .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
        
      await api.put(`/provider/${selectedAvailabilityService.type}/${selectedAvailabilityService.id}/availability`, {
        vacationMode,
        daily: { startHour, endHour },
        weekly,
        blockedDates
      });
      toast.success('Availability settings updated successfully!');
      setIsAvailabilityModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update availability settings');
    } finally {
      setAvailabilitySaving(false);
    }
  };

  // Load Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const res = await api.get('/provider/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setDashboardLoading(false);
    }
  };

  // Load Bookings Data
  const fetchBookings = async (page = 1) => {
    try {
      setBookingsLoading(true);
      const response = await api.get(`/booking/provider?page=${page}&limit=20`);
      setBookings(response.data.data || []);
      setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error('Failed to load incoming requests');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Load Profile Data
  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const data = response.data;
      setProfile(data);
      setProfileData({
        name: data.name || '',
        mobile: data.mobile || '',
        village: data.village || '',
        block: data.block || '',
        district: data.district || '',
        state: data.state || ''
      });
    } catch (err) {
      console.error('Failed to load profile settings', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchBookings();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleBookingUpdate = () => {
      fetchBookings(pagination.current);
      fetchDashboardData();
    };
    socket.on('bookingStatusUpdated', handleBookingUpdate);
    return () => socket.off('bookingStatusUpdated', handleBookingUpdate);
  }, [socket, pagination.current]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/booking/${id}/status`, { status });
      toast.success(`Booking marked as ${status.replace('_', ' ')}`);
      fetchBookings(pagination.current);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleAvailability = async (type, id, currentAvailability) => {
    try {
      const endpoint = type.toLowerCase();
      await api.put(`/${endpoint}/${id}`, { isAvailable: !currentAvailability });
      toast.success(`${type} availability updated`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  // ==========================================
  // PROFILE UPDATE ACTION
  // ==========================================
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await api.put('/auth/profile', profileData);
      toast.success('Account profile updated successfully');
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile settings');
    } finally {
      setProfileSaving(false);
    }
  };

  // ==========================================
  // SERVICE CRUD ACTIONS
  // ==========================================
  const handleOpenAddService = () => {
    setSelectedService(null);
    setServiceType('Tractor');
    setServiceFormData({
      tractorType: '',
      brand: '',
      ratePerHour: '',
      dailyRate: '',
      visitCharge: '',
      experienceYears: '',
      specialization: '',
      skillType: 'skilled',
      village: profile?.village || '',
      block: profile?.block || '',
      district: profile?.district || '',
      state: profile?.state || ''
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setSelectedService(service);
    setServiceType(service.type);
    
    // Map normalized properties back to form values based on type
    setServiceFormData({
      tractorType: service.type === 'Tractor' ? service.name : '',
      brand: service.brand || '',
      ratePerHour: (service.type === 'Tractor' || service.type === 'JCB') ? service.rate : '',
      dailyRate: service.type === 'Labour' ? service.rate : '',
      visitCharge: (service.type === 'Electrician' || service.type === 'Plumber') ? service.rate : '',
      experienceYears: service.experienceYears || '',
      specialization: service.specialization || '',
      skillType: service.type === 'Labour' ? service.name : 'skilled',
      village: service.village || '',
      block: service.block || '',
      district: service.district || '',
      state: service.state || ''
    });
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceSaving(true);

    const typeEndpoint = serviceType.toLowerCase();
    
    // Format payload keys based on target schema requirements
    let payload = {
      village: serviceFormData.village,
      block: serviceFormData.block,
      district: serviceFormData.district,
      state: serviceFormData.state
    };

    if (serviceType === 'Tractor') {
      payload.tractorType = serviceFormData.tractorType;
      payload.brand = serviceFormData.brand;
      payload.ratePerHour = Number(serviceFormData.ratePerHour);
    } else if (serviceType === 'JCB') {
      payload.ratePerHour = Number(serviceFormData.ratePerHour);
    } else if (serviceType === 'Labour') {
      payload.skillType = serviceFormData.skillType;
      payload.dailyRate = Number(serviceFormData.dailyRate);
      payload.experienceYears = Number(serviceFormData.experienceYears || 0);
    } else if (serviceType === 'Electrician' || serviceType === 'Plumber') {
      payload.specialization = serviceFormData.specialization;
      payload.visitCharge = Number(serviceFormData.visitCharge);
      payload.experienceYears = Number(serviceFormData.experienceYears || 0);
    }

    try {
      if (selectedService) {
        // Edit Mode
        await api.put(`/${typeEndpoint}/${selectedService.id}`, payload);
        toast.success(`${serviceType} details updated successfully`);
      } else {
        // Create Mode
        await api.post(`/${typeEndpoint}`, payload);
        toast.success(`${serviceType} registered successfully`);
      }
      setIsServiceModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to save ${serviceType} details`);
    } finally {
      setServiceSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (service) => {
    setServiceToDelete(service);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      const endpoint = serviceToDelete.type.toLowerCase();
      await api.delete(`/${endpoint}/${serviceToDelete.id}`);
      toast.success(`${serviceToDelete.type} listing deleted successfully`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete service listing');
    } finally {
      setIsDeleteConfirmOpen(false);
      setServiceToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'services', label: 'My Services', icon: Wrench },
    { id: 'requests', label: 'Booking Requests', icon: CalendarRange },
    { id: 'history', label: 'Booking History', icon: Clock },
    { id: 'profile', label: 'Profile Settings', icon: User }
  ];

  // Filter Bookings client-side
  const activeRequests = bookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.status));
  const historyRequests = bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status));

  if (dashboardLoading && activeTab === 'overview') {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight font-heading">Provider Portal</h1>
        <p className="text-muted-foreground mt-2">Manage your services, track earnings, and respond to bookings.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl mb-8 border border-slate-200 w-full max-w-2xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ==========================================
              OVERVIEW TAB
              ========================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Earnings</p>
                    <h3 className="text-2xl font-bold text-slate-900">₹{dashboardData.stats.earnings || 0}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</p>
                    <h3 className="text-2xl font-bold text-slate-900">{dashboardData.stats.active || 0}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Requests</p>
                    <h3 className="text-2xl font-bold text-slate-900">{dashboardData.stats.pending || 0}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarRange className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Jobs</p>
                    <h3 className="text-2xl font-bold text-slate-900">{dashboardData.stats.completedJobs || 0}</h3>
                  </div>
                </div>
              </div>

              {/* Quick Actions / Active Requests Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Requests Preview</h3>
                  {activeRequests.filter(b => b.status === 'pending').length === 0 ? (
                    <p className="text-slate-500 text-sm py-8 text-center">No new pending requests. Good job!</p>
                  ) : (
                    <div className="space-y-4">
                      {activeRequests.filter(b => b.status === 'pending').slice(0, 3).map(booking => (
                        <div key={booking._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-900 capitalize">{booking.serviceType}</p>
                            <p className="text-xs text-slate-500">{booking.address}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="approve" 
                              size="icon" 
                              onClick={() => handleStatusChange(booking._id, 'accepted')} 
                              className="p-2 rounded-lg"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="reject" 
                              size="icon" 
                              onClick={() => handleStatusChange(booking._id, 'rejected')} 
                              className="p-2 rounded-lg text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Services Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Registered Services:</span>
                      <span className="font-bold text-slate-800">{dashboardData.services.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Active Listings:</span>
                      <span className="font-bold text-emerald-600">{dashboardData.services.filter(s => s.isAvailable).length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Suspended Listings:</span>
                      <span className="font-bold text-slate-400">{dashboardData.services.filter(s => !s.isAvailable).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SERVICES TAB (availability, edit, delete, add)
              ========================================== */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Manage Registered Services</h3>
                <Button
                  onClick={handleOpenAddService}
                  className="flex items-center gap-2 px-4 py-2 h-9 text-xs rounded-lg font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Service
                </Button>
              </div>

              {dashboardData.services.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-lg font-bold text-slate-800">No Services Found</h2>
                  <p className="text-slate-500 mt-2 text-sm">Register as a tractor owner, electrician, plumber, etc. to start listing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.services.map(service => (
                    <div key={service.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full relative group">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                            {service.type}
                          </span>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="edit" 
                              size="icon"
                              onClick={() => handleOpenEditService(service)} 
                              className="w-7 h-7 p-1 rounded-md text-white"
                              title="Edit service details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="delete" 
                              size="icon"
                              onClick={() => handleOpenDeleteConfirm(service)} 
                              className="w-7 h-7 p-1 rounded-md text-white"
                              title="Unregister service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 capitalize">{service.name}</h4>
                        {service.brand && <p className="text-xs text-slate-500 font-medium">Brand: {service.brand}</p>}
                        {service.experienceYears !== undefined && <p className="text-xs text-slate-500 font-medium">Experience: {service.experienceYears} Years</p>}
                        {service.specialization && <p className="text-xs text-slate-500 italic mt-1">Specialty: {service.specialization}</p>}
                        
                        <div className="mt-4 space-y-1 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 border border-slate-100">
                          <p><strong>Village:</strong> {service.village || 'All India'}</p>
                          <p><strong>Pricing:</strong> ₹{service.rate} {service.type === 'Labour' ? '/ Day' : (service.type === 'Electrician' || service.type === 'Plumber') ? 'Visit Charge' : '/ Hour'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 flex flex-col gap-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">Accept Bookings</span>
                          <button 
                            onClick={() => handleToggleAvailability(service.type, service.id, service.isAvailable)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${service.isAvailable ? 'bg-primary' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${service.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        
                        <div className="flex justify-end pt-1">
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenAvailabilityModal(service)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            Set Schedule & Vacation
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              BOOKING REQUESTS TAB (active list only)
              ========================================== */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Active Bookings</h3>
              {bookingsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
                </div>
              ) : activeRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <CalendarRange className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-800">No Active Bookings</h4>
                  <p className="text-slate-500 mt-2 text-sm">When customers reserve your services, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRequests.map(booking => (
                    <article key={booking._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="flex flex-col md:flex-row p-6 justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-bold text-slate-900 capitalize">{booking.serviceType} Booking</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                            <p><span className="text-slate-500 font-medium w-24 inline-block">Customer:</span> <strong className="text-slate-700">{booking.user?.name}</strong> <span className="text-slate-500">({booking.user?.mobile})</span></p>
                            <p><span className="text-slate-500 font-medium w-24 inline-block">Booking Date:</span> <strong className="text-slate-700">{new Date(booking.bookingDate).toLocaleDateString()}</strong></p>
                            <p><span className="text-slate-500 font-medium w-24 inline-block">Duration:</span> <strong className="text-slate-700">{booking.durationHours ? `${booking.durationHours} Hrs` : 'N/A'}</strong></p>
                            <p><span className="text-slate-500 font-medium w-24 inline-block">Location:</span> <strong className="text-slate-700">{booking.address}</strong></p>
                            <p className="sm:col-span-2 pt-2 border-t border-slate-100/50 mt-2 flex flex-wrap gap-x-6 gap-y-1">
                              <span><span className="text-slate-500 font-medium">Total Cost:</span> <strong className="text-slate-900 text-base">₹{booking.totalAmount}</strong></span>
                              <span><span className="text-slate-500 font-medium">Your Net Pay (90%):</span> <strong className="text-emerald-600 text-base">₹{booking.providerEarnings || (booking.totalAmount * 0.9).toFixed(2)}</strong></span>
                              <span><span className="text-slate-500 font-medium">Platform Fee (10%):</span> <strong className="text-slate-400 text-sm">₹{booking.commission || (booking.totalAmount * 0.1).toFixed(2)}</strong></span>
                            </p>
                          </div>

                          {booking.notes && (
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 italic">
                              "{booking.notes}"
                            </div>
                          )}

                          {booking.timeline && booking.timeline.length > 0 && (
                            <BookingTimeline booking={booking} timeline={booking.timeline} />
                          )}
                        </div>
                        
                        <div className="md:w-48 flex flex-col justify-start gap-2.5 md:border-l md:border-slate-100 md:pl-6 pt-2 shrink-0">
                          {booking.status === 'pending' && (
                            <>
                              <Button variant="approve" onClick={() => handleStatusChange(booking._id, 'accepted')} className="w-full py-2 text-sm font-semibold rounded-lg">
                                Accept Request
                              </Button>
                              <Button variant="reject" onClick={() => handleStatusChange(booking._id, 'rejected')} className="w-full py-2 text-sm font-semibold rounded-lg text-white">
                                Reject Request
                              </Button>
                            </>
                          )}
                          
                          {booking.status === 'accepted' && (booking.serviceType === 'Tractor' || booking.serviceType === 'JCB') && (
                            <Button variant="primary" onClick={() => handleStatusChange(booking._id, 'in_progress')} className="w-full py-2 text-sm font-semibold rounded-lg">
                              Start Operations
                            </Button>
                          )}

                          {booking.status === 'accepted' && (booking.serviceType !== 'Tractor' && booking.serviceType !== 'JCB') && (
                            <Button variant="approve" onClick={() => handleStatusChange(booking._id, 'completed')} className="w-full py-2 text-sm font-semibold rounded-lg flex-col leading-tight">
                              <span>Complete Job</span>
                              <span className="text-[10px] font-normal opacity-85">(Confirm Payment)</span>
                            </Button>
                          )}

                          {booking.status === 'in_progress' && (
                            <Button variant="approve" onClick={() => handleStatusChange(booking._id, 'completed')} className="w-full py-2 text-sm font-semibold rounded-lg flex-col leading-tight">
                              <span>Complete Job</span>
                              <span className="text-[10px] font-normal opacity-85">(Confirm Payment)</span>
                            </Button>
                          )}

                          {(booking.status === 'pending' || booking.status === 'accepted' || booking.status === 'in_progress') && (
                            <Button variant="delete" onClick={() => handleStatusChange(booking._id, 'cancelled')} className="w-full py-2 text-sm font-semibold rounded-lg mt-4 text-white">
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              BOOKING HISTORY TAB (history list only)
              ========================================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Job History</h3>
              {bookingsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
                </div>
              ) : historyRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-800">No Booking History</h4>
                  <p className="text-slate-500 mt-2 text-sm">Completed, rejected, and cancelled orders will be archived here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyRequests.map(booking => (
                    <article key={booking._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden opacity-85 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col md:flex-row p-5 justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-slate-900 capitalize">{booking.serviceType}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 text-sm text-slate-600">
                            <p><span className="text-slate-400 font-medium w-24 inline-block">Customer:</span> <strong>{booking.user?.name}</strong></p>
                            <p><span className="text-slate-400 font-medium w-24 inline-block">Date:</span> <strong>{new Date(booking.bookingDate).toLocaleDateString()}</strong></p>
                            <p><span className="text-slate-400 font-medium w-24 inline-block">Total Value:</span> <strong className="text-slate-800 font-bold">₹{booking.totalAmount}</strong></p>
                            <p><span className="text-slate-400 font-medium w-24 inline-block">Net Earnings:</span> <strong className="text-emerald-600 font-black">₹{booking.providerEarnings || (booking.totalAmount * 0.9).toFixed(2)}</strong></p>
                            <p><span className="text-slate-400 font-medium w-24 inline-block">Platform Fee:</span> <strong className="text-slate-500 font-semibold">₹{booking.commission || (booking.totalAmount * 0.1).toFixed(2)}</strong></p>
                            <p><span className="text-slate-400 font-medium w-24 inline-block">Address:</span> <strong>{booking.address}</strong></p>
                          </div>
                        </div>
                        <div className="md:w-44 text-right flex flex-col justify-center text-xs text-slate-400">
                          <p>Order Log ID: {booking._id}</p>
                          <p className="mt-1">Completed Date: {new Date(booking.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              PROFILE SETTINGS TAB (Integrated profile)
              ========================================== */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Provider Account Details</h3>
              <p className="text-slate-500 text-sm mb-6">Modify details shown to customers when they place a booking request.</p>
              
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input 
                      label="Full Name" 
                      name="name" 
                      value={profileData.name} 
                      onChange={e => setProfileData({...profileData, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input 
                      label="Mobile Number" 
                      name="mobile" 
                      value={profileData.mobile} 
                      onChange={e => setProfileData({...profileData, mobile: e.target.value})} 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <LocationSelector
                      state={profileData.state}
                      district={profileData.district}
                      block={profileData.block}
                      village={profileData.village}
                      onChange={(updated) => {
                        setProfileData(prev => ({
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
                
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                  <Button 
                    type="submit" 
                    isLoading={profileSaving}
                  >
                    Save Profile Settings
                  </Button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ==========================================
          SERVICE REGISTER / EDIT MODAL
          ========================================== */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsServiceModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsServiceModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{selectedService ? `Modify ${serviceType} details` : 'Register a New Service'}</h3>
            
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              {!selectedService && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Service Profession Type</label>
                  <select 
                    value={serviceType} 
                    onChange={e => setServiceType(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Tractor">Tractor Owner</option>
                    <option value="JCB">JCB Heavy Machinery</option>
                    <option value="Labour">Labour Contractor</option>
                    <option value="Electrician">Electrician Profile</option>
                    <option value="Plumber">Plumber Profile</option>
                  </select>
                </div>
              )}

              {/* Dynamic form elements based on ServiceType */}
              {serviceType === 'Tractor' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tractor Model / Category</label>
                    <input type="text" placeholder="e.g. Cultivator, Rotavator" value={serviceFormData.tractorType} onChange={e => setServiceFormData({...serviceFormData, tractorType: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Brand Name</label>
                      <input type="text" placeholder="e.g. Mahindra, John Deere" value={serviceFormData.brand} onChange={e => setServiceFormData({...serviceFormData, brand: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Hourly Rate (₹)</label>
                      <input type="number" placeholder="800" value={serviceFormData.ratePerHour} onChange={e => setServiceFormData({...serviceFormData, ratePerHour: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" required />
                    </div>
                  </div>
                </>
              )}

              {serviceType === 'JCB' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Hourly Excavator Rate (₹)</label>
                  <input type="number" placeholder="1200" value={serviceFormData.ratePerHour} onChange={e => setServiceFormData({...serviceFormData, ratePerHour: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" required />
                </div>
              )}

              {serviceType === 'Labour' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Labour Type</label>
                      <select value={serviceFormData.skillType} onChange={e => setServiceFormData({...serviceFormData, skillType: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none">
                        <option value="skilled">Skilled</option>
                        <option value="unskilled">Unskilled</option>
                        <option value="semi-skilled">Semi-Skilled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Daily Wages Rate (₹)</label>
                      <input type="number" placeholder="400" value={serviceFormData.dailyRate} onChange={e => setServiceFormData({...serviceFormData, dailyRate: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contractor Experience (Years)</label>
                    <input type="number" placeholder="e.g. 5" value={serviceFormData.experienceYears} onChange={e => setServiceFormData({...serviceFormData, experienceYears: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                </>
              )}

              {(serviceType === 'Electrician' || serviceType === 'Plumber') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Visit Callout Charge (₹)</label>
                      <input type="number" placeholder="150" value={serviceFormData.visitCharge} onChange={e => setServiceFormData({...serviceFormData, visitCharge: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Work Experience (Years)</label>
                      <input type="number" placeholder="5" value={serviceFormData.experienceYears} onChange={e => setServiceFormData({...serviceFormData, experienceYears: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Work Specialization / Scope</label>
                    <input type="text" placeholder="e.g. Home Wiring, Pipeline Repairs" value={serviceFormData.specialization} onChange={e => setServiceFormData({...serviceFormData, specialization: e.target.value})} className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                </>
              )}

              {/* Common location values */}
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <LocationSelector
                  state={serviceFormData.state}
                  district={serviceFormData.district}
                  block={serviceFormData.block}
                  village={serviceFormData.village}
                  onChange={(updated) => {
                    setServiceFormData(prev => ({
                      ...prev,
                      state: updated.state,
                      district: updated.district,
                      block: updated.block,
                      village: updated.village
                    }));
                  }}
                  required={true}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button type="button" variant="cancel" onClick={() => setIsServiceModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="save" isLoading={serviceSaving}>
                  Save Service
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteService}
        title="Unregister Service Listing"
        message={`Are you sure you want to permanently delete this ${serviceToDelete?.type} listing? This will immediately remove you from the customer directory for this service.`}
      />

      {/* Availability Settings Modal */}
      {isAvailabilityModalOpen && selectedAvailabilityService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsAvailabilityModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Availability & Scheduling</h3>
              <button onClick={() => setIsAvailabilityModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Vacation Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Vacation Mode</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Temporarily suspend all bookings and mark yourself on vacation.</p>
                </div>
                <button 
                  onClick={() => setVacationMode(!vacationMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${vacationMode ? 'bg-amber-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vacationMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Daily Hours */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Daily Working Hours</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
                    <input 
                      type="time" 
                      value={startHour} 
                      onChange={e => setStartHour(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-350 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Time</label>
                    <input 
                      type="time" 
                      value={endHour} 
                      onChange={e => setEndHour(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-350 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Weekly Days Checkboxes */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Weekly Availability</h4>
                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(weekly).map((day) => (
                    <button
                      key={day}
                      onClick={() => setWeekly({ ...weekly, [day]: !weekly[day] })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors border cursor-pointer ${
                        weekly[day] 
                          ? 'bg-sky-50 text-sky-700 border-sky-200' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blocked Dates */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Block Specific Dates</h4>
                <p className="text-xs text-slate-400 mb-2">Enter comma-separated dates that you are unavailable (e.g. YYYY-MM-DD).</p>
                <Input 
                  placeholder="2026-06-20, 2026-06-21"
                  value={blockedDatesText}
                  onChange={e => setBlockedDatesText(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
              <Button 
                variant="cancel"
                onClick={() => setIsAvailabilityModalOpen(false)} 
              >
                Cancel
              </Button>
              <Button 
                variant="save"
                onClick={handleSaveAvailability} 
                isLoading={availabilitySaving}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple inline confirmation modal for deletions
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 relative z-10 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-xs mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="cancel" onClick={onClose} className="text-xs h-9 px-4 rounded-lg">
            Cancel
          </Button>
          <Button variant="delete" onClick={onConfirm} className="text-xs h-9 px-4 rounded-lg text-white">
            Delete Listing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
