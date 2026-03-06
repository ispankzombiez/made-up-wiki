const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration for view tracking...');

    // Add views column to entries table
    try {
      await db.query("ALTER TABLE entries ADD COLUMN views INTEGER DEFAULT 0");
      console.log('✓ Added views column');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ views column already exists');
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
