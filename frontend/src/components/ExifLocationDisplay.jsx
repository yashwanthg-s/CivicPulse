import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ExifLocationDisplay.css';

export const ExifLocationDisplay = ({ 
  exifCoordinates, 
  manualCoordinates, 
  confidenceScore,
  onManualLocationChange 
}) => {
  const [map, setMap] = useState(null);
  const [mapContainer, setMapContainer] = useState(null);

  useEffect(() => {
    if (!mapContainer) return;

    // Initialize map
    const mapInstance = L.map(mapContainer).setView([13.0827, 80.2707], 18);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [mapContainer]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add EXIF location marker (blue)
    if (exifCoordinates) {
      const exifMarker = L.marker(
        [exifCoordinates.latitude, exifCoordinates.longitude],
        {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }
      ).bindPopup('📍 EXIF Location').addTo(map);

      map.setView([exifCoordinates.latitude, exifCoordinates.longitude], 18);
    }

    // Add manual location marker (red) if different from EXIF
    if (manualCoordinates && exifCoordinates) {
      const distance = calculateDistance(
        exifCoordinates.latitude,
        exifCoordinates.longitude,
        manualCoordinates.latitude,
        manualCoordinates.longitude
      );

      if (distance > 10) {
        L.marker(
          [manualCoordinates.latitude, manualCoordinates.longitude],
          {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }
        ).bindPopup('📍 Manual Location').addTo(map);
      }
    }
  }, [map, exifCoordinates, manualCoordinates]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees) => (degrees * Math.PI) / 180;

  const getConfidenceColor = () => {
    if (confidenceScore >= 90) return '#4CAF50'; // Green
    if (confidenceScore >= 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getConfidenceLabel = () => {
    if (confidenceScore >= 90) return 'High Confidence';
    if (confidenceScore >= 70) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="exif-location-display">
      <h3>📍 Location Information</h3>

      {exifCoordinates ? (
        <div className="location-info">
          <div className="map-container" ref={setMapContainer} style={{ height: '300px' }} />

          <div className="coordinates-display">
            <div className="coordinate-row">
              <strong>EXIF Location:</strong>
              <span>
                {exifCoordinates.latitude.toFixed(6)}, {exifCoordinates.longitude.toFixed(6)}
              </span>
            </div>

            {manualCoordinates && (
              <div className="coordinate-row">
                <strong>Manual Location:</strong>
                <span>
                  {manualCoordinates.latitude.toFixed(6)}, {manualCoordinates.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          <div className="confidence-indicator">
            <div
              className="confidence-bar"
              style={{
                width: `${confidenceScore}%`,
                backgroundColor: getConfidenceColor()
              }}
            />
            <div className="confidence-text">
              <strong>{getConfidenceLabel()}</strong>
              <span>{confidenceScore}%</span>
            </div>
          </div>

          <p className="success-message">✓ Location extracted from photo metadata</p>
        </div>
      ) : (
        <div className="no-exif-message">
          <p>📸 GPS data not found in photo</p>
          <p>Please select the location on the map below</p>
        </div>
      )}
    </div>
  );
};
