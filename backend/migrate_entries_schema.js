const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration for entries table...');

    // Add part_of_speech column
    try {
      await db.query('ALTER TABLE entries ADD COLUMN part_of_speech VARCHAR(50)');
      console.log('✓ Added part_of_speech column');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ part_of_speech column already exists');
      } else {
        throw err;
      }
    }

    // Add pronunciation column
    try {
      await db.query('ALTER TABLE entries ADD COLUMN pronunciation VARCHAR(255)');
      console.log('✓ Added pronunciation column');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ pronunciation column already exists');
      } else {
        throw err;
      }
    }

    // Add example column
    try {
      await db.query('ALTER TABLE entries ADD COLUMN example TEXT');
      console.log('✓ Added example column');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ example column already exists');
      } else {
        throw err;
      }
    }

    // Add related_words column
    try {
      await db.query('ALTER TABLE entries ADD COLUMN related_words TEXT');
      console.log('✓ Added related_words column');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ related_words column already exists');
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
