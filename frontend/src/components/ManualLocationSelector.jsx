import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ManualLocationSelector.css';

export const ManualLocationSelector = ({ onLocationSelected, initialLocation }) => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [mapContainer, setMapContainer] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!mapContainer) return;

    // Initialize map
    const defaultCenter = (initialLocation && initialLocation.latitude && initialLocation.longitude) 
      ? [initialLocation.latitude, initialLocation.longitude]
      : [13.0827, 80.2707]; // Default to Chennai
    const mapInstance = L.map(mapContainer).setView(defaultCenter, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstance);

    // Add click handler to select location
    mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updateMarker(mapInstance, lat, lng);
      setSelectedLocation({ latitude: lat, longitude: lng });
      onLocationSelected({ latitude: lat, longitude: lng });
    });

    setMap(mapInstance);

    // Add initial marker if location provided
    if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
      updateMarker(mapInstance, initialLocation.latitude, initialLocation.longitude);
    }

    return () => {
      mapInstance.remove();
    };
  }, [mapContainer, initialLocation, onLocationSelected]);

  const updateMarker = (mapInstance, lat, lng) => {
    // Remove existing marker
    if (marker) {
      mapInstance.removeLayer(marker);
    }

    // Add new marker
    const newMarker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    })
      .bindPopup(`Selected Location<br/>${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .addTo(mapInstance)
      .openPopup();

    setMarker(newMarker);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ latitude, longitude });
          onLocationSelected({ latitude, longitude });

          if (map) {
            map.setView([latitude, longitude], 15);
            updateMarker(map, latitude, longitude);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get current location. Please click on the map to select location.');
        }
      );
    } else {
      alert('Geolocation is not supported. Please click on the map to select location.');
    }
  };

  return (
    <div className="manual-location-selector">
      <h3>📍 Select Location on Map</h3>
      <p className="instruction-text">Click on the map to select the complaint location</p>

      <div className="map-container" ref={setMapContainer} style={{ height: '300px' }} />

      <div className="location-controls">
        <button onClick={handleUseCurrentLocation} className="btn btn-secondary">
          📍 Use Current Location
        </button>
      </div>

      {selectedLocation && (
        <div className="selected-location-info">
          <p>
            <strong>Selected Location:</strong>
            <br />
            Latitude: {selectedLocation.latitude.toFixed(6)}
            <br />
            Longitude: {selectedLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};
