const Complaint = require('../models/Complaint');
const axios = require('axios');
const contentFilter = require('../utils/contentFilter');
const fs = require('fs');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper function to save resolution images from base64
async function saveResolutionImage(base64Image, complaintId, type) {
  try {
    console.log(`\n  === SAVE RESOLUTION IMAGE (${type}) ===`);
    console.log(`  Complaint ID: ${complaintId}`);
    console.log(`  Image data length: ${base64Image?.length} bytes`);

    // Remove data URL prefix if present
    let imageData = base64Image;
    if (base64Image.includes(',')) {
      imageData = base64Image.split(',')[1];
      console.log(`  ✓ Removed data URL prefix`);
    }

    // Decode base64 using Buffer (built-in Node.js)
    const buffer = Buffer.from(imageData, 'base64');
    console.log(`  ✓ Decoded base64 to buffer: ${buffer.length} bytes`);

    // Create filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const filename = `resolution-${complaintId}-${type}-${timestamp}-${random}.jpg`;
    console.log(`  📄 Filename: ${filename}`);

    // Save to uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`  📁 Created uploads directory`);
    }

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`  ✓ File saved to: ${filepath}`);

    // Return relative path for database storage
    const relativePath = `/uploads/${filename}`;
    console.log(`  ✓ Database path: ${relativePath}\n`);
    return relativePath;
  } catch (error) {
    console.error(`  ❌ Error saving ${type} image:`, error.message);
    throw error;
  }
}

class ComplaintController {
  static async createComplaint(req, res) {
    try {
      const { title, description, category, priority, latitude, longitude, date, time, user_id } = req.body;
      const userId = user_id || req.user?.id || 1; // Use provided user_id, or auth user, or default to 1

      console.log('Creating complaint for user ID:', userId);
      console.log('Request body:', { title, description, category, priority, latitude, longitude, date, time, user_id });

      // Extract EXIF data from uploaded image
      let exifData = null;
      let exifCoordinates = null;
      let captureTimestamp = null;
      let confidenceScore = 85;
      let locationSource = 'SYSTEM_DEFAULT';
      let locationValidationStatus = null;

      if (req.file) {
        try {
          const ExifParserService = require('../services/exifParserService');
          exifData = await ExifParserService.extractExifData(req.file.path);
          
          if (exifData && exifData.gps) {
            exifCoordinates = exifData.gps;
            confidenceScore = ExifParserService.calculateConfidenceScore(exifData.gps.dop);
            locationSource = 'EXIF';
            locationValidationStatus = 'EXIF_EXTRACTED';
            console.log('✓ EXIF GPS extracted:', exifCoordinates);
          }

          if (exifData && exifData.timestamp) {
            captureTimestamp = exifData.timestamp.iso8601;
            console.log('✓ Capture timestamp extracted:', captureTimestamp);
          }
        } catch (exifError) {
          console.warn('EXIF extraction failed:', exifError.message);
          // Continue without EXIF data
        }
      }

      // Validate required fields
      if (!title || !description || !date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Use EXIF coordinates if available, otherwise require manual coordinates
      let finalLatitude = latitude;
      let finalLongitude = longitude;
      let manualCoordinates = null;

      if (exifCoordinates) {
        finalLatitude = exifCoordinates.latitude;
        finalLongitude = exifCoordinates.longitude;
      } else if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Location required: Either provide GPS coordinates or upload image with EXIF GPS data'
        });
      } else {
        manualCoordinates = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        locationSource = 'MANUAL';
        locationValidationStatus = 'MANUAL_ENTRY';
      }

      // Check content for inappropriate material (but allow civic issues without keywords)
      const contentCheck = contentFilter.checkContent(title, description);
      if (contentCheck.isBlocked) {
        // Only block if it's actually inappropriate (spam, abuse, etc.)
        // Don't block just because it lacks civic keywords
        console.warn('Content check result:', contentCheck);
        
        // If it's just missing keywords, allow it - let the image validation decide
        if (contentCheck.reason && contentCheck.reason.includes('keyword')) {
          console.log('Missing civic keywords but allowing - image will be validated');
        } else {
          // Block only for actual inappropriate content
          contentFilter.logBlockedAttempt(userId, title, description, contentCheck.reason);
          return res.status(400).json({
            success: false,
            message: contentCheck.reason,
            blocked: true
          });
        }
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      // Validate coordinates
      const lat = parseFloat(finalLatitude);
      const lng = parseFloat(finalLongitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }

      // Prepare complaint data with EXIF fields
      let complaintData = {
        user_id: userId,
        title,
        description,
        image_path: `/uploads/${req.file.filename}`,
        latitude: lat,
        longitude: lng,
        date,
        time,
        category: category || 'other',
        priority: priority || 'medium',
        department: category || 'other', // Set department same as category
        exif_latitude: exifCoordinates ? exifCoordinates.latitude : null,
        exif_longitude: exifCoordinates ? exifCoordinates.longitude : null,
        capture_timestamp: captureTimestamp,
        location_source: locationSource,
        location_validation_status: locationValidationStatus,
        confidence_score: confidenceScore
      };

      console.log('Complaint data before Gemini:', complaintData);

      let aiCategory = category || 'other';
      let aiPriority = priority || 'medium';

      // Send to OpenAI API for image analysis (primary) with Gemini fallback
      try {
        const openaiVisionService = require('../services/openaiVisionService');
        const advancedHumanDetectionService = require('../services/advancedHumanDetectionService');
        const fs = require('fs');
        
        // Read image file
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        
        // FIRST: Advanced human detection using OpenAI Vision
        console.log('\n🔍 STEP 1: Advanced Human Detection');
        try {
          const humanDetectionResult = await advancedHumanDetectionService.detectHuman(base64Image);
          
          console.log('\n📊 Human Detection Result:');
          console.log(`  Is Human: ${humanDetectionResult.is_human}`);
          console.log(`  Confidence: ${humanDetectionResult.confidence}%`);
          console.log(`  Features: ${humanDetectionResult.detected_features.join(', ')}`);
          
          // Check if image should be blocked
          if (advancedHumanDetectionService.isHumanImage(humanDetectionResult)) {
            const blockMessage = advancedHumanDetectionService.getBlockMessage(humanDetectionResult);
            console.warn('❌ Image blocked - Human detected:', blockMessage);
            
            return res.status(400).json({
              success: false,
              message: blockMessage,
              blocked: true,
              detection_type: 'human_image',
              detection_details: {
                is_human: true,
                confidence: humanDetectionResult.confidence,
                detected_features: humanDetectionResult.detected_features,
                reason: humanDetectionResult.reason
              }
            });
          }
          
          console.log('✓ Image passed human detection - proceeding with complaint analysis');
        } catch (humanDetectionError) {
          console.warn('Human detection error (non-blocking):', humanDetectionError.message);
          // Continue even if human detection fails - don't block users
        }
        
        // SECOND: Complaint image analysis
        console.log('\n🔍 STEP 2: Complaint Image Analysis');
        
        // Try OpenAI first
        let aiResponse = null;
        try {
          console.log('Analyzing complaint image with OpenAI Vision API...');
          aiResponse = await openaiVisionService.analyzeComplaintImage(
            base64Image,
            title,
            description
          );
          console.log('✓ OpenAI analysis successful');
        } catch (openaiError) {
          console.warn('OpenAI API failed, trying Gemini fallback:', openaiError.message);
          // Fallback to Gemini if OpenAI fails
          try {
            const geminiVisionService = require('../services/geminiVisionService');
            aiResponse = await geminiVisionService.analyzeComplaintImage(
              base64Image,
              title,
              description
            );
            console.log('✓ Gemini fallback successful');
          } catch (geminiError) {
            console.warn('Both OpenAI and Gemini failed, using keyword fallback:', geminiError.message);
            // Both failed, will use keyword fallback below
          }
        }

        // Check if image is blocked (contains human)
        if (aiResponse && aiResponse.is_blocked) {
          console.warn('Image blocked by AI service:', aiResponse.block_reason);
          return res.status(400).json({
            success: false,
            message: aiResponse.block_reason || 'Image contains blocked content',
            blocked: true
          });
        }

        if (aiResponse) {
          // User-selected category takes precedence
          aiCategory = category || aiResponse.category || 'other';
          aiPriority = priority || aiResponse.priority || 'medium';
          complaintData.category = aiCategory;
          complaintData.priority = aiPriority;
          console.log('AI Analysis:', {
            ai_category: aiResponse.category,
            user_category: category,
            final_category: aiCategory,
            ai_priority: aiResponse.priority,
            user_priority: priority,
            final_priority: aiPriority,
            confidence: aiResponse.confidence,
            is_blocked: aiResponse.is_blocked,
            detection_method: aiResponse.detection_method
          });
          console.log('Complaint data after AI analysis:', complaintData);
        }
      } catch (aiError) {
        console.error('Image validation failed:', aiError.message);
        // Allow submission if validation fails - don't block users
        console.warn('⚠️ Image validation failed, allowing submission to proceed');
      }

      // Check for duplicate complaints
      let duplicateInfo = null;
      try {
        console.log('Checking for duplicates...', { category: aiCategory, lat, lng });
        
        // Get recent complaints in same category and area
        const recentComplaints = await Complaint.getRecentInArea(
          aiCategory,
          lat,
          lng,
          30 // Last 30 days
        );

        console.log(`Found ${recentComplaints.length} recent complaints in area`);

        if (recentComplaints.length > 0) {
          console.log('Sending to AI for duplicate check...');
          const duplicateResponse = await axios.post(
            `${AI_SERVICE_URL}/check-duplicate`,
            {
              title,
              description,
              category: aiCategory,
              latitude: lat,
              longitude: lng,
              existing_complaints: recentComplaints
            },
            { timeout: 5000 }
          );

          console.log('Duplicate check response:', duplicateResponse.data);

          if (duplicateResponse.data && duplicateResponse.data.is_duplicate) {
            duplicateInfo = duplicateResponse.data;
            console.log('✓ Duplicate detected:', {
              similar_count: duplicateInfo.similar_complaints.length,
              similarity: duplicateInfo.similarity_score,
              message: duplicateInfo.message
            });
          } else {
            console.log('No duplicate found');
          }
        } else {
          console.log('No recent complaints in area to compare');
        }
      } catch (dupError) {
        console.error('Duplicate check failed:', dupError.message);
        if (dupError.response) {
          console.error('AI service error:', dupError.response.data);
        }
      }

      // Save to database
      const complaintId = await Complaint.create(complaintData);

      // Calculate priority score for the complaint
      try {
        const db = require('../config/database');
        await db.query('CALL calculate_complaint_priority(?)', [complaintId]);
        console.log('✓ Priority score calculated for complaint:', complaintId);
      } catch (priorityError) {
        console.warn('Failed to calculate priority score:', priorityError.message);
        // Don't block complaint creation if priority calculation fails
      }

      // Store EXIF metadata if available
      if (exifData) {
        try {
          await Complaint.storeExifMetadata(complaintId, exifData);
          console.log('✓ EXIF metadata archived');
        } catch (metadataError) {
          console.warn('Failed to store EXIF metadata:', metadataError.message);
        }
      }

      // Validate location if both EXIF and manual coordinates exist
      if (exifCoordinates && manualCoordinates) {
        try {
          const LocationValidatorService = require('../services/locationValidatorService');
          const validationResult = await LocationValidatorService.validateLocationData(
            exifCoordinates,
            manualCoordinates
          );

          // Update complaint with validation status
          await Complaint.updateLocationValidation(complaintId, validationResult);

          // If major discrepancy, add to review queue
          if (validationResult.discrepancyFlag) {
            await LocationValidatorService.createReviewQueueEntry(
              complaintId,
              `Location discrepancy: EXIF (${exifCoordinates.latitude}, ${exifCoordinates.longitude}) vs Manual (${manualCoordinates.latitude}, ${manualCoordinates.longitude}). Distance: ${Math.round(validationResult.distance)}m`
            );
            console.log('⚠️ Complaint flagged for location review');
          }
        } catch (validationError) {
          console.warn('Location validation failed:', validationError.message);
        }
      }

      // If duplicate, link to cluster
      if (duplicateInfo && duplicateInfo.is_duplicate) {
        try {
          await Complaint.linkToCluster(
            complaintId,
            duplicateInfo.cluster_hash,
            duplicateInfo.similar_complaints[0].id,
            duplicateInfo.similarity_score
          );
        } catch (clusterError) {
          console.warn('Failed to link to cluster:', clusterError.message);
        }
      }

      // Prepare response
      const response = {
        success: true,
        message: 'Complaint submitted successfully',
        id: complaintId,
        complaint: {
          id: complaintId,
          ...complaintData
        }
      };

      // Add duplicate notification if found
      if (duplicateInfo && duplicateInfo.is_duplicate) {
        response.duplicate_detected = true;
        response.duplicate_message = duplicateInfo.message;
        response.similar_complaints_count = duplicateInfo.similar_complaints.length;
      }

      res.status(201).json(response);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit complaint',
        error: error.message
      });
    }
  }

  static async getComplaints(req, res) {
    try {
      const filters = {
        category: req.query.category,
        priority: req.query.priority
      };

      // For officer dashboard, show all complaints by category
      const userRole = req.query.role || 'citizen';
      if (userRole === 'officer') {
        // Officers can filter by status if provided (for history view)
        // Otherwise default to submitted complaints
        if (req.query.status) {
          filters.status = req.query.status;
        } else {
          filters.status = 'submitted'; // Default: only show submitted complaints
        }
      } else {
        // Citizens see their own complaints
        filters.user_id = req.query.user_id || req.user?.id;
        // If status is specified, use it
        if (req.query.status) {
          filters.status = req.query.status;
        }
      }

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      const complaints = await Complaint.findAll(filters);

      // For officer dashboard, group duplicate complaints (only for active complaints)
      let displayComplaints = complaints;
      if (userRole === 'officer' && (!req.query.status || req.query.status === 'submitted')) {
        displayComplaints = await ComplaintController.groupDuplicateComplaints(complaints);
      }

      res.json({
        success: true,
        count: displayComplaints.length,
        complaints: displayComplaints
      });
    } catch (error) {
      console.error('Get complaints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaints',
        error: error.message
      });
    }
  }

  static async groupDuplicateComplaints(complaints) {
    try {
      // Get cluster information for all complaints
      const complaintIds = complaints.map(c => c.id);
      
      if (complaintIds.length === 0) {
        return complaints;
      }

      const pool = require('../config/database');
      const connection = await pool.getConnection();
      try {
        // Get cluster members for these complaints
        const placeholders = complaintIds.map(() => '?').join(',');
        const [clusterMembers] = await connection.execute(`
          SELECT ccm.complaint_id, cc.id as cluster_id, cc.primary_complaint_id, cc.complaint_count
          FROM complaint_cluster_members ccm
          JOIN complaint_clusters cc ON ccm.cluster_id = cc.id
          WHERE ccm.complaint_id IN (${placeholders})
        `, complaintIds);

        // Create a map of complaint_id to cluster info
        const clusterMap = {};
        clusterMembers.forEach(member => {
          clusterMap[member.complaint_id] = {
            cluster_id: member.cluster_id,
            primary_complaint_id: member.primary_complaint_id,
            duplicate_count: member.complaint_count
          };
        });

        // Group complaints by cluster
        const groupedByCluster = {};
        const primaryComplaints = [];

        complaints.forEach(complaint => {
          const clusterInfo = clusterMap[complaint.id];
          
          if (clusterInfo) {
            // This complaint is part of a cluster
            const primaryId = clusterInfo.primary_complaint_id;
            
            if (!groupedByCluster[primaryId]) {
              groupedByCluster[primaryId] = {
                complaint: complaint,
                duplicate_count: clusterInfo.duplicate_count,
                is_primary: complaint.id === primaryId
              };
            }
          } else {
            // This complaint is not part of any cluster (standalone)
            primaryComplaints.push({
              ...complaint,
              duplicate_count: 1,
              is_primary: true
            });
          }
        });

        // Add grouped complaints to result
        Object.values(groupedByCluster).forEach(group => {
          primaryComplaints.push({
            ...group.complaint,
            duplicate_count: group.duplicate_count,
            is_primary: group.is_primary
          });
        });

        return primaryComplaints;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error grouping duplicate complaints:', error);
      // If grouping fails, return original complaints with default values
      complaints.forEach(complaint => {
        complaint.duplicate_count = 1;
        complaint.is_primary = true;
      });
      return complaints;
    }
  }

  static async getComplaintById(req, res) {
    try {
      const { id } = req.params;
      const complaint = await Complaint.findById(id);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      res.json({
        success: true,
        complaint
      });
    } catch (error) {
      console.error('Get complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaint',
        error: error.message
      });
    }
  }

  static async updateComplaintStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, message, admin_id } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['submitted', 'under_review', 'resolved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      await Complaint.updateStatus(id, status, message, admin_id);

      res.json({
        success: true,
        message: 'Complaint status updated',
        id
      });
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update complaint',
        error: error.message
      });
    }
  }

  static async deleteComplaint(req, res) {
    try {
      const { id } = req.params;

      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      await Complaint.delete(id);

      res.json({
        success: true,
        message: 'Complaint deleted'
      });
    } catch (error) {
      console.error('Delete complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete complaint',
        error: error.message
      });
    }
  }

  static async submitFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, feedback_text } = req.body;
      const userId = req.user?.id || 1;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      if (complaint.status !== 'resolved') {
        return res.status(400).json({
          success: false,
          message: 'Can only provide feedback for resolved complaints'
        });
      }

      await Complaint.addFeedback(id, userId, rating, feedback_text);

      res.json({
        success: true,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  }

  static async validateImage(req, res) {
    try {
      const { image, title = '', description = '' } = req.body;

      if (!image) {
        return res.status(400).json({
          success: false,
          message: 'Image is required'
        });
      }

      // Remove data URI prefix if present
      let base64Image = image;
      if (image.includes(',')) {
        base64Image = image.split(',')[1];
      }

      console.log('Image validation request:');
      console.log('  Title:', title || '(empty)');
      console.log('  Description:', description || '(empty)');
      console.log('  Image size:', base64Image.length, 'bytes');

      // Use OpenAI Vision API for validation and analysis
      const openaiVisionService = require('../services/openaiVisionService');
      const validationResult = await openaiVisionService.analyzeComplaintImage(
        base64Image,
        title,
        description
      );

      console.log('Validation result:', validationResult);

      // Check if image is blocked
      if (validationResult && validationResult.is_blocked) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: validationResult.block_reason || 'Invalid image',
          blocked: true
        });
      }

      // Image is valid - return detected category and priority
      return res.json({
        success: true,
        valid: true,
        message: 'Image analysis successful',
        category: validationResult.category || 'other',
        priority: validationResult.priority || 'medium',
        confidence: validationResult.confidence || 0.5,
        detected_issue: validationResult.detected_issue || null
      });

    } catch (error) {
      console.error('Image validation error:', error);
      // Allow submission if validation fails
      return res.json({
        success: true,
        valid: true,
        message: 'Image validation skipped (service unavailable)',
        category: 'other',
        priority: 'medium',
        confidence: 0.5
      });
    }
  }

  static async getOfficerComplaints(req, res) {
    try {
      const { userId } = req.params;
      
      console.log('Fetching complaints for officer:', userId);
      
      // Get all complaints assigned to this officer (not resolved)
      const complaints = await Complaint.findAll({
        status: 'submitted'
      });

      res.json(complaints || []);
    } catch (error) {
      console.error('Get officer complaints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaints',
        error: error.message
      });
    }
  }

  static async resolveComplaint(req, res) {
    let connection;
    try {
      const { id } = req.params;
      const { officer_id, after_image, resolution_notes } = req.body;

      console.log('\n=== RESOLVE COMPLAINT DEBUG ===');
      console.log('Complaint ID:', id);
      console.log('Officer ID:', officer_id);
      console.log('Has after_image:', !!after_image);
      console.log('Resolution notes:', resolution_notes);

      if (!after_image) {
        return res.status(400).json({
          success: false,
          message: 'After image is required',
          error: 'No after_image provided in request body'
        });
      }

      if (!officer_id) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required',
          error: 'No officer_id provided in request body'
        });
      }

      const pool = require('../config/database');
      connection = await pool.getConnection();
      
      // Get complaint details to retrieve location
      console.log('Fetching complaint details...');
      const [complaintRows] = await connection.execute(
        'SELECT latitude, longitude FROM complaints WHERE id = ?',
        [id]
      );
      
      if (complaintRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found',
          error: 'No complaint with this ID'
        });
      }

      const complaint = complaintRows[0];
      console.log('✓ Complaint found with location:', { 
        latitude: complaint.latitude, 
        longitude: complaint.longitude 
      });
      
      // Save after image from base64
      console.log('Converting base64 to buffer...');
      const base64Data = after_image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const filename = `resolution-${id}-after-${timestamp}-${random}.jpg`;
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      const afterImagePath = `/uploads/${filename}`;
      console.log('✓ Image saved to:', filepath);

      // Try to extract GPS from after image (for offline scenarios)
      let resolutionLatitude = null;
      let resolutionLongitude = null;
      let gpsSource = 'complaint'; // Default source
      
      try {
        console.log('Attempting to extract GPS from after image...');
        const exifParserService = require('../services/exifParserService');
        const exifData = await exifParserService.extractExifFromBuffer(buffer);
        
        if (exifData && exifData.gps && exifData.gps.latitude && exifData.gps.longitude) {
          resolutionLatitude = exifData.gps.latitude;
          resolutionLongitude = exifData.gps.longitude;
          gpsSource = 'image';
          console.log('✓ GPS extracted from image:', { latitude: resolutionLatitude, longitude: resolutionLongitude });
        } else {
          console.log('ℹ️ No GPS data in image, using complaint location');
          resolutionLatitude = complaint.latitude;
          resolutionLongitude = complaint.longitude;
          gpsSource = 'complaint';
        }
      } catch (exifError) {
        console.log('ℹ️ Could not extract EXIF data:', exifError.message);
        console.log('ℹ️ Using complaint location as fallback');
        resolutionLatitude = complaint.latitude;
        resolutionLongitude = complaint.longitude;
        gpsSource = 'complaint';
      }

      console.log(`✓ Using location from ${gpsSource}:`, { 
        latitude: resolutionLatitude, 
        longitude: resolutionLongitude 
      });

      // Validate location values before storing
      if (resolutionLatitude === null || resolutionLongitude === null) {
        console.error('❌ ERROR: Location values are NULL!');
        console.error('  resolutionLatitude:', resolutionLatitude);
        console.error('  resolutionLongitude:', resolutionLongitude);
        console.error('  complaint.latitude:', complaint.latitude);
        console.error('  complaint.longitude:', complaint.longitude);
        return res.status(400).json({
          success: false,
          message: 'Failed to get location data',
          error: 'Location values are null'
        });
      }

      // Verify location matches complaint location
      console.log('Verifying location...');
      const locationVerificationService = require('../services/locationVerificationService');
      const verificationResult = locationVerificationService.verifyLocation(
        complaint.latitude,
        complaint.longitude,
        resolutionLatitude,
        resolutionLongitude,
        0.1 // 100 meters tolerance
      );
      console.log(`✓ Location verification: ${verificationResult.verified ? 'VERIFIED' : 'NOT VERIFIED'}`);
      console.log(`  Distance: ${verificationResult.distance} km`);
      console.log(`  Reason: ${verificationResult.reason}`);

      // Create resolution record in complaint_resolutions table
      console.log('Creating resolution record...');
      console.log('  Insert params:', {
        complaint_id: id,
        officer_id: officer_id,
        after_image_path: afterImagePath,
        resolution_notes: resolution_notes || '',
        resolution_latitude: resolutionLatitude,
        resolution_longitude: resolutionLongitude,
        location_verified: verificationResult.verified ? 1 : 0,
        location_distance_km: verificationResult.distance
      });
      const insertQuery = `
        INSERT INTO complaint_resolutions 
        (complaint_id, officer_id, after_image_path, resolution_notes, resolution_latitude, resolution_longitude, location_verified, location_distance_km)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const insertParams = [
        id, 
        officer_id, 
        afterImagePath, 
        resolution_notes || '', 
        resolutionLatitude, 
        resolutionLongitude,
        verificationResult.verified ? 1 : 0,
        verificationResult.distance
      ];
      const [result] = await connection.execute(insertQuery, insertParams);
      const resolutionId = result.insertId;
      console.log('✓ Resolution record created:', resolutionId);

      // Update complaint status to resolved
      console.log('Updating complaint status...');
      const updateQuery = `
        UPDATE complaints 
        SET status = 'resolved', 
            resolution_id = ?,
            resolved_by = ?,
            resolved_at = NOW()
        WHERE id = ?
      `;
      const updateParams = [resolutionId, officer_id, id];
      await connection.execute(updateQuery, updateParams);
      console.log('✓ Complaint status updated to resolved');

      res.json({
        success: true,
        message: 'Complaint resolved successfully',
        resolutionId: resolutionId,
        location: {
          latitude: resolutionLatitude,
          longitude: resolutionLongitude,
          source: gpsSource
        },
        verification: {
          verified: verificationResult.verified,
          distance: verificationResult.distance,
          tolerance: verificationResult.tolerance,
          reason: verificationResult.reason
        }
      });
    } catch (error) {
      console.error('❌ Resolve complaint error:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve complaint',
        error: error.message
      });
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (err) {
          console.error('Error releasing connection:', err);
        }
      }
    }
  }

  static async extractExif(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const ExifParserService = require('../services/exifParserService');
      const exifData = await ExifParserService.extractExifData(req.file.path);

      if (!exifData) {
        return res.status(400).json({
          success: false,
          message: 'Failed to extract EXIF data'
        });
      }

      // Calculate confidence score if GPS data exists
      let confidenceScore = 0;
      if (exifData.gps) {
        confidenceScore = ExifParserService.calculateConfidenceScore(exifData.gps.dop);
      }

      res.json({
        success: true,
        gps: exifData.gps,
        timestamp: exifData.timestamp,
        camera: exifData.camera,
        confidenceScore: confidenceScore,
        message: exifData.gps ? 'GPS coordinates extracted successfully' : 'No GPS data found in image'
      });
    } catch (error) {
      console.error('Extract EXIF error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to extract EXIF data',
        error: error.message
      });
    }
  }
}

module.exports = ComplaintController;
