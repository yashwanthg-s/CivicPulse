const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCategoryHistory() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Test each category with status=resolved filter
    const categories = ['infrastructure', 'sanitation', 'traffic', 'utilities'];
    
    for (const category of categories) {
      console.log(`\n📋 Testing category: ${category.toUpperCase()}`);
      console.log('Query: SELECT * FROM complaints WHERE category = ? AND status = "resolved"');
      
      const [results] = await connection.execute(
        'SELECT id, title, category, status FROM complaints WHERE category = ? AND status = "resolved"',
        [category]
      );
      
      console.log(`  Results: ${results.length} complaints`);
      results.forEach(r => {
        console.log(`    - ID ${r.id}: ${r.title} (${r.status})`);
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

testCategoryHistory();
