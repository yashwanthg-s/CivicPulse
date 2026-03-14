const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_system'
    });

    console.log('✓ Connected to database');

    // Step 1: Add columns to complaints table
    console.log('\n📝 Adding columns to complaints table...');
    try {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD COLUMN IF NOT EXISTS resolution_id INT AFTER status
      `);
      console.log('✓ Added resolution_id column');
    } catch (err) {
      console.log('ℹ️ resolution_id column already exists or error:', err.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD COLUMN IF NOT EXISTS resolved_by INT AFTER resolution_id
      `);
      console.log('✓ Added resolved_by column');
    } catch (err) {
      console.log('ℹ️ resolved_by column already exists or error:', err.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL AFTER resolved_by
      `);
      console.log('✓ Added resolved_at column');
    } catch (err) {
      console.log('ℹ️ resolved_at column already exists or error:', err.message);
    }

    // Step 2: Add indexes
    console.log('\n📑 Adding indexes...');
    try {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD INDEX IF NOT EXISTS idx_resolution_id (resolution_id)
      `);
      console.log('✓ Added idx_resolution_id index');
    } catch (err) {
      console.log('ℹ️ Index already exists or error:', err.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD INDEX IF NOT EXISTS idx_resolved_by (resolved_by)
      `);
      console.log('✓ Added idx_resolved_by index');
    } catch (err) {
      console.log('ℹ️ Index already exists or error:', err.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD INDEX IF NOT EXISTS idx_resolved_at (resolved_at)
      `);
      console.log('✓ Added idx_resolved_at index');
    } catch (err) {
      console.log('ℹ️ Index already exists or error:', err.message);
    }

    // Step 3: Create complaint_resolutions table
    console.log('\n📋 Creating complaint_resolutions table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS complaint_resolutions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          complaint_id INT NOT NULL,
          officer_id INT,
          before_image_path VARCHAR(500),
          after_image_path VARCHAR(500),
          resolution_notes TEXT,
          after_image_latitude DECIMAL(10, 8),
          after_image_longitude DECIMAL(11, 8),
          resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_complaint_id (complaint_id),
          INDEX idx_officer_id (officer_id),
          INDEX idx_resolved_at (resolved_at),
          CONSTRAINT fk_resolution_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
          CONSTRAINT fk_resolution_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✓ Created complaint_resolutions table');
    } catch (err) {
      console.log('ℹ️ Table already exists or error:', err.message);
    }

    // Step 4: Add GPS columns to complaint_resolutions if they don't exist
    console.log('\n📍 Adding GPS columns to complaint_resolutions...');
    try {
      await connection.execute(`
        ALTER TABLE complaint_resolutions 
        ADD COLUMN IF NOT EXISTS resolution_latitude DECIMAL(10, 8)
      `);
      console.log('✓ Added resolution_latitude column');
    } catch (err) {
      console.log('ℹ️ Column already exists or error:', err.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE complaint_resolutions 
        ADD COLUMN IF NOT EXISTS resolution_longitude DECIMAL(11, 8)
      `);
      console.log('✓ Added resolution_longitude column');
    } catch (err) {
      console.log('ℹ️ Column already exists or error:', err.message);
    }

    // Step 5: Add location verification column
    console.log('\n✅ Adding location verification column...');
    try {
      await connection.execute(`
        ALTER TABLE complaint_resolutions 
        ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ Added location_verified column');
    } catch (err) {
      console.log('ℹ️ Column already exists or error:', err.message);
    }

    try {
      await connection.execute(`
        ALTER TABLE complaint_resolutions 
        ADD COLUMN IF NOT EXISTS location_distance_km DECIMAL(10, 6)
      `);
      console.log('✓ Added location_distance_km column');
    } catch (err) {
      console.log('ℹ️ Column already exists or error:', err.message);
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
