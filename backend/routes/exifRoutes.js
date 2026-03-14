const express = require('express');
const router = express.Router();
const ExifParserService = require('../services/exifParserService');
const LocationValidatorService = require('../services/locationValidatorService');
const Complaint = require('../models/Complaint');
const { authenticateToken } = require('../middleware/auth');

// Extract EXIF data from uploaded image
router.post('/extract-exif', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data required'
      });
    }

    // Convert base64 to buffer and save temporarily
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const buffer = Buffer.from(image.split(',')[1], 'base64');
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `exif_${Date.now()}.jpg`);
    
    fs.writeFileSync(tempPath, buffer);

    // Extract EXIF data
    const exifData = await ExifParserService.extractExifData(tempPath);

    // Clean up temp file
    try {
      fs.unlinkSync(tempPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    res.json({
      success: true,
      exif: exifData
    });
  } catch (error) {
    console.error('EXIF extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract EXIF data',
      error: error.message
    });
  }
});

// Get location review queue
router.get('/location-review-queue', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access review queue'
      });
    }

    const queue = await LocationValidatorService.getReviewQueue();

    res.json({
      success: true,
      queue
    });
  } catch (error) {
    console.error('Error fetching review queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review queue',
      error: error.message
    });
  }
});

// Approve location
router.post('/approve-location/:complaintId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can approve locations'
      });
    }

    const { complaintId } = req.params;
    const result = await LocationValidatorService.approveLocation(complaintId, req.user.id);

    res.json({
      success: true,
      message: 'Location approved',
      result
    });
  } catch (error) {
    console.error('Error approving location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve location',
      error: error.message
    });
  }
});

// Reject complaint
router.post('/reject-complaint/:complaintId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reject complaints'
      });
    }

    const { complaintId } = req.params;
    const { reason } = req.body;

    const result = await LocationValidatorService.rejectComplaint(
      complaintId,
      req.user.id,
      reason
    );

    res.json({
      success: true,
      message: 'Complaint rejected',
      result
    });
  } catch (error) {
    console.error('Error rejecting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject complaint',
      error: error.message
    });
  }
});

// Correct location
router.post('/correct-location/:complaintId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can correct locations'
      });
    }

    const { complaintId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude required'
      });
    }

    const result = await LocationValidatorService.correctLocation(
      complaintId,
      latitude,
      longitude,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Location corrected',
      result
    });
  } catch (error) {
    console.error('Error correcting location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to correct location',
      error: error.message
    });
  }
});

module.exports = router;
