const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Check complaint_resolutions table structure
    console.log('📋 complaint_resolutions table structure:');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'complaint_resolutions' AND TABLE_SCHEMA = ?
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'complaint_system']);

    if (columns.length === 0) {
      console.log('❌ Table does not exist!');
    } else {
      columns.forEach(col => {
        console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (NULL: ${col.IS_NULLABLE}, DEFAULT: ${col.COLUMN_DEFAULT || 'None'})`);
      });
    }

    console.log('\n📊 Checking for location columns:');
    const hasResolutionLatitude = columns.some(c => c.COLUMN_NAME === 'resolution_latitude');
    const hasResolutionLongitude = columns.some(c => c.COLUMN_NAME === 'resolution_longitude');
    const hasLocationVerified = columns.some(c => c.COLUMN_NAME === 'location_verified');
    const hasLocationDistance = columns.some(c => c.COLUMN_NAME === 'location_distance_km');

    console.log(`  resolution_latitude: ${hasResolutionLatitude ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  resolution_longitude: ${hasResolutionLongitude ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  location_verified: ${hasLocationVerified ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  location_distance_km: ${hasLocationDistance ? '✅ EXISTS' : '❌ MISSING'}`);

    // Check sample data
    console.log('\n📝 Sample resolution records:');
    const [records] = await connection.execute(`
      SELECT id, complaint_id, resolution_latitude, resolution_longitude, location_verified, location_distance_km
      FROM complaint_resolutions
      LIMIT 5
    `);

    if (records.length === 0) {
      console.log('  No records found');
    } else {
      records.forEach(rec => {
        console.log(`  ID: ${rec.id}, Complaint: ${rec.complaint_id}`);
        console.log(`    Latitude: ${rec.resolution_latitude}, Longitude: ${rec.resolution_longitude}`);
        console.log(`    Verified: ${rec.location_verified}, Distance: ${rec.location_distance_km}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSchema();
