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
    
    console.log('\n=== FIXING MISSING DEPARTMENTS ===\n');
    
    // Update all complaints where department is NULL to use category value
    const [result] = await connection.execute(
      'UPDATE complaints SET department = category WHERE department IS NULL'
    );
    
    console.log(`✓ Updated ${result.affectedRows} complaints with missing departments`);
    
    // Verify the fix
    const [verify] = await connection.execute(
      'SELECT id, title, category, department, status FROM complaints WHERE department IS NULL'
    );
    
    if (verify.length === 0) {
      console.log('✓ All complaints now have departments assigned\n');
    } else {
      console.log(`⚠️ Still ${verify.length} complaints with NULL departments:\n`);
      console.table(verify);
    }
    
    // Show the updated utilities complaints
    const [utilities] = await connection.execute(
      'SELECT id, title, category, department, status FROM complaints WHERE category = "utilities" ORDER BY id DESC'
    );
    
    console.log('\nUtilities Complaints (Updated):');
    console.table(utilities);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
