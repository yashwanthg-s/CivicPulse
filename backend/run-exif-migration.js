const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'complaint_system'
  });

  try {
    console.log('Running EXIF location extraction migration...');
    
    // Read migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/add_exif_location_tables.sql'),
      'utf8'
    );

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 60)}...`);
        await connection.execute(statement);
        console.log('✓ Success');
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️ Already exists (skipping)');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✓ EXIF migration completed successfully!');
    console.log('\nNew columns added to complaints table:');
    console.log('  - exif_latitude');
    console.log('  - exif_longitude');
    console.log('  - capture_timestamp');
    console.log('  - location_source');
    console.log('  - location_validation_status');
    console.log('  - location_discrepancy_flag');
    console.log('  - confidence_score');
    console.log('\nNew tables created:');
    console.log('  - location_review_queue');
    console.log('  - exif_metadata_archive');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
