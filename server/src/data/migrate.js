import createUserTable from './createUserTable.js';
import createEventTables from './createEventTable.js';
import createFriendsTable from './createFriendsTable.js';
import { pool } from '../config/db.js';

async function migrate() {
  console.log('Running database migrations...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('');
  
  try {
    await createUserTable();
    await createEventTables();
    await createFriendsTable();
    
    console.log('');
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();