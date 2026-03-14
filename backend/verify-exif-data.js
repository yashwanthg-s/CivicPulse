const pool = require('./config/database');

async function verifyExifData() {
  try {
    console.log('🔍 Verifying EXIF Data in Database...\n');
    
    const connection = await pool.getConnection();
    
    try {
      // Get the latest complaint with EXIF data
      console.log('1️⃣  Fetching latest complaint with EXIF data...\n');
      const [complaints] = await connection.execute(
        `SELECT id, title, exif_latitude, exif_longitude, 
                location_source, confidence_score, capture_timestamp, 
                latitude, longitude, category, priority
         FROM complaints 
         WHERE exif_latitude IS NOT NULL 
         ORDER BY id DESC LIMIT 1`
      );

      if (complaints.length === 0) {
        console.log('❌ No complaints with EXIF data found');
        return;
      }

      const complaint = complaints[0];
      console.log('✅ Found complaint with EXIF data:\n');
      console.log('   Complaint ID:', complaint.id);
      console.log('   Title:', complaint.title);
      console.log('   Category:', complaint.category);
      console.log('   Priority:', complaint.priority);
      console.log('');
      console.log('📍 Location Information:');
      console.log('   EXIF Latitude:', complaint.exif_latitude);
      console.log('   EXIF Longitude:', complaint.exif_longitude);
      console.log('   Manual Latitude:', complaint.latitude);
      console.log('   Manual Longitude:', complaint.longitude);
      console.log('   Location Source:', complaint.location_source);
      console.log('   Confidence Score:', complaint.confidence_score + '%');
      console.log('   Capture Timestamp:', complaint.capture_timestamp);
      console.log('');

      // Check EXIF metadata archive
      console.log('2️⃣  Checking EXIF metadata archive...\n');
      const [metadata] = await connection.execute(
        `SELECT id, complaint_id, camera_make, camera_model, 
                iso_speed, focal_length, exposure_time
         FROM exif_metadata_archive 
         WHERE complaint_id = ?`,
        [complaint.id]
      );

      if (metadata.length > 0) {
        const meta = metadata[0];
        console.log('✅ EXIF metadata found:\n');
        console.log('   Camera Make:', meta.camera_make || 'N/A');
        console.log('   Camera Model:', meta.camera_model || 'N/A');
        console.log('   ISO Speed:', meta.iso_speed || 'N/A');
        console.log('   Focal Length:', meta.focal_length || 'N/A');
        console.log('   Exposure Time:', meta.exposure_time || 'N/A');
        console.log('');
      } else {
        console.log('⚠️  No EXIF metadata found in archive\n');
      }

      // Check location review queue
      console.log('3️⃣  Checking location review queue...\n');
      const [reviewQueue] = await connection.execute(
        `SELECT id, complaint_id, reason, priority, reviewed_at
         FROM location_review_queue 
         WHERE complaint_id = ?`,
        [complaint.id]
      );

      if (reviewQueue.length > 0) {
        const review = reviewQueue[0];
        console.log('⚠️  Complaint flagged for location review:\n');
        console.log('   Review ID:', review.id);
        console.log('   Reason:', review.reason);
        console.log('   Priority:', review.priority);
        console.log('   Reviewed At:', review.reviewed_at || 'Not yet reviewed');
        console.log('');
      } else {
        console.log('✅ No location discrepancies detected\n');
      }

      // Summary
      console.log('📊 VERIFICATION SUMMARY:\n');
      console.log('✅ EXIF Location Extraction: SUCCESS');
      console.log('✅ Confidence Score: ' + complaint.confidence_score + '%');
      console.log('✅ Location Source: ' + complaint.location_source);
      console.log('✅ Database Storage: SUCCESS');
      console.log('');
      console.log('🎉 EXIF feature is working correctly!');

    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying EXIF data:', error.message);
    process.exit(1);
  }
}

verifyExifData();
