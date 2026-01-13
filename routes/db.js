import mysql from 'mysql2'
import dotenv from 'dotenv'


dotenv.config({path:'../.env'});

console.log(process.env.DATABASE_HOST)

const pool = mysql.createPool({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE_NAME
})

export default pool.promise();