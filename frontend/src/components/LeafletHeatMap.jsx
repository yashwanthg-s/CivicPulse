import { useEffect, useRef, useState } from 'react';
import '../styles/LeafletHeatMap.css';

export const LeafletHeatMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDays, setSelectedDays] = useState(30);
  const [error, setError] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);

  // Load Leaflet from CDN
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Check if already loaded
        if (window.L) {
          setLeafletReady(true);
          setLoading(false);
          return;
        }

        // Load Leaflet CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(cssLink);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.async = true;
        script.onload = () => {
          // Load Leaflet.heat plugin
          const heatScript = document.createElement('script');
          heatScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.min.js';
          heatScript.async = true;
          heatScript.onload = () => {
            setLeafletReady(true);
            setLoading(false);
          };
          heatScript.onerror = () => {
            console.warn('Leaflet.heat CDN failed, continuing without heat layer');
            setLeafletReady(true);
            setLoading(false);
          };
          document.body.appendChild(heatScript);
        };
        script.onerror = () => {
          setError('Failed to load Leaflet from CDN');
          setLoading(false);
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading Leaflet:', err);
        setError('Failed to load Leaflet library');
        setLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;

    try {
      const L = window.L;
      if (!L) {
        setError('Leaflet not available');
        return;
      }

      // Create map centered on Bangalore
      const map = L.map(mapRef.current).setView([12.9716, 77.5946], 12);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('Failed to initialize map');
    }
  }, [leafletReady]);

  // Fetch and update heatmap data
  useEffect(() => {
    if (leafletReady) {
      fetchHeatmapData();
    }
  }, [selectedCategory, selectedDays, leafletReady]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      const params = new URLSearchParams();
      params.append('category', selectedCategory);
      params.append('days', selectedDays);
      const url = `${apiUrl}/admin/heatmap?${params.toString()}`;
      console.log('Fetching heatmap from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Heatmap data received:', result);
      
      if (result.success && result.data) {
        setHeatmapData(result.data);
        if (leafletReady && result.data.clusters) {
          await updateHeatmapLayer(result.data.clusters);
        }
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Heatmap fetch error:', err);
      setError(err.message || 'Failed to fetch heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const updateHeatmapLayer = async (clusters) => {
    if (!mapInstanceRef.current || !leafletReady) return;

    try {
      const L = window.L;
      if (!L) return;

      // Remove existing heat layer
      if (heatLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
      }

      // Convert clusters to heatmap format: [lat, lng, intensity]
      const heatData = clusters.map(cluster => {
        // Normalize intensity (0-1)
        const maxCount = Math.max(...clusters.map(c => c.count), 1);
        const intensity = cluster.count / maxCount;
        return [cluster.latitude, cluster.longitude, intensity];
      });

      // Create heat layer if L.heatLayer is available
      if (L.heatLayer) {
        const heatLayer = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.2: '#4CAF50',    // Green
            0.5: '#FFC107',    // Yellow
            0.7: '#FF9800',    // Orange
            1.0: '#F44336'     // Red
          }
        }).addTo(mapInstanceRef.current);

        heatLayerRef.current = heatLayer;
      }

      // Add cluster markers
      clusters.forEach(cluster => {
        const color = getClusterColor(cluster.count);
        const marker = L.circleMarker([cluster.latitude, cluster.longitude], {
          radius: Math.min(cluster.count * 2, 20),
          fillColor: color,
          color: '#333',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6
        }).addTo(mapInstanceRef.current);

        // Popup with cluster info
        const popupContent = `
          <div class="cluster-popup">
            <h4>${cluster.count} Complaint${cluster.count > 1 ? 's' : ''}</h4>
            <p><strong>Location:</strong> ${cluster.latitude.toFixed(4)}, ${cluster.longitude.toFixed(4)}</p>
            <div class="complaint-list">
              ${cluster.complaints.slice(0, 3).map(c => `
                <div class="complaint-item">
                  <span class="category">${c.category}</span>
                  <span class="priority" style="color: ${getPriorityColor(c.priority)}">${c.priority}</span>
                </div>
              `).join('')}
              ${cluster.complaints.length > 3 ? `<p class="more">+${cluster.complaints.length - 3} more</p>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      // Fit bounds to show all clusters
      if (clusters.length > 0) {
        const bounds = L.latLngBounds(
          clusters.map(c => [c.latitude, c.longitude])
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (err) {
      console.error('Error updating heatmap layer:', err);
    }
  };

  const getClusterColor = (count) => {
    if (count >= 10) return '#F44336'; // Red - Critical
    if (count >= 6) return '#FF9800';  // Orange - High
    if (count >= 3) return '#FFC107';  // Yellow - Medium
    return '#4CAF50';                  // Green - Low
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  const categories = ['all', 'Garbage', 'Road Damage', 'Water Leakage', 'Streetlight', 'Other'];

  return (
    <div className="leaflet-heatmap-container">
      <div className="heatmap-controls">
        <div className="control-group">
          <label>Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat === 'all' ? 'all' : cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Time Period:</label>
          <select value={selectedDays} onChange={(e) => setSelectedDays(e.target.value)}>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>

        <button onClick={fetchHeatmapData} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {loading && !leafletReady && (
        <div className="loading-message">
          ⏳ Loading Leaflet library from CDN...
        </div>
      )}

      {loading && leafletReady && (
        <div className="loading-message">
          ⏳ Loading heatmap data...
        </div>
      )}

      <div ref={mapRef} className="leaflet-map"></div>

      {heatmapData && leafletReady && (
        <div className="heatmap-info">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">Total Complaints</div>
              <div className="info-value">{heatmapData.metrics.totalComplaints}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Hotspot Areas</div>
              <div className="info-value">{heatmapData.metrics.hotspotAreas}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Max Density</div>
              <div className="info-value">{heatmapData.metrics.maxDensity}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Coverage Area</div>
              <div className="info-value">{heatmapData.metrics.coverageArea}</div>
            </div>
          </div>

          <div className="legend">
            <h4>Intensity Legend</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
                <span>Low (1-2)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FFC107' }}></div>
                <span>Medium (3-5)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
                <span>High (6-10)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
                <span>Critical (10+)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
