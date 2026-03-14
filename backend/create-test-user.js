const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const connection = await pool.getConnection();
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Insert test user
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, phone, username, password, role) 
         VALUES (?, ?, ?, ?, ?, 'citizen')`,
        ['Test User', 'test@example.com', '9876543210', 'testuser', hashedPassword]
      );
      
      console.log('✓ Test user created successfully!');
      console.log('Username: testuser');
      console.log('Password: password123');
      console.log('User ID:', result.insertId);
      
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
