const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkByCategory() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Check resolved complaints by category
    console.log('📊 Resolved complaints by category:');
    const [records] = await connection.execute(`
      SELECT category, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM complaints
      WHERE status = 'resolved'
      GROUP BY category
      ORDER BY category
    `);

    if (records.length === 0) {
      console.log('  No resolved complaints found');
    } else {
      records.forEach(rec => {
        console.log(`\n  ${rec.category.toUpperCase()}: ${rec.count} resolved`);
        console.log(`    IDs: ${rec.ids}`);
      });
    }

    // Check all categories with their complaint counts
    console.log('\n\n📈 All categories with complaint counts:');
    const [allCats] = await connection.execute(`
      SELECT category, 
             COUNT(*) as total,
             SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
             SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted
      FROM complaints
      GROUP BY category
      ORDER BY category
    `);

    allCats.forEach(cat => {
      console.log(`\n  ${cat.category.toUpperCase()}:`);
      console.log(`    Total: ${cat.total}, Resolved: ${cat.resolved}, Submitted: ${cat.submitted}`);
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

checkByCategory();
