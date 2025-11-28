// src/components/MapPicker.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

const MapPicker = ({ selectedLocation, onLocationSelect }) => {
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const defaultCenter = [28.6139, 77.209]; // Delhi

  useEffect(() => {
    if (selectedLocation?.address) {
      setAddress(selectedLocation.address);
    }
  }, [selectedLocation]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please select on the map.');
      }
    );
  };

  const handleLocationSelect = async (location) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
      );
      const data = await response.json();

      const formattedAddress =
        data.display_name ||
        `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;

      setAddress(formattedAddress);

      onLocationSelect({
        ...location,
        address: formattedAddress,
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      const fallbackAddress = `${location.lat.toFixed(
        6
      )}, ${location.lng.toFixed(6)}`;
      setAddress(fallbackAddress);
      onLocationSelect({
        ...location,
        address: fallbackAddress,
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Select Location on Map
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <MapPin className="h-4 w-4" />
          <span>Use Current Location</span>
        </button>
      </div>

      <div className="relative">
        <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 z-0">
          <MapContainer
            center={
              selectedLocation
                ? [selectedLocation.lat, selectedLocation.lng]
                : defaultCenter
            }
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker
              position={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />
          </MapContainer>
        </div>

        <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-lg text-sm text-gray-600 pointer-events-none">
          Click on map to select location
        </div>
      </div>

      {selectedLocation && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Address
          </label>
          <div className="p-3 bg-gray-50 rounded-lg">
            {isLoadingAddress ? (
              <div className="flex items-center space-x-2">
                <div className="spinner" />
                <span className="text-sm text-gray-600">
                  Getting address...
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-800">
                {address || 'Address not available'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
