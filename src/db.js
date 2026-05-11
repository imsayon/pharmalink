import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

try {
  const connection = await pool.getConnection();
  console.log('✅ Database connected successfully');
  connection.release();
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
}

export default pool;
