const db = require('./db');

async function migrate() {
  try {
    // Check if is_admin column exists
    const checkColumn = await db.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_admin'
      )`
    );

    if (checkColumn.rows[0].exists) {
      console.log('is_admin column already exists');
    } else {
      console.log('Adding is_admin column...');
      await db.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      console.log('is_admin column added successfully');
    }

    // Set the first/owner user as admin (assuming calebbren1@gmail.com)
    const adminUser = await db.query(
      "UPDATE users SET is_admin = true WHERE email = 'calebbren1@gmail.com' RETURNING id, email, is_admin"
    );

    if (adminUser.rows.length > 0) {
      console.log(`Admin user updated: ${adminUser.rows[0].email} is now admin`);
    } else {
      console.log('Admin user (calebbren1@gmail.com) not found');
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
