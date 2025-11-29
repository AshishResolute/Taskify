import express from 'express';
import verifyToken from './verifyToken.js';
import verifyManager from './managerMiddleWear.js';
import db from './db.js';
const router = express.Router();



router.put('/update/userRole',verifyToken,verifyManager,async(req,res)=>{
    try{
        let {user_id,user_name} = req.body;
        if(!user_id||!user_name) return res.status(400).json({Message:`User Details Like Id and Name required`});
        await db.query(`update users set user_role=?,team_id = (select team_id from teams where team_admin=?) where user_id=? and user_name=?`,["admin",user_id,user_id,user_name]);
        res.status(200).json({Message:`User Role Updated to "Admin"`});
    }
    catch(err)
    {
        res.status(500).json({Message:`DataBase Error`,Details:err.message});
    }
})

router.post('/createTeam',verifyToken,verifyManager,async(req,res)=>{
    try{
          let {user_name,user_id} =req.body;
           if(!user_id||!user_name) return res.status(400).json({Message:`User Details Like Id and Name required`});
          await db.query(`insert into teams (team_task,team_admin) values (?,?)`,["Designing",user_id]);
          res.status(200).json({Message:`Team created with ${user_name} as Admin`})
    }
    catch(err)
    {
        res.status(500).json({Message:`DataBase Error`,Details:err.message});
    }
})


export default router;