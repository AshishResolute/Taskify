import express from 'express'
import verifyToken from './verifyToken.js';
import db from './db.js';

const router = express();
router.get('/userDetails',verifyToken,async(req,res)=>{
    try{
        let user_id = req.user.id;
        let [userDetails] = await db.query(`select user_id,user_name,team_id,user_role from users where user_id=?`,[user_id]) 
        if(!userDetails.length) return res.status(400).json({Messag:`No user Found`})
            res.status(200).json({user:userDetails[0]});
    }
    catch(err)
    {
        res.status(500).json({Message:`DataBase Error`,Details:err.message});
    }
})

export default router;