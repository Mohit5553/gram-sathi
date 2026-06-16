import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Tractor, LoaderPinwheel, HardHat, Zap, Wrench, Search, Phone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import Dashboard widgets
import WeatherWidget from '../../components/dashboard/WeatherWidget';
import MandiWidget from '../../components/dashboard/MandiWidget';
import FuelMetalWidget from '../../components/dashboard/FuelMetalWidget';
import QuickServices from '../../components/dashboard/QuickServices';
import FeaturedSchemes from '../../components/dashboard/FeaturedSchemes';
import EmergencyWidget from '../../components/dashboard/EmergencyWidget';
import AnnouncementBar from '../../components/dashboard/AnnouncementBar';
import DistrictNews from '../../components/dashboard/DistrictNews';
import LocalJobs from '../../components/dashboard/LocalJobs';
import LocalMarketplace from '../../components/dashboard/LocalMarketplace';

import api from '../../api/axios';

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "GramSathi - Live Village Information Dashboard";
    
    // Set SEO Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Live village dashboard for GramSathi, featuring weather updates, crop mandi rates, gold and silver commodity rates, local fuel prices, announcements, and quick access to official portals.');

    const fetchBanners = async () => {
      try {
        const res = await api.get('/cms?type=banner');
        setBanners(res.data.data || []);
      } catch (err) {
        console.error('Failed to load CMS banners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const getGreeting = () => {
    if (!isAuthenticated || !user) return 'Namaste Sathi';
    return `Namaste ${user.name || 'Sathi'}`;
  };

  const getFormattedDateDayMonth = () => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date().toLocaleDateString('en-IN', options);
  };
  
  const getFormattedDateDayName = () => {
    const options = { weekday: 'long' };
    return new Date().toLocaleDateString('en-IN', options);
  };

  // Standard services list for directory booking shortcuts
  const bookingServices = [
    { name: 'Tractor Booking', icon: Tractor, desc: 'Find and book tractors for farming instantly.', path: '/tractors', color: 'from-amber-500 to-orange-500' },
    { name: 'JCB Booking', icon: LoaderPinwheel, desc: 'Heavy machinery available for hire locally.', path: '/jcb', color: 'from-yellow-500 to-amber-600' },
    { name: 'Labour Hiring', icon: HardHat, desc: 'Connect with skilled and unskilled labour.', path: '/labour', color: 'from-sky-500 to-blue-600' },
    { name: 'Electrician', icon: Zap, desc: 'Get essential electrical maintenance fast.', path: '/electricians', color: 'from-indigo-500 to-purple-600' },
    { name: 'Plumber', icon: Wrench, desc: 'Reliable plumbing services at your doorstep.', path: '/plumbers', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="space-y-4">

      {/* 2. Welcome Hero Section */}
      <header className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-5 sm:p-6 text-white shadow-sm shadow-emerald-500/5">
        {/* Soft background glow overlay */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-teal-400/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1 text-left">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none flex items-center gap-2">
              👋 {getGreeting()}
            </h1>
            <div className="text-xs font-semibold text-emerald-100/90 flex items-center gap-1.5 mt-0.5">
              <MapPin size={13} className="text-emerald-300 animate-pulse shrink-0" />
              <span>{user?.village && user?.state ? `${user.village}, ${user.state}` : 'Gonda, Uttar Pradesh'}</span>
            </div>
          </div>
          
          {/* Date Selector Display Card */}
          <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-md">
            <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-300">
              <Calendar className="w-4 h-4 shrink-0" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-black text-white">{getFormattedDateDayMonth()}</div>
              <div className="text-[8px] font-bold text-emerald-250 uppercase tracking-wider mt-0.5">{getFormattedDateDayName()}</div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative z-10 mt-4 max-w-xl text-left">
          <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
            <input 
              type="text"
              placeholder="Search crops, mandi prices, jobs, schemes, or services..."
              className="w-full pl-10 pr-20 py-2.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs border border-emerald-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <button 
              type="submit" 
              className="absolute right-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-[10px] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </header>
      
      {/* 1. High-Priority Scrolling Announcements */}
      <AnnouncementBar village={user?.village} />

      {/* Row 1: Weather Card & Mandi Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WeatherWidget 
          latitude={user?.location?.coordinates[1] || 27.13} 
          longitude={user?.location?.coordinates[0] || 81.96} 
          locationName={user?.village && user?.state ? `${user.village}, ${user.state}` : 'Gonda, Uttar Pradesh'} 
          className="lg:col-span-1"
        />
        <MandiWidget className="lg:col-span-2" />
      </div>

      {/* Row 2: Fuel Prices, Gold & Silver Rates, and Dollar Rates */}
      <FuelMetalWidget />

      {/* Row 3: District News & Government Schemes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DistrictNews />
        <FeaturedSchemes />
      </div>

      {/* Row 4: Local Jobs & Local Marketplace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LocalJobs />
        <LocalMarketplace />
      </div>

      {/* Row 5: Quick Services */}
      <QuickServices />

      {/* 8. Services Booking Grid */}
      <section className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
        <header className="border-b border-border/60 pb-2.5">
          <h3 className="text-base font-extrabold text-foreground font-heading flex items-center gap-2">
            🚜 Marketplace Booking Services
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Hire verified tractor owners, heavy machinery operators, and village technicians</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {bookingServices.map((service, idx) => {
            const Icon = service.icon;
            return (
              <Link
                key={idx}
                to={service.path}
                className="group block bg-slate-50/50 hover:bg-slate-100/70 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-center cursor-pointer"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${service.color} text-white rounded-lg mb-3 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon strokeWidth={2} className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-0.5">{service.name}</h4>
                <p className="text-[9px] text-muted-foreground leading-relaxed line-clamp-2">{service.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 9. Emergency Hotlines */}
      <EmergencyWidget />

      {/* 10. Promotional Banner Slider */}
      {banners.length > 0 && (
        <section className="relative h-[160px] w-full overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/10" />
          <img 
            src={banners[0].imageUrl} 
            alt={banners[0].title} 
            className="w-full h-full object-cover object-center" 
          />
          <div className="absolute inset-0 z-20 flex items-center p-6">
            <div className="max-w-md text-white space-y-1.5">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
                News Highlight
              </span>
              <h2 className="text-lg md:text-xl font-black tracking-tight leading-tight">{banners[0].title}</h2>
              {banners[0].content && (
                <p className="text-[11px] text-slate-250 line-clamp-2 leading-relaxed">{banners[0].content}</p>
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
