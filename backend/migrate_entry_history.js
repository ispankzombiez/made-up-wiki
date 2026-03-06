const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration for entry history...');

    // Create entry_history table
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS entry_history (
          id SERIAL PRIMARY KEY,
          entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
          word VARCHAR(255) NOT NULL,
          part_of_speech VARCHAR(50),
          pronunciation VARCHAR(255),
          definition TEXT,
          example TEXT,
          related_words TEXT,
          categories TEXT,
          changed_by INTEGER REFERENCES users(id),
          change_description VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ Created entry_history table');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ entry_history table already exists');
      } else {
        throw err;
      }
    }

    // Create index for faster lookups
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_entry_history_entry_id ON entry_history(entry_id)');
      console.log('✓ Created index on entry_history.entry_id');
    } catch (err) {
      console.error('Error creating index:', err.message);
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
