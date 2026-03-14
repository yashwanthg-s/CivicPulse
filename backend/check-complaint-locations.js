const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkComplaints() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Check complaints with resolutions
    console.log('📝 Complaints with resolutions:');
    const [records] = await connection.execute(`
      SELECT c.id, c.latitude, c.longitude, cr.id as resolution_id, cr.resolution_latitude, cr.resolution_longitude
      FROM complaints c
      LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
      WHERE c.status = 'resolved'
      LIMIT 10
    `);

    if (records.length === 0) {
      console.log('  No resolved complaints found');
    } else {
      records.forEach(rec => {
        console.log(`\n  Complaint ID: ${rec.id}`);
        console.log(`    Citizen Location: ${rec.latitude}, ${rec.longitude}`);
        console.log(`    Resolution ID: ${rec.resolution_id}`);
        console.log(`    Officer Location: ${rec.resolution_latitude}, ${rec.resolution_longitude}`);
        console.log(`    Status: ${rec.resolution_latitude ? '✅ Stored' : '❌ NULL'}`);
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

checkComplaints();
