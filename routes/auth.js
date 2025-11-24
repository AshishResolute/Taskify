import express from 'express'
import db from './db.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const router = express();
dotenv.config();
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email.length || !password.length) return res.status(400).json({ Message: `Email and Password required` });
        const userData = await db.query('select * from users where email=?', [email]);
        const user =userData[0];
         let match = await bcrypt.compare(password,user[0].password);
         if(!match) return res.status(400).json({Message:'Passwords Dont Match'});
        let token = jwt.sign({id:user[0].user_id,name:user[0].name,role:user[0].user_role},process.env.JWT_SECRET,{expiresIn:'1h'});
            res.status(200).json({Message:`Welcome Back ${user[0].user_name}`,token})
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

router.post('/sign-up', async (req, res) => {
    try {
        let { name, email, password, confirmPassword, team_id } = req.body;
        if (password !== confirmPassword) return res.status(401).json({ Message: `Passwords Dont Match` });
        else if (email === '') return res.status(401).json({ Message: `Email required cant be empty` });
        let hashedPassword = await bcrypt.hash(password, 10);
        await db.query('insert into users (user_name,email,password,team_id) values(?,?,?,?)', [name, email, hashedPassword, team_id])
        res.status(200).json({ Message: `Sign-up Successfull` })
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

export default router;