import mysql from 'mysql2/promise';

export async function copyDatabase(newClient: string) {
    if (!newClient || newClient.length !== 4) {
        throw new Error('New client code is required');
    }
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    const oldDatabase = 'gmoc_master';
    const newDatabase = 'client_' + newClient;

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${newDatabase}`);
    const [tables] = await connection.query(`SHOW TABLES IN ${oldDatabase}`);

    // @ts-ignore
    for (let table of tables) {
        const tableName = table[`Tables_in_${oldDatabase}`];
        await connection.query(`CREATE TABLE ${newDatabase}.${tableName} LIKE ${oldDatabase}.${tableName}`);
    }

    const tableData = ['permissions', 'status_types', 'task_types', 'urgency_types', 'user_groups'];
    for (let table of tableData) {
        await connection.query(`INSERT INTO ${newDatabase}.${table} SELECT * FROM ${oldDatabase}.${table}`);
    }

    await connection.end();
}

//copyDatabase().catch(console.error);
