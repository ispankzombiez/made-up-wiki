const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration for submission queue...');

    // Add status column
    try {
      await db.query("ALTER TABLE entries ADD COLUMN status VARCHAR(20) DEFAULT 'approved'");
      console.log('✓ Added status column');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ status column already exists');
      } else {
        throw err;
      }
    }

    // Set all existing entries to 'approved' (they are already live)
    try {
      await db.query("UPDATE entries SET status = 'approved' WHERE status IS NULL");
      console.log('✓ Set existing entries to approved status');
    } catch (err) {
      console.error('Error setting existing entries to approved:', err);
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
