import mysql from 'mysql2';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });
  
  async function getConnection(database: string) {
    const connection = await pool.promise();
    await connection.query(`USE ${database}`);
    return connection;
  }
  
  export default getConnection;