import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center if no location provided (e.g., India center)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const MapViewer = ({ 
  center = defaultCenter, 
  zoom = 12, 
  markers = [], // Array of { lat, lng, id, title, icon, onClick }
  directionsRoute = null, // DirectionsResult object
  className = "w-full h-[400px] rounded-xl overflow-hidden border border-border" 
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const onLoad = useCallback(function callback(map) {
    if (markers.length > 0 && !directionsRoute) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(center.lat, center.lng));
      markers.forEach(m => {
        bounds.extend(new window.google.maps.LatLng(m.lat, m.lng));
      });
      // Add padding
      map.fitBounds(bounds, 50);
    }
    setMap(map);
  }, [markers, center, directionsRoute]);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/50`}>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  // If no API key is provided, show a warning watermark or overlay
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API Key is missing. Map may render with 'Development Purposes Only' watermark or fail to load.");
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Render Customer / Center Marker */}
        {!directionsRoute && (
          <Marker 
            position={center} 
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
            title="Your Location"
          />
        )}

        {/* Render Provider Markers */}
        {!directionsRoute && markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
            icon={marker.icon || 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'}
            onClick={() => {
              setActiveMarker(marker);
              if (marker.onClick) marker.onClick();
            }}
          >
            {activeMarker?.id === marker.id && marker.infoWindowContent && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="p-1 max-w-[200px]">
                  {marker.infoWindowContent}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Render Directions */}
        {directionsRoute && (
          <DirectionsRenderer 
            directions={directionsRoute}
            options={{
              suppressMarkers: false,
              polylineOptions: { strokeColor: '#10b981', strokeWeight: 5 }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapViewer;
