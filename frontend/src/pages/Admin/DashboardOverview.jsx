import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CalendarRange, DollarSign, Wrench, Wifi, Clock, CheckCircle, 
  MapPin, CloudRain, Search, Bell, Settings, Award, Plus, Briefcase, 
  AlertTriangle, FileText, BarChart, ShoppingBag, Send, X, ShieldAlert, ChevronRight, HelpCircle
} from 'lucide-react';
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------
// QUICK ACTION COMPONENT MODALS
// ----------------------------------------------------

const QuickActionModal = ({ isOpen, onClose, title, fields, onSubmit, loading }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      fields.forEach(f => { initial[f.name] = f.defaultValue || ''; });
      setFormData(initial);
    }
  }, [isOpen, fields]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border max-w-lg w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            {title}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              )}
            </div>
          ))}
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="cancel" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="save" size="sm" isLoading={loading}>
              Create Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// MAIN DASHBOARD OVERVIEW REDESIGN
// ----------------------------------------------------

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Dashboard Metrics & Live Data State
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  // High-Density Data Lists
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [notices, setNotices] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [news, setNews] = useState([]);
  const [activeNoticeTab, setActiveNoticeTab] = useState('notices');

  // Active Widgets Tab Selection
  const [activeWidgetTab, setActiveWidgetTab] = useState('mandi');
  
  // Active Analytics Tab Selection
  const [activeChartTab, setActiveChartTab] = useState('bookings');

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Live Information States
  const [weatherData, setWeatherData] = useState(null);
  const [mandiData, setMandiData] = useState([]);
  const [fuelRates, setFuelRates] = useState(null);
  const [metalRates, setMetalRates] = useState(null);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('onlineUsersCount', (count) => {
      setOnlineUsers(count);
    });
    return () => {
      socket.off('onlineUsersCount');
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsRes, chartRes, bookingsRes, providersRes, jobsRes, 
        marketplaceRes, noticesRes, newsRes, weatherRes, mandiRes, 
        fuelRes, metalRes, emergencyRes
      ] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/chart-data'),
        api.get('/admin/bookings?limit=5'),
        api.get('/admin/providers?limit=5'),
        api.get('/jobs?limit=5'),
        api.get('/marketplace?limit=5'),
        api.get('/cms?type=notice&limit=5'),
        api.get('/cms?type=news&limit=3'),
        api.get('/dashboard/weather?lat=27.13&lon=81.96'),
        api.get('/dashboard/mandi'),
        api.get('/dashboard/fuel'),
        api.get('/dashboard/metals'),
        api.get('/admin/emergency?limit=5')
      ]);

      setStats(statsRes.data);
      setChartData(chartRes.data);
      setBookings(bookingsRes.data?.data || []);
      setProviders(providersRes.data?.data || []);
      setJobs(jobsRes.data?.data || []);
      setMarketplace(marketplaceRes.data?.data || []);
      setNotices(noticesRes.data?.data || []);
      setEmergencyContacts(emergencyRes.data?.data || []);
      setNews(newsRes.data?.data || []);
      
      setWeatherData(weatherRes.data);
      setMandiData(mandiRes.data || []);
      setFuelRates(fuelRes.data);
      setMetalRates(metalRes.data);

    } catch (error) {
      console.error('Error fetching admin dashboard overview data', error);
      toast.error('Failed to reload command center metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookingOverride = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      toast.success(`Booking status overridden to ${status.replace('_', ' ')}`);
      // Refresh listings
      const updatedBookings = await api.get('/admin/bookings?limit=5');
      setBookings(updatedBookings.data?.data || []);
      const updatedStats = await api.get('/admin/stats');
      setStats(updatedStats.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const executeQuickAction = async (formData) => {
    setActionLoading(true);
    try {
      if (activeModal === 'notice') {
        await api.post('/cms', { ...formData, contentType: 'notice', isActive: true });
        toast.success('Notice published successfully');
        const res = await api.get('/cms?type=notice&limit=5');
        setNotices(res.data?.data || []);
      } else if (activeModal === 'job') {
        await api.post('/jobs', { ...formData, isActive: true });
        toast.success('Job posting created successfully');
        const res = await api.get('/jobs?limit=5');
        setJobs(res.data?.data || []);
      } else if (activeModal === 'scheme') {
        await api.post('/schemes', formData);
        toast.success('Government scheme published successfully');
      } else if (activeModal === 'product') {
        await api.post('/marketplace', formData);
        toast.success('Product catalog listing created');
        const res = await api.get('/marketplace?limit=5');
        setMarketplace(res.data?.data || []);
      }
      
      const updatedStats = await api.get('/admin/stats');
      setStats(updatedStats.data);
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resource entry');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleLanguage = () => {
    const nextLng = i18n.language?.startsWith('hi') ? 'en' : 'hi';
    i18n.changeLanguage(nextLng);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-primary"></div>
      </div>
    );
  }

  // Define Quick Actions forms
  const MODAL_FIELDS = {
    notice: [
      { name: 'title', label: 'Notice Title', placeholder: 'e.g. Panchayat Election Dates 2026', required: true },
      { name: 'content', label: 'Detailed Content', placeholder: 'Provide full notice writeup...', type: 'textarea', required: true },
      { name: 'village', label: 'Village Scope (Optional)', placeholder: 'Leave empty for global' }
    ],
    job: [
      { name: 'role', label: 'Job Profile Role', placeholder: 'e.g. Field Supervisor', required: true },
      { name: 'company', label: 'Company / Contractor', placeholder: 'e.g. Gram Seva Cooperative', required: true },
      { name: 'desc', label: 'Job Description', placeholder: 'Provide details about hours, salary, and requirements...', type: 'textarea', required: true },
      { name: 'location', label: 'Work Location / Block', placeholder: 'e.g. Gonda Block', required: true },
      { name: 'salary', label: 'Salary / Wages', placeholder: 'e.g. Rs 12,000 / month' },
      { name: 'type', label: 'Employment Type', type: 'select', defaultValue: 'Full-time', options: [
        { label: 'Full-time', value: 'Full-time' },
        { label: 'Part-time', value: 'Part-time' },
        { label: 'Daily Wage', value: 'Daily Wage' }
      ]}
    ],
    scheme: [
      { name: 'title', label: 'Government Scheme Title', placeholder: 'e.g. PM Kisan Kalyan Yojana', required: true },
      { name: 'description', label: 'Scheme Description', placeholder: 'Provide qualifications, subsidies, and application steps...', type: 'textarea', required: true },
      { name: 'department', label: 'Nodal Department', placeholder: 'e.g. Agriculture Department', required: true },
      { name: 'eligibility', label: 'Eligibility Metrics', placeholder: 'e.g. Small and marginal farmers with land holdings below 2 hectares' },
      { name: 'benefits', label: 'Subsidy benefits details', placeholder: 'e.g. Rs 6,000 yearly subsidy credit' }
    ],
    product: [
      { name: 'title', label: 'Product Name', placeholder: 'e.g. Organic Basmati Rice seeds', required: true },
      { name: 'description', label: 'Product Details', placeholder: 'Provide weight, age, crop metrics...', type: 'textarea', required: true },
      { name: 'price', label: 'Price (Rs.)', type: 'number', placeholder: 'e.g. 2500', required: true },
      { name: 'unit', label: 'Price Unit', placeholder: 'e.g. per Quintal, per Kg, per Piece', required: true },
      { name: 'category', label: 'Product Category', type: 'select', defaultValue: 'Crops', options: [
        { label: 'Crops', value: 'Crops' },
        { label: 'Seeds', value: 'Seeds' },
        { label: 'Fertilizers', value: 'Fertilizers' },
        { label: 'Equipment', value: 'Equipment' },
        { label: 'Other', value: 'Other' }
      ]},
      { name: 'village', label: 'Pickup Village Location', placeholder: 'e.g. Gonda village', required: true }
    ]
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Command Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-card rounded-2xl border border-border shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-heading">GramSathi Command Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Live operator view for Gonda Panchayat, UP</p>
          </div>
        </div>
        
        {/* Navigation Tools */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <input 
              type="text"
              placeholder="Quick search user/booking..."
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent font-medium"
            />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button 
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 text-[10px] font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors cursor-pointer border border-border"
          >
            {i18n.language?.startsWith('hi') ? 'English' : 'हिन्दी'}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-sm text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>Online: {onlineUsers}</span>
          </div>
        </div>
      </header>

      {/* 2. Stat Cards Grid (8 compact stats) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { title: 'Total Users', value: stats?.users || 0, icon: Users, color: 'text-blue-500 bg-blue-500/5 border-blue-500/10' },
          { title: 'Providers', value: stats?.providers || 0, icon: Wrench, color: 'text-sky-500 bg-sky-500/5 border-sky-500/10' },
          { title: 'Total Bookings', value: stats?.bookings || 0, icon: CalendarRange, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' },
          { title: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, color: 'text-amber-500 bg-amber-500/5 border-amber-500/10' },
          { title: 'Completed', value: stats?.completedBookings || 0, icon: CheckCircle, color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10' },
          { title: 'Total Revenue', value: `₹${stats?.revenue || 0}`, icon: DollarSign, color: 'text-teal-500 bg-teal-500/5 border-teal-500/10' },
          { title: 'Active Schemes', value: stats?.schemes || 0, icon: FileText, color: 'text-purple-500 bg-purple-500/5 border-purple-500/10' },
          { title: 'Active Services', value: stats?.services || 0, icon: Wrench, color: 'text-rose-500 bg-rose-500/5 border-rose-500/10' }
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className={`p-4 bg-card rounded-xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group ${c.color.split(' ')[2]}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{c.title}</span>
                <div className={`p-1 rounded-lg ${c.color.split(' ')[1]}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-black text-foreground tracking-tight leading-none">{c.value}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main Dashboard Layout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Analytics & Actions (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Analytics Graphs Card */}
          <article className="bg-card rounded-2xl shadow-sm border border-border p-5 flex flex-col h-[380px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-3 mb-4 gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-foreground font-heading">Panchayat Analytics</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Consolidated reporting chart view</p>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-secondary p-0.5 rounded-lg text-xs border border-border self-stretch sm:self-auto justify-between">
                {[
                  { id: 'bookings', label: 'Bookings' },
                  { id: 'users', label: 'User Growth' },
                  { id: 'revenue', label: 'Revenue' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChartTab(tab.id)}
                    className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                      activeChartTab === tab.id 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'bookings' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={8} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
                  </AreaChart>
                ) : activeChartTab === 'users' ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={8} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                ) : (
                  <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} dy={8} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                  </RechartsBarChart>
                )}
              </ResponsiveContainer>
            </div>
          </article>

          {/* Tabbed High Density Live Info Section */}
          <article className="bg-card rounded-2xl shadow-sm border border-border p-5 flex flex-col min-h-[340px]">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-foreground font-heading flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Live Platform Feeds
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Synchronized agricultural, commodity, and weather streams</p>
              </div>

              {/* Info tabs */}
              <div className="flex flex-wrap gap-1 bg-secondary p-0.5 rounded-lg border border-border">
                {[
                  { id: 'mandi', label: 'Crop Mandi' },
                  { id: 'fuel', label: 'Fuel Rates' },
                  { id: 'metals', label: 'Commodities' },
                  { id: 'weather', label: 'Local Weather' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveWidgetTab(t.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                      activeWidgetTab === t.id 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto thin-scrollbar pr-1">
              {activeWidgetTab === 'mandi' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {mandiData.slice(0, 6).map((item, i) => (
                    <div key={i} className="bg-accent/40 border border-border/50 p-3 rounded-xl flex flex-col justify-between h-[90px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{item.market || 'Gonda'}</span>
                        <h4 className="text-xs font-black text-foreground mt-0.5">{item.commodity}</h4>
                      </div>
                      <div className="flex justify-between items-baseline mt-2">
                        <span className="text-xs font-black text-emerald-600">₹{item.modalPrice || item.price}</span>
                        <span className="text-[9px] text-muted-foreground font-semibold">/ Quintal</span>
                      </div>
                    </div>
                  ))}
                  {mandiData.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-muted-foreground">No Crop Mandi price feeds available</div>
                  )}
                </div>
              )}

              {activeWidgetTab === 'fuel' && fuelRates && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Petrol Rate', value: fuelRates.petrol, color: 'text-emerald-500' },
                    { label: 'Diesel Rate', value: fuelRates.diesel, color: 'text-sky-500' },
                    { label: 'CNG Rate', value: fuelRates.cng, color: 'text-indigo-500' },
                    { label: 'LPG Cylinder', value: fuelRates.lpg, color: 'text-rose-500' }
                  ].map((f, i) => (
                    <div key={i} className="bg-accent/40 border border-border/50 p-4 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{f.label}</span>
                      <div className="text-xl font-black text-foreground">₹{f.value}</div>
                      <div className="text-[9px] text-muted-foreground font-semibold">Gonda Panchayat</div>
                    </div>
                  ))}
                </div>
              )}

              {activeWidgetTab === 'metals' && metalRates && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Gold 24K (10g)', value: metalRates.gold24K, change: metalRates.gold24KChange },
                    { label: 'Gold 22K (10g)', value: metalRates.gold22K, change: metalRates.gold22KChange },
                    { label: 'Silver (1Kg)', value: metalRates.silver, change: metalRates.silverChange }
                  ].map((m, i) => (
                    <div key={i} className="bg-accent/40 border border-border/50 p-4 rounded-xl flex flex-col justify-between h-[100px]">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{m.label}</span>
                      <div className="text-2xl font-black text-foreground mt-1">₹{m.value}</div>
                      <span className={`text-[10px] font-bold mt-2 inline-flex items-center ${m.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.change >= 0 ? '+' : ''}{m.change}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeWidgetTab === 'weather' && weatherData && (
                <div className="bg-accent/30 border border-border/50 p-5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CloudRain className="w-10 h-10 text-indigo-500 shrink-0" />
                    <div>
                      <div className="text-3xl font-black text-foreground tracking-tight">{weatherData.temp || weatherData.temperature}°C</div>
                      <span className="text-xs text-muted-foreground font-semibold">{weatherData.condition || 'Scattered Clouds'}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground space-y-1 font-medium">
                    <div>Humidity: <span className="font-bold text-foreground">{weatherData.humidity}%</span></div>
                    <div>Wind Speed: <span className="font-bold text-foreground">{weatherData.wind || weatherData.windSpeed} km/h</span></div>
                    <div>Rain chance: <span className="font-bold text-foreground">{weatherData.rain || 0}%</span></div>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Recent Bookings Queue with Direct status transitions */}
          <article className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4">
            <header className="flex justify-between items-center border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-foreground font-heading">Recent Booking Transactions</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Bypass and override provider booking states</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold" onClick={() => navigate('/admin/bookings')}>
                View Queue
              </Button>
            </header>

            <div className="overflow-x-auto thin-scrollbar">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Customer</th>
                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Provider</th>
                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Service</th>
                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Charge</th>
                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground text-right">Quick Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking, i) => (
                    <tr key={i} className="hover:bg-accent/20 text-xs transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{booking.user?.name || 'Customer'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{booking.providerName}</td>
                      <td className="px-4 py-3 font-semibold">{booking.serviceType}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-350">₹{booking.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          booking.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20' :
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20' :
                          booking.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20' :
                          'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleBookingOverride(booking._id, 'accepted')}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded text-[9px] font-bold transition-all"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleBookingOverride(booking._id, 'rejected')}
                                className="px-2 py-1 bg-red-650 hover:bg-red-750 active:scale-95 text-white rounded text-[9px] font-bold transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {booking.status === 'accepted' && (
                            <button 
                              onClick={() => handleBookingOverride(booking._id, 'completed')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded text-[9px] font-bold transition-all"
                            >
                              Complete
                            </button>
                          )}
                          {['pending', 'accepted', 'in_progress'].includes(booking.status) && (
                            <button 
                              onClick={() => handleBookingOverride(booking._id, 'cancelled')}
                              className="px-2 py-1 bg-slate-500 hover:bg-slate-600 active:scale-95 text-white rounded text-[9px] font-bold transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">No recent bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

        </div>

        {/* RIGHT COLUMN: Action Cards & Panels (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Actions Shortcuts */}
          <article className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-foreground font-heading">Operator Shortcuts</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Instantly publish notice tags and directory configurations</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Notice', action: 'notice', color: 'from-sky-500 to-indigo-600' },
                { label: 'Add Scheme', action: 'scheme', color: 'from-emerald-500 to-teal-600' },
                { label: 'Add Job', action: 'job', color: 'from-amber-500 to-orange-600' },
                { label: 'Post Product', action: 'product', color: 'from-purple-500 to-pink-600' }
              ].map((act, i) => (
                <button
                  key={i}
                  onClick={() => setActiveModal(act.action)}
                  className={`p-3 bg-gradient-to-br ${act.color} text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-98 transition-all cursor-pointer text-left flex flex-col justify-between h-[75px]`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{act.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-border/60 pt-3 flex flex-col gap-2">
              <Button size="sm" className="w-full text-xs font-semibold" onClick={() => navigate('/admin/users')}>
                Manage User Roles
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold" onClick={() => navigate('/admin/backups')}>
                Database Backups
              </Button>
            </div>
          </article>

          {/* Top Providers widget */}
          <article className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4">
            <header className="flex justify-between items-center border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-foreground font-heading">Service Providers</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Top-rated active specialists</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[9px] font-bold" onClick={() => navigate('/admin/providers')}>
                View All
              </Button>
            </header>

            <div className="space-y-3 max-h-[260px] overflow-y-auto thin-scrollbar pr-1">
              {providers.slice(0, 4).map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-accent/40 rounded-xl border border-border/40 hover:bg-accent transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs font-black text-foreground block truncate">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{p.role} • {p.village || 'Gonda'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-500 block">★ {p.providerRating || 4.5}</span>
                    <span className={`inline-flex px-1.5 py-0.2 mt-1 rounded text-[8px] font-bold uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
              {providers.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">No providers cataloged</div>
              )}
            </div>
          </article>

          {/* Broadcast & Emergency Segment */}
          <article className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4">
            <header className="flex justify-between items-start border-b border-border/60 pb-3 gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-foreground font-heading flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  Broadcast & Emergency
                </h3>
                <div className="flex bg-secondary p-0.5 rounded-lg text-xs border border-border mt-2 w-fit">
                  <button
                    onClick={() => setActiveNoticeTab('notices')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      activeNoticeTab === 'notices'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Notices
                  </button>
                  <button
                    onClick={() => setActiveNoticeTab('emergency')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      activeNoticeTab === 'emergency'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Emergency
                  </button>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-[9px] font-bold shrink-0 self-start" 
                onClick={() => navigate(activeNoticeTab === 'notices' ? '/admin/cms' : '/admin/emergency')}
              >
                Manage
              </Button>
            </header>

            <div className="space-y-3 max-h-[220px] overflow-y-auto thin-scrollbar pr-1">
              {activeNoticeTab === 'notices' ? (
                <>
                  {notices.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 bg-red-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100/50 dark:border-rose-900/10 space-y-1">
                      <h4 className="text-xs font-black text-rose-950 dark:text-rose-300 leading-snug">{item.title}</h4>
                      <p className="text-[10px] text-rose-800 dark:text-rose-400 line-clamp-2 leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                  {notices.length === 0 && (
                    <div className="py-6 text-center text-xs text-muted-foreground">No active notices published</div>
                  )}
                </>
              ) : (
                <>
                  {emergencyContacts.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 bg-accent/45 rounded-xl border border-border/45 flex justify-between items-center gap-2 hover:bg-accent transition-colors">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-foreground truncate">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">{item.category} • {item.village || 'Gonda'}</p>
                      </div>
                      <a 
                        href={`tel:${item.number}`}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                      >
                        {item.number}
                      </a>
                    </div>
                  ))}
                  {emergencyContacts.length === 0 && (
                    <div className="py-6 text-center text-xs text-muted-foreground">No emergency contacts listed</div>
                  )}
                </>
              )}
            </div>
          </article>

        </div>

      </div>

      {/* 4. Bottom Grid: Jobs & Marketplace items summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Local Jobs Panel */}
        <article className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4 h-[320px] flex flex-col">
          <header className="flex justify-between items-center border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-foreground font-heading">Recent Job Vacancies</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active local job listings and contractor positions</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </header>
          <div className="flex-1 overflow-y-auto thin-scrollbar space-y-2.5 pr-1 py-1">
            {jobs.slice(0, 4).map((j, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-accent/40 rounded-xl border border-border/40">
                <div>
                  <h4 className="text-xs font-black text-foreground">{j.role}</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{j.company} • {j.location}</span>
                </div>
                <span className="text-xs font-black text-emerald-600">{j.salary || 'N/A'}</span>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground flex-1 flex flex-col items-center justify-center">No jobs currently listed</div>
            )}
          </div>
        </article>

        {/* Marketplace products panel */}
        <article className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4 h-[320px] flex flex-col">
          <header className="flex justify-between items-center border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-foreground font-heading">Marketplace Catalog</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Crops, seeds, and equipment available for sale</p>
            </div>
            <ShoppingBag className="w-4.5 h-4.5 text-muted-foreground" />
          </header>
          <div className="flex-1 overflow-y-auto thin-scrollbar space-y-2.5 pr-1 py-1">
            {marketplace.slice(0, 4).map((m, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-accent/40 rounded-xl border border-border/40">
                <div>
                  <h4 className="text-xs font-black text-foreground">{m.title}</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{m.category} • {m.village}</span>
                </div>
                <span className="text-xs font-black text-primary">₹{m.price} <span className="text-[9px] text-muted-foreground">/{m.unit}</span></span>
              </div>
            ))}
            {marketplace.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground flex-1 flex flex-col items-center justify-center">No marketplace products listed</div>
            )}
          </div>
        </article>

      </div>

      {/* Quick Action Input Forms Modals */}
      <AnimatePresence>
        {activeModal && (
          <QuickActionModal
            isOpen={!!activeModal}
            onClose={() => setActiveModal(null)}
            title={`Publish New ${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}`}
            fields={MODAL_FIELDS[activeModal] || []}
            onSubmit={executeQuickAction}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default DashboardOverview;
