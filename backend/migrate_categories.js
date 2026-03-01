const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration for categories column...');

    // Add categories column
    try {
      await db.query('ALTER TABLE entries ADD COLUMN categories TEXT');
      console.log('✓ Added categories column');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ categories column already exists');
      } else {
        throw err;
      }
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
