import express from 'express'
import db from './db.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({path:'../.env'});
import { AppError } from './errorClass.js';
const router = express();
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email.length || !password.length) return res.status(400).json({ Message: `Email and Password required` });
        const userData = await db.query('select * from users where email=?', [email]);
        const user = userData[0];
        let match = await bcrypt.compare(password, user[0].password);
        if (!match) return res.status(400).json({ Message: 'Passwords Dont Match' });
        let token = jwt.sign({ id: user[0].user_id, name: user[0].name, role: user[0].user_role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        let refreshToken = jwt.sign({id:userData[0].user_id,name:userData[0].name,role:userData[0].user_role},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"});
        res.cookie('refreshToken',refreshToken,{httpOnly:true,secure:true});
        res.status(200).json({ Message: `Welcome Back ${user[0].user_name}`, token })
    }
    catch (err) {
        console.log(`Login error`,err)
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

router.post('/sign-up', async (req, res,next) => {
    try {
        let { name, email, password, confirmPassword} = req.body;
        if(!name||name.trim()==='') return next(new AppError(`Username is required`,400))
        if (password !== confirmPassword) return res.status(401).json({ Message: `Passwords Dont Match` });
        else if (email === '') return res.status(401).json({ Message: `Email required cant be empty` });
        let hashedPassword = await bcrypt.hash(password, 10);
        await db.query('insert into users (user_name,email,password) values(?,?,?)', [name, email, hashedPassword])
        res.status(200).json({ Message: `Sign-up Successfull` })
    }
    catch (err) {
        next(err)
    }
})

router.post('/refreshToken',async(req,res)=>{
    try{
        let token = req.cookies.refreshToken;
        if(!token) return res.sendStatus(401);
        let payload = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = jwt.sign({id:payload.id,name:payload.name,role:payload.role},process.env.JWT_SECRET,{expiresIn:'15m'});
        res.json({token:newAccessToken})
     }
     catch(err)
     {
        res.sendStatus(403);
     }
})


router.post('/logout',(req,res)=>{
        let token = req.cookies.refreshToken;
        res.clearCookie('refreshToken');
        res.sendStatus(204)
})


export default router;