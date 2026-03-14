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
    
    console.log('\n=== CHECKING COMPLAINT STATUS ===\n');
    
    // Check all utilities complaints with their status
    const [complaints] = await connection.execute(
      'SELECT id, title, category, department, status, created_at FROM complaints WHERE category = "utilities" ORDER BY id DESC LIMIT 10'
    );
    
    console.log('Utilities Complaints:');
    console.table(complaints);
    
    // Check if there are any submitted complaints
    const [submitted] = await connection.execute(
      'SELECT COUNT(*) as count FROM complaints WHERE status = "submitted" AND category = "utilities"'
    );
    
    console.log('\nSubmitted Utilities Complaints:', submitted[0].count);
    
    // Check all statuses
    const [statuses] = await connection.execute(
      'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
    );
    
    console.log('\nAll Complaint Statuses:');
    console.table(statuses);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
