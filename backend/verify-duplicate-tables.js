const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Check if cluster tables exist
    console.log('📋 Checking for cluster tables...\n');

    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('complaint_clusters', 'complaint_cluster_members')
    `, [process.env.DB_NAME || 'complaint_system']);

    if (tables.length === 0) {
      console.log('❌ Cluster tables NOT found');
      console.log('\nCreating cluster tables...\n');

      // Create complaint_clusters table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS complaint_clusters (
          id INT PRIMARY KEY AUTO_INCREMENT,
          cluster_hash VARCHAR(255) UNIQUE,
          category VARCHAR(50),
          primary_complaint_id INT,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          complaint_count INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (primary_complaint_id) REFERENCES complaints(id)
        )
      `);
      console.log('✓ Created complaint_clusters table');

      // Create complaint_cluster_members table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS complaint_cluster_members (
          id INT PRIMARY KEY AUTO_INCREMENT,
          cluster_id INT,
          complaint_id INT,
          similarity_score DECIMAL(3, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cluster_id) REFERENCES complaint_clusters(id),
          FOREIGN KEY (complaint_id) REFERENCES complaints(id)
        )
      `);
      console.log('✓ Created complaint_cluster_members table');
    } else {
      console.log('✓ Cluster tables found:');
      tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    }

    // Check for existing clusters
    console.log('\n📊 Checking for existing clusters...\n');
    const [clusters] = await connection.execute(`
      SELECT 
        cc.id,
        cc.cluster_hash,
        cc.category,
        cc.primary_complaint_id,
        cc.complaint_count,
        COUNT(ccm.id) as member_count
      FROM complaint_clusters cc
      LEFT JOIN complaint_cluster_members ccm ON cc.id = ccm.cluster_id
      GROUP BY cc.id
      ORDER BY cc.complaint_count DESC
    `);

    if (clusters.length === 0) {
      console.log('No clusters found yet');
    } else {
      console.log(`Found ${clusters.length} cluster(s):\n`);
      clusters.forEach(cluster => {
        console.log(`  Cluster ID: ${cluster.id}`);
        console.log(`    Category: ${cluster.category}`);
        console.log(`    Primary Complaint: ${cluster.primary_complaint_id}`);
        console.log(`    Total Complaints: ${cluster.complaint_count}`);
        console.log(`    Members in DB: ${cluster.member_count}`);
        console.log('');
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

verifyTables();
