const db = require('./db');

async function migrate() {
  try {
    // Check if username column exists
    const checkColumn = await db.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='username'
      )`
    );

    if (checkColumn.rows[0].exists) {
      console.log('username column already exists');
      process.exit(0);
    }

    console.log('Adding username column...');
    await db.query('ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE');
    console.log('username column added successfully');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
