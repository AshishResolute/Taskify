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


router.put('/joinTeam/:teamId',verifyToken,async(req,res)=>{
    try{
        let user_id = req.user.id;
        let team_id = parseInt(req.params.teamId);
        let [currentMembers] = await db.query(`select team_currentMembers,team_maxMembers from teams where team_id =?`,[team_id]);
        let membersCount = currentMembers[0].team_currentMembers;
        let maxMembers = currentMembers[0].team_maxMembers;
        if(membersCount<maxMembers)
        {
            await db.query(`update users set team_id=? where user_id=?`,[team_id,user_id]);
            membersCount++;
            await db.query(`update teams set team_currentMembers=? where team_id=?`,[membersCount,team_id]);
             res.status(200).json({Message:`Team Joined Successfully`});
        }
        else {
            res.status(400).json({Message:`Team already Full Can't Join this Team`});
        }
       
    }
    catch(err)
    {
        res.status(500).json({Message:`DataBase Error`,Details:err.message});
    }
})
export default router;