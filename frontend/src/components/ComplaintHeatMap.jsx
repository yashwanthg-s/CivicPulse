import React, { useEffect, useRef } from 'react';
import '../styles/ComplaintHeatMap.css';

export const ComplaintHeatMap = ({ complaints = [] }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (complaints.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get bounds of all complaints
    const latitudes = complaints.map(c => parseFloat(c.latitude || 0));
    const longitudes = complaints.map(c => parseFloat(c.longitude || 0));

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    // Padding
    const padding = 40;
    const mapWidth = canvas.width - 2 * padding;
    const mapHeight = canvas.height - 2 * padding;

    // Draw grid background
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * mapWidth;
      const y = padding + (i / 10) * mapHeight;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Create a grid for heat calculation
    const gridSize = 20;
    const grid = {};

    // Count complaints in each grid cell
    complaints.forEach(complaint => {
      const lat = parseFloat(complaint.latitude || 0);
      const lng = parseFloat(complaint.longitude || 0);

      // Normalize to 0-1
      const normLat = (lat - minLat) / latRange;
      const normLng = (lng - minLng) / lngRange;

      // Map to grid
      const gridX = Math.floor(normLng * gridSize);
      const gridY = Math.floor(normLat * gridSize);
      const key = `${gridX},${gridY}`;

      grid[key] = (grid[key] || 0) + 1;
    });

    // Find max count for normalization
    const maxCount = Math.max(...Object.values(grid), 1);

    // Draw heat map
    const cellWidth = mapWidth / gridSize;
    const cellHeight = mapHeight / gridSize;

    Object.entries(grid).forEach(([key, count]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      const intensity = count / maxCount;

      // Color gradient: green -> yellow -> orange -> red
      let color;
      if (intensity < 0.25) {
        color = `rgba(76, 175, 80, ${0.3 + intensity * 0.7})`; // Green
      } else if (intensity < 0.5) {
        color = `rgba(255, 193, 7, ${0.4 + intensity * 0.6})`; // Yellow
      } else if (intensity < 0.75) {
        color = `rgba(255, 152, 0, ${0.5 + intensity * 0.5})`; // Orange
      } else {
        color = `rgba(244, 67, 54, ${0.6 + intensity * 0.4})`; // Red
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        padding + gridX * cellWidth,
        padding + gridY * cellHeight,
        cellWidth,
        cellHeight
      );

      // Draw count if significant
      if (count > 0) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          count,
          padding + gridX * cellWidth + cellWidth / 2,
          padding + gridY * cellHeight + cellHeight / 2
        );
      }
    });

    // Draw individual complaint points
    complaints.forEach(complaint => {
      const lat = parseFloat(complaint.latitude || 0);
      const lng = parseFloat(complaint.longitude || 0);

      const normLat = (lat - minLat) / latRange;
      const normLng = (lng - minLng) / lngRange;

      const x = padding + normLng * mapWidth;
      const y = padding + normLat * mapHeight;

      // Draw point based on priority
      const priorityRadius = {
        critical: 6,
        high: 5,
        medium: 4,
        low: 3
      };

      const radius = priorityRadius[complaint.priority] || 4;

      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw axes labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Latitude labels (left side)
    for (let i = 0; i <= 5; i++) {
      const lat = minLat + (i / 5) * latRange;
      const y = padding + (1 - i / 5) * mapHeight;
      ctx.fillText(lat.toFixed(2), padding - 30, y);
    }

    // Longitude labels (bottom)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 5; i++) {
      const lng = minLng + (i / 5) * lngRange;
      const x = padding + (i / 5) * mapWidth;
      ctx.fillText(lng.toFixed(2), x, canvas.height - padding + 10);
    }

    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Longitude →', canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Latitude ↑', 0, 0);
    ctx.restore();

  }, [complaints]);

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h3>🔥 Complaint Hotspots Heat Map</h3>
        <p>Visual representation of complaint density across locations</p>
      </div>

      <canvas ref={canvasRef} className="heatmap-canvas"></canvas>

      <div className="heatmap-legend">
        <div className="legend-title">Intensity Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'rgba(76, 175, 80, 0.7)' }}></div>
            <span>Low (1-2 complaints)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'rgba(255, 193, 7, 0.7)' }}></div>
            <span>Medium (3-5 complaints)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'rgba(255, 152, 0, 0.7)' }}></div>
            <span>High (6-10 complaints)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'rgba(244, 67, 54, 0.7)' }}></div>
            <span>Critical (10+ complaints)</span>
          </div>
        </div>
      </div>

      <div className="heatmap-stats">
        <div className="stat">
          <span className="stat-label">Total Complaints:</span>
          <span className="stat-value">{complaints.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Hotspot Areas:</span>
          <span className="stat-value">{Math.ceil(complaints.length / 5)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Coverage Area:</span>
          <span className="stat-value">
            {complaints.length > 0 
              ? `${(Math.max(...complaints.map(c => parseFloat(c.latitude || 0))) - Math.min(...complaints.map(c => parseFloat(c.latitude || 0)))).toFixed(2)}° × ${(Math.max(...complaints.map(c => parseFloat(c.longitude || 0))) - Math.min(...complaints.map(c => parseFloat(c.longitude || 0)))).toFixed(2)}°`
              : 'N/A'
            }
          </span>
        </div>
      </div>
    </div>
  );
};
