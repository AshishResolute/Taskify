import express from 'express'
import verifyToken from './verifyToken.js';
import db from './db.js';

const router = express();
router.get('/userDetails', verifyToken, async (req, res) => {
    try {
        let user_id = req.user.id;
        let [userDetails] = await db.query(`select user_id,user_name,team_id,user_role from users where user_id=?`, [user_id])
        if (!userDetails.length) return res.status(400).json({ Messag: `No user Found` })
        res.status(200).json({ user: userDetails[0] });
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})


router.put('/joinTeam/:teamId', verifyToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        let user_id = req.user.id;
        let team_id = parseInt(req.params.teamId);
        let [checkUser] = await db.query(`select team_id from users where user_id=?`, [user_id]);
        if (checkUser[0].team_id === team_id) return res.status(403).json({ Message: `User already Present in the team` });
        let [currentMembers] = await db.query(`select team_currentMembers,team_maxMembers from teams where team_id =?`, [team_id]);
        let membersCount = currentMembers[0].team_currentMembers;
        let maxMembers = currentMembers[0].team_maxMembers;
        if (membersCount < maxMembers) {
            await connection.beginTransaction();
            await connection.query(`update users set team_id=? where user_id=?`, [team_id,user_id]);
            membersCount++;
            await connection.query(`update teams set team_currentMembers=? where team_id=?`, [membersCount, team_id]);
            await connection.commit();
          return  res.status(200).json({ Message: `Team Joined Successfully` });
        }

        res.status(400).json({ Message: `Team already Full Can't Join this Team` });

    }
    catch (err) {
        await connection.rollback();
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
    finally {
        connection.release();
    }
})

router.put('/leaveTeam/:team_id', verifyToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        let team_id = parseInt(req.params.team_id);
        let user_id = req.user.id;
        let [roleCheck] = await db.query(`select user_role from users where user_id =?`, [user_id]);
        if (roleCheck[0].user_role.toLowerCase() === 'admin') {
            return res.status(403).json({ Message: `Admins cannot leave their own team. Transfer admin rights first.` });
        }
        await connection.beginTransaction();
        let [currentMemberCount] = await db.query(`select team_currentMembers from teams where team_id = ?`, [team_id]);
        let membersCount = currentMemberCount[0].team_currentMembers;
        let [findUser] = await connection.query(`select team_id from users where user_id=?`, [user_id]);
        let foundUser = findUser[0].team_id;
        if (foundUser > 0) {
            await connection.query(`update users set team_id=? where user_id=? and user_role=?`, [null, user_id, "user"])
            membersCount--;
            await connection.query(`update teams set team_currentMembers =? where team_id=? `, [membersCount, team_id])
            await connection.commit();
            return res.status(200).json({ Message: `Team Left Successfully` });
        }
             res.status(400).json({ Message: `User not Present in the Team or Wrong team chosen ` });
    }
    catch (err) {
        await connection.rollback();
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
    finally{
        connection.release();
    }
})


router.get('/getTasks',verifyToken,async(req,res)=>{
    try{
           let user_id = req.user.id;
           let [result] = await db.query(`select title from tasks where assigned_to=?`,[user_id]);
           if(!result.length) return res.status(400).json({Message:`No Tasks Found for user with id ${user_id}`});
           res.status(200).json({Tasks:result});
    } 
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

router.patch('/updateTaskStatus/:task_id',verifyToken,async(req,res)=>{
    try{
        let user_id = req.user.id;
        let {task_id} = req.params;
        if(!task_id||task_id.trim()==='') return res.status(400).json({Message:`Missing Task_id of an Task`});
        let {status} = req.body;
        let [result] = await db.query(`update tasks set status = ? where assigned_to=? and task_id=?`,[status,user_id,task_id]);
        if(result.affectedRows===0) return res.status(400).json({Message:`Task Status not Updated`});
        res.status(200).json({Message:`Task Status updated for Task_id ${task_id} of user with user_id ${user_id}`});
    }
    catch(err)
    {
        res.status(500).json({Message:`DataBase Error`,
            Details:err.message
        })
    }
})

router.get('/userTaskStatusSummary',verifyToken,async(req,res)=>{
          try{
               let user_id = req.user.id;
               let [summary] = await db.query(`select status from tasks where assigned_to = ?`,[user_id]);
               if(!summary.length) return res.status(400).json({Message:`No Tasks Found for user`});
               let map = new Map();
               summary.forEach((data)=>{
                map.set(data.status,(map.get(data.status)||0)+1)
               })
               let result = Object.fromEntries(map);
               res.status(200).json({statusSummary:result})
          }
          catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})
export default router;