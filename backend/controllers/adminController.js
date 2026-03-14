const Complaint = require('../models/Complaint');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper function to extract important keywords from description
function extractKeywords(text) {
  // Emergency/urgent keywords
  const urgentKeywords = [
    'fire', 'accident', 'emergency', 'urgent', 'danger', 'critical', 'immediate',
    'injured', 'death', 'dead', 'bleeding', 'explosion', 'collapse', 'flood',
    'gas leak', 'electric shock', 'attack', 'violence', 'robbery', 'theft'
  ];
  
  // Problem keywords
  const problemKeywords = [
    'broken', 'damaged', 'leaking', 'overflow', 'blocked', 'stuck', 'not working',
    'malfunctioning', 'hazard', 'unsafe', 'dangerous', 'pothole', 'crack',
    'garbage', 'waste', 'sewage', 'water', 'electricity', 'power cut', 'outage',
    'traffic', 'signal', 'light', 'road', 'street', 'bridge', 'building'
  ];
  
  const allKeywords = [...urgentKeywords, ...problemKeywords];
  const textLower = text.toLowerCase();
  
  // Find matching keywords
  const found = allKeywords.filter(keyword => textLower.includes(keyword));
  
  // Extract 2-3 word phrases that seem important
  const words = text.split(/\s+/);
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i + 1]}`.toLowerCase();
    if (allKeywords.some(kw => twoWord.includes(kw))) {
      phrases.push(words[i] + ' ' + words[i + 1]);
    }
  }
  
  // Combine and deduplicate
  const combined = [...new Set([...found, ...phrases])];
  
  // Return top 5 keywords
  return combined.slice(0, 5);
}

// Helper function to calculate urgency score
function calculateUrgencyScore(complaint, aiData) {
  let score = 0;
  
  // Priority weight (0-40 points)
  const priorityScores = { critical: 40, high: 30, medium: 20, low: 10 };
  score += priorityScores[complaint.priority] || 10;
  
  // AI confidence weight (0-20 points)
  // Confidence is typically 0.0-1.0, so multiply by 20
  if (aiData.confidence) {
    score += aiData.confidence * 20;
  } else if (aiData.scores) {
    // Fallback: if scores object exists, calculate average
    const scores = Object.values(aiData.scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    score += avgScore * 20;
  } else {
    // Default confidence
    score += 15; // 75% confidence = 15 points
  }
  
  // Keyword urgency weight (0-30 points)
  const urgentWords = ['fire', 'accident', 'emergency', 'urgent', 'danger', 'critical', 'immediate', 'injured', 'death'];
  const textLower = (complaint.title + ' ' + complaint.description).toLowerCase();
  const urgentCount = urgentWords.filter(word => textLower.includes(word)).length;
  score += Math.min(urgentCount * 10, 30);
  
  // Recency weight (0-10 points) - newer complaints get higher score
  const hoursSinceCreated = (Date.now() - new Date(complaint.created_at)) / (1000 * 60 * 60);
  if (hoursSinceCreated < 1) score += 10;
  else if (hoursSinceCreated < 6) score += 7;
  else if (hoursSinceCreated < 24) score += 5;
  else if (hoursSinceCreated < 72) score += 2;
  
  return score;
}

class AdminController {
  static async getStats(req, res) {
    try {
      const stats = await Complaint.getStatistics();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  static async getEmergencyComplaints(req, res) {
    try {
      console.log('🚨 Detecting emergency complaints...');
      
      // Get ONLY unassigned complaints (status = 'submitted')
      const complaints = await Complaint.getUnassignedComplaints();
      console.log(`Found ${complaints.length} unassigned complaints to analyze`);

      // Use AI to analyze and prioritize
      const analyzedComplaints = [];
      
      for (const complaint of complaints) {
        try {
          // Send to AI for priority analysis and keyword extraction
          const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
            title: complaint.title,
            description: complaint.description
          }, { timeout: 5000 });

          // Extract important keywords from description
          const keywords = extractKeywords(complaint.description);

          analyzedComplaints.push({
            ...complaint,
            ai_priority: aiResponse.data.priority,
            ai_confidence: aiResponse.data.confidence || 0.85,
            ai_recommendation: aiResponse.data.recommendation,
            keywords: keywords,
            urgency_score: calculateUrgencyScore(complaint, aiResponse.data)
          });
        } catch (aiError) {
          console.warn('AI analysis failed for complaint', complaint.id);
          
          const keywords = extractKeywords(complaint.description);
          
          analyzedComplaints.push({
            ...complaint,
            ai_priority: complaint.priority,
            ai_confidence: 0.75,
            keywords: keywords,
            urgency_score: calculateUrgencyScore(complaint, { priority: complaint.priority })
          });
        }
      }

      // Group duplicate complaints by cluster_hash
      const complaintMap = new Map();
      
      for (const complaint of analyzedComplaints) {
        if (complaint.cluster_hash) {
          // This is a duplicate - group by cluster_hash
          if (!complaintMap.has(complaint.cluster_hash)) {
            complaintMap.set(complaint.cluster_hash, {
              ...complaint,
              duplicate_count: 1,
              citizen_ids: [complaint.user_id],
              all_complaint_ids: [complaint.id]
            });
          } else {
            // Add to existing cluster
            const existing = complaintMap.get(complaint.cluster_hash);
            existing.duplicate_count += 1;
            existing.citizen_ids.push(complaint.user_id);
            existing.all_complaint_ids.push(complaint.id);
            // Update urgency score to highest in cluster
            existing.urgency_score = Math.max(existing.urgency_score, complaint.urgency_score);
          }
        } else {
          // Unique complaint
          complaintMap.set(complaint.id, {
            ...complaint,
            duplicate_count: 1,
            citizen_ids: [complaint.user_id],
            all_complaint_ids: [complaint.id]
          });
        }
      }

      // Convert map to array and sort
      const groupedComplaints = Array.from(complaintMap.values());
      
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      groupedComplaints.sort((a, b) => {
        // First by urgency score
        if (b.urgency_score !== a.urgency_score) {
          return b.urgency_score - a.urgency_score;
        }
        // Then by priority
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Finally by date (newest first)
        return new Date(b.created_at) - new Date(a.created_at);
      });

      console.log(`✓ Analyzed ${analyzedComplaints.length} complaints, grouped into ${groupedComplaints.length} unique issues`);

      // Return only top 2 most urgent complaints
      const top2Emergency = groupedComplaints.slice(0, 2);

      res.json({
        success: true,
        count: top2Emergency.length,
        total_analyzed: analyzedComplaints.length,
        total_unique_issues: groupedComplaints.length,
        complaints: top2Emergency
      });
    } catch (error) {
      console.error('Get emergency complaints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch emergency complaints',
        error: error.message
      });
    }
  }

  static async getAllFeedbacks(req, res) {
    try {
      const feedbacks = await Complaint.getAllFeedbacks();

      res.json({
        success: true,
        count: feedbacks.length,
        feedbacks
      });
    } catch (error) {
      console.error('Get feedbacks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feedbacks',
        error: error.message
      });
    }
  }

  static async getDailyReport(req, res) {
    try {
      const { date } = req.query;
      const reportDate = date || new Date().toISOString().split('T')[0];

      const report = await Complaint.getDailyReport(reportDate);

      res.json({
        success: true,
        date: reportDate,
        report
      });
    } catch (error) {
      console.error('Get daily report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily report',
        error: error.message
      });
    }
  }

  static async getAllComplaints(req, res) {
    try {
      const complaints = await Complaint.getAllForAdmin();

      res.json({
        success: true,
        count: complaints.length,
        complaints
      });
    } catch (error) {
      console.error('Get all complaints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch all complaints',
        error: error.message
      });
    }
  }

  static async getHeatmapData(req, res) {
    try {
      const { category, days = 30 } = req.query;

      // Get complaints with valid coordinates
      let complaints = await Complaint.getAllForAdmin();

      // Filter by valid coordinates
      complaints = complaints.filter(c => {
        const lat = parseFloat(c.latitude);
        const lng = parseFloat(c.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      });

      // Filter by category if provided
      if (category && category !== 'all') {
        complaints = complaints.filter(c => c.category === category);
      }

      // Filter by date range if provided
      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        complaints = complaints.filter(c => new Date(c.created_at) >= cutoffDate);
      }

      // Cluster complaints by geographic proximity (200 meters)
      const clusterRadius = 0.2; // km
      const clusters = [];
      const visited = new Set();

      complaints.forEach((complaint, index) => {
        if (visited.has(index)) return;

        const cluster = [complaint];
        visited.add(index);

        complaints.forEach((otherComplaint, otherIndex) => {
          if (visited.has(otherIndex)) return;

          const distance = calculateDistance(
            complaint.latitude,
            complaint.longitude,
            otherComplaint.latitude,
            otherComplaint.longitude
          );

          if (distance <= clusterRadius) {
            cluster.push(otherComplaint);
            visited.add(otherIndex);
          }
        });

        // Calculate cluster center and intensity
        const avgLat = cluster.reduce((sum, c) => sum + parseFloat(c.latitude), 0) / cluster.length;
        const avgLng = cluster.reduce((sum, c) => sum + parseFloat(c.longitude), 0) / cluster.length;

        clusters.push({
          latitude: parseFloat(avgLat.toFixed(6)),
          longitude: parseFloat(avgLng.toFixed(6)),
          count: cluster.length,
          complaints: cluster.map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            priority: c.priority,
            status: c.status
          }))
        });
      });

      // Calculate metrics
      const totalComplaints = complaints.length;
      const hotspotAreas = clusters.filter(c => c.count >= 3).length;
      const maxCount = Math.max(...clusters.map(c => c.count), 1);

      // Calculate coverage area
      if (complaints.length > 0) {
        const lats = complaints.map(c => parseFloat(c.latitude));
        const lngs = complaints.map(c => parseFloat(c.longitude));
        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        var coverageArea = `${latRange.toFixed(2)}° × ${lngRange.toFixed(2)}°`;
      }

      res.json({
        success: true,
        data: {
          clusters: clusters.sort((a, b) => b.count - a.count),
          metrics: {
            totalComplaints,
            hotspotAreas,
            maxDensity: maxCount,
            coverageArea: coverageArea || 'N/A'
          }
        }
      });
    } catch (error) {
      console.error('Get heatmap data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch heatmap data',
        error: error.message
      });
    }
  }
  static async getKanbanData(req, res) {
    try {
      // Fetch all complaints
      const complaints = await Complaint.getAllForAdmin();

      // Map database status to Kanban status
      const statusMap = {
        'submitted': 'open',
        'under_review': 'assigned',
        'in_progress': 'in_progress',
        'resolved': 'resolved',
        'verified': 'verified',
        'rejected': 'reopened'
      };

      // Organize complaints by Kanban status
      const kanbanData = {
        open: [],
        assigned: [],
        in_progress: [],
        resolved: [],
        verified: []
      };

      complaints.forEach(complaint => {
        const kanbanStatus = statusMap[complaint.status] || 'open';

        // Only add to valid Kanban statuses
        if (kanbanData.hasOwnProperty(kanbanStatus)) {
          kanbanData[kanbanStatus].push({
            id: complaint.id,
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            priority: complaint.priority,
            latitude: complaint.latitude,
            longitude: complaint.longitude,
            status: complaint.status,
            assigned_worker_id: complaint.assigned_worker_id,
            created_at: complaint.created_at,
            updated_at: complaint.updated_at,
            image_path: complaint.image_path,
            before_image_path: complaint.before_image_path,
            after_image_path: complaint.after_image_path
          });
        }
      });

      // Sort each column by created_at (newest first)
      Object.keys(kanbanData).forEach(status => {
        kanbanData[status].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      });

      res.json({
        success: true,
        data: kanbanData
      });
    } catch (error) {
      console.error('Get kanban data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch kanban data',
        error: error.message
      });
    }
  }


}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}


module.exports = AdminController;
