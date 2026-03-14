const mysql = require('mysql2/promise');
require('dotenv').config();

async function testQuery() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Test the exact query that should be executed
    const query = `
      SELECT c.*, 
      EXISTS(SELECT 1 FROM complaint_feedback WHERE complaint_id = c.id) as has_feedback,
      cr.before_image_path,
      cr.after_image_path,
      cr.resolution_notes
      FROM complaints c 
      LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
      WHERE 1=1
      AND c.status = ?
      AND c.category = ?
      ORDER BY c.created_at DESC LIMIT 100
    `;

    const params = ['resolved', 'traffic'];

    console.log('Query:', query);
    console.log('Params:', params);
    console.log('\n');

    const [results] = await connection.execute(query, params);
    
    console.log(`Found ${results.length} results`);
    results.forEach(r => {
      console.log(`  - ID ${r.id}: ${r.title} (status: ${r.status}, category: ${r.category})`);
    });

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

testQuery();
