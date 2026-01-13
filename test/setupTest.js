import mysql from 'mysql2'
import dotenv from  'dotenv'
dotenv.config({path:"../.env"})
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __currentFilePath = fileURLToPath(import.meta.url);
const __currentDirname = path.dirname(__currentFilePath)
let connection;


// to create a connection with our test database,using fs to readFile of the schema.sql so that any changes gets automatically updated
beforeAll(async()=>{
   connection = await mysql.createConnection({
        host:process.env.TEST_DATABASE_HOST,
        user:process.env.TEST_DATABASE_USER,
        password:process.env.TEST_DATABASE_PASSWORD,
        database:process.env.TEST_DATABASE_NAME,
        multipleStatements:true
   });
    const schemaPath = path.join(__currentDirname,'../databases/schema.sql');
    const schema = await fs.readFile(schemaPath,'utf-8');
    await connection.query(schema);

    console.log(`Test database initialized`);
})

// to clean up all the data before the tests
beforeEach(async()=>{
    // .query() is used to run a query or write sql syntax
    // using set foreign_key_checks=0 so that the tables can be truncated in any order no need to maintain the foreign relationships during truncations
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    await connection.query('truncate table tasks');
    await connection.query('truncate table users');
    await connection.query('truncate table teams');
    await connection.query('truncate table manager');
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
})

afterAll(async()=>{
    await connection.end();
});

export default connection