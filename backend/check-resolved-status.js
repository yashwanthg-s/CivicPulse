const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkStatus() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Check complaints with resolutions and their status
    console.log('📝 Complaints with resolutions and status:');
    const [records] = await connection.execute(`
      SELECT c.id, c.status, c.resolution_id, cr.id as resolution_id, cr.resolution_latitude, cr.resolution_longitude
      FROM complaints c
      LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
      WHERE c.resolution_id IS NOT NULL
      ORDER BY c.id DESC
      LIMIT 10
    `);

    if (records.length === 0) {
      console.log('  No complaints with resolutions found');
    } else {
      records.forEach(rec => {
        console.log(`\n  Complaint ID: ${rec.id}`);
        console.log(`    Status: ${rec.status}`);
        console.log(`    Resolution ID: ${rec.resolution_id}`);
        console.log(`    Officer Location: ${rec.resolution_latitude ? `${rec.resolution_latitude}, ${rec.resolution_longitude}` : 'NULL'}`);
      });
    }

    // Check all resolved complaints
    console.log('\n\n📊 All complaints with status = "resolved":');
    const [resolved] = await connection.execute(`
      SELECT id, status, resolution_id, resolved_by, resolved_at
      FROM complaints
      WHERE status = 'resolved'
      LIMIT 10
    `);

    if (resolved.length === 0) {
      console.log('  No complaints with status "resolved" found');
    } else {
      resolved.forEach(rec => {
        console.log(`  ID: ${rec.id}, Status: ${rec.status}, Resolution ID: ${rec.resolution_id}`);
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

checkStatus();
