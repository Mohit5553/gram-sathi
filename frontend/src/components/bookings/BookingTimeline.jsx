import React from 'react';
import { CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';
import MapViewer from '../common/MapViewer';

const BookingTimeline = ({ booking, timeline = [] }) => {
  const activeTimeline = timeline.length > 0 ? timeline : booking?.timeline || [];
  if (!activeTimeline || activeTimeline.length === 0) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'accepted': return <CheckCircle2 className="w-5 h-5 text-sky-500" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected':
      case 'cancelled': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100';
      case 'accepted': return 'bg-sky-100';
      case 'in_progress': return 'bg-blue-100';
      case 'completed': return 'bg-emerald-100';
      case 'rejected':
      case 'cancelled': return 'bg-rose-100';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Booking Timeline</h4>
      <div className="relative pl-3">
        {/* Vertical Line */}
        <div className="absolute left-[1.35rem] top-2 bottom-2 w-0.5 bg-slate-200"></div>
        
        <div className="space-y-6 relative">
          {activeTimeline.map((event, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${getStatusColor(event.status)}`}>
                {getStatusIcon(event.status)}
              </div>
              <div className="flex-1 pb-1">
                <p className="text-sm font-bold text-slate-900 capitalize">
                  {event.status.replace('_', ' ')}
                </p>
                {event.description && (
                  <p className="text-sm text-slate-500 mt-0.5">{event.description}</p>
                )}
                <span className="text-xs text-slate-400 font-medium block mt-1">
                  {new Date(event.date).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {booking?.providerStartLocation?.coordinates?.length > 0 && booking?.serviceLocation?.coordinates?.length > 0 && (
        <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200">
          <BookingRouteMap 
            origin={booking.providerStartLocation.coordinates} 
            destination={booking.serviceLocation.coordinates} 
          />
        </div>
      )}
    </div>
  );
};

const BookingRouteMap = ({ origin, destination }) => {
  const [directions, setDirections] = React.useState(null);

  React.useEffect(() => {
    if (!window.google) return;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin[1], origin[0]), // [lng, lat] to lat, lng
        destination: new window.google.maps.LatLng(destination[1], destination[0]),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      }
    );
  }, [origin, destination]);

  return (
    <div className="w-full h-[300px]">
      <MapViewer directionsRoute={directions} center={{ lat: destination[1], lng: destination[0] }} zoom={13} className="w-full h-full" />
    </div>
  );
};

export default BookingTimeline;
