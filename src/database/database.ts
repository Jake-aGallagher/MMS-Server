import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'mms',
    password: 'Newcastle123!'
});

export default pool.promise();