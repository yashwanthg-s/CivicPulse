const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'complaint_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('\n=== CHECKING UTILITY COMPLAINTS ===\n');
    
    // Check all utility complaints
    const [utilityComplaints] = await connection.execute(
      'SELECT id, title, category, status, department, priority_score FROM complaints WHERE category = "utilities" ORDER BY id DESC LIMIT 10'
    );
    
    console.log('Utility Complaints:');
    console.table(utilityComplaints);
    
    // Check status distribution
    const [statusDist] = await connection.execute(
      'SELECT category, status, COUNT(*) as count FROM complaints WHERE category = "utilities" GROUP BY category, status'
    );
    
    console.log('\nStatus Distribution for Utilities:');
    console.table(statusDist);
    
    // Check department assignment
    const [deptDist] = await connection.execute(
      'SELECT category, department, COUNT(*) as count FROM complaints WHERE category = "utilities" GROUP BY category, department'
    );
    
    console.log('\nDepartment Distribution for Utilities:');
    console.table(deptDist);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
