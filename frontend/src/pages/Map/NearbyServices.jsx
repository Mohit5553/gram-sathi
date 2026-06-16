import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import MapViewer from '../../components/common/MapViewer';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const NearbyServices = () => {
  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // Request location
  const getUserLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchNearbyServices(latitude, longitude);
        updateUserBackendLocation(latitude, longitude);
      },
      (error) => {
        setError('Please enable location services to find nearby providers.');
        setLoading(false);
      }
    );
  };

  const updateUserBackendLocation = async (lat, lng) => {
    try {
      await api.put('/auth/location', { latitude: lat, longitude: lng });
    } catch (e) {
      console.error('Failed to sync location with backend');
    }
  };

  const fetchNearbyServices = async (lat, lng, type = '') => {
    try {
      setLoading(true);
      const url = `/search/nearby?latitude=${lat}&longitude=${lng}&radius=20${type !== 'All' && type ? `&serviceType=${type}` : ''}`;
      const res = await api.get(url);
      setServices(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load nearby services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleFilterChange = (type) => {
    setActiveFilter(type);
    if (location) {
      fetchNearbyServices(location.lat, location.lng, type);
    }
  };

  // Convert backend services to markers
  const markers = services.map(s => {
    let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    if (s.serviceCategory === 'Tractor') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    else if (s.serviceCategory === 'JCB') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    else if (s.serviceCategory === 'Plumber') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    else if (s.serviceCategory === 'Electrician') iconUrl = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';

    return {
      id: s._id,
      lat: s.location?.coordinates[1] || 0,
      lng: s.location?.coordinates[0] || 0,
      title: `${s.serviceCategory} in ${s.village}`,
      icon: { url: iconUrl },
      infoWindowContent: (
        <div>
          <h4 className="font-bold text-sm">{s.serviceCategory}</h4>
          <p className="text-xs text-muted-foreground">{s.village}</p>
          <p className="text-xs font-semibold mt-1">
            Distance: {(s.distance / 1000).toFixed(1)} km
          </p>
          <p className="text-xs">
            Rate: ₹{s.ratePerHour || s.dailyRate || s.visitCharge}
          </p>
        </div>
      )
    };
  });

  const filters = ['All', 'Tractor', 'JCB', 'Labour', 'Electrician', 'Plumber'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight font-heading">Nearby Services</h1>
          <p className="text-muted-foreground mt-2">Find available service providers exactly where you are.</p>
        </div>
        <button 
          onClick={getUserLocation}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Update Location
        </button>
      </header>

      {error ? (
        <div className="flex-1 flex items-center justify-center bg-card rounded-2xl border border-border">
          <div className="text-center max-w-md p-6">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-foreground mb-2">Location Required</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button onClick={getUserLocation} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium">
              Enable Location
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Sidebar List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {/* Filters */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                    activeFilter === f 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl shadow-sm p-4 space-y-3 min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center text-muted-foreground pt-12">
                  No services found within 20km.
                </div>
              ) : (
                services.map((s, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={s._id} 
                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground">{s.serviceCategory}</h3>
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {(s.distance / 1000).toFixed(1)} km
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{s.village}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground">
                        ₹{s.ratePerHour || s.dailyRate || s.visitCharge}
                      </span>
                      <button className="text-primary hover:underline font-medium">View</button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Map View */}
          <div className="w-full lg:w-2/3 h-[500px] lg:h-auto relative rounded-2xl overflow-hidden border border-border shadow-sm">
            {location ? (
              <MapViewer 
                center={location} 
                zoom={11} 
                markers={markers} 
                className="w-full h-full absolute inset-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyServices;
