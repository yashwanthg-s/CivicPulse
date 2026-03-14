const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkClusters() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database\n');

    // Check all clusters with their members
    console.log('📊 All Clusters and Members:\n');

    const [clusters] = await connection.execute(`
      SELECT 
        cc.id as cluster_id,
        cc.category,
        cc.primary_complaint_id,
        cc.complaint_count,
        GROUP_CONCAT(ccm.complaint_id ORDER BY ccm.complaint_id) as member_ids,
        GROUP_CONCAT(c.title ORDER BY c.id) as titles,
        GROUP_CONCAT(c.status ORDER BY c.id) as statuses
      FROM complaint_clusters cc
      LEFT JOIN complaint_cluster_members ccm ON cc.id = ccm.cluster_id
      LEFT JOIN complaints c ON ccm.complaint_id = c.id
      GROUP BY cc.id
      ORDER BY cc.category, cc.id
    `);

    clusters.forEach(cluster => {
      console.log(`Cluster ${cluster.cluster_id} (${cluster.category})`);
      console.log(`  Primary: ${cluster.primary_complaint_id}`);
      console.log(`  Count: ${cluster.complaint_count}`);
      console.log(`  Members: ${cluster.member_ids}`);
      console.log(`  Statuses: ${cluster.statuses}`);
      console.log('');
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

checkClusters();
