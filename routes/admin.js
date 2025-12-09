import express from 'express';
import verifyToken from './verifyToken.js';
import verifyAdmin from './adminMiddleWear.js';
import db from './db.js';
const router = express.Router();


router.get('/teamCurrentMembers', verifyToken, verifyAdmin, async (req, res) => {
    try {
        let admin_id = req.user.id;
        let [teamCurrentMembers] = await db.query(`select count(user_id) as currentMembers from users as u inner join teams as t on u.team_id = t.team_id where t.team_admin=?`, [admin_id]);
        console.log(teamCurrentMembers)
        if (!teamCurrentMembers) return res.status(400).json({ Message: `Team Not yet Created or Found` });
        res.status(200).json({ teamCurrentMembers });
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: `${err.message}` })
    }
})

router.put('/update/teamCurrentMembers', verifyToken, verifyAdmin, async (req, res) => {
    try {
        let admin_id = req.user.id;
        let [team_id] = await db.query(`select team_id from teams where team_admin=?`, [admin_id]);
        console.log(team_id[0].team_id)
        if (!team_id.length) return res.status(400).json({ Message: `No Team Found or Created` });
        let [count] = await db.query(`select count(*) as CurrentMembers from users where team_id=?`, [team_id[0].team_id]);
        await db.query(`update teams set team_currentMembers = ? where team_admin=?`, [count[0].CurrentMembers, admin_id])
        res.status(200).json({ TeamMembersCount: `${count[0].CurrentMembers} Updated` });
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

router.get('/getTeamMembers/:teamId', verifyToken, verifyAdmin, async (req, res) => {
    try {
        let user_id = req.user.id;
        let team_id = parseInt(req.params.teamId);
        let [members] = await db.query(`select user_name from users where team_id =?`, [team_id]);
        res.status(200).json({ Members: members })
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

       // Made few changes in the database so this route is not valid now 
// router.patch('/assignTask/:user/:user_id/:team_id', verifyToken, verifyAdmin, async (req, res) => {
//     try {
//         let user_name = req.params.user;
//         let teamUser_id = req.params.user_id;
//         let team_id = req.params.team_id;
//         if (!user_name.length || team_id === null || team_id === undefined) return res.status(400).json({ Message: `Please Provide Complete user Details` });
//         let [checkUser] = await db.query(`select user_name from users where user_id=? and team_id=?`, [teamUser_id, team_id]);
//         if (!checkUser.length) return res.status(400).json({ Message: `User not found in this team` });
//         let { taskForUser } = req.body;
//         if (!taskForUser.length) return res.status(400).json({ Message: `Task for user not Provided` });
//       let [result] =   await db.query(`update users set task = ? where user_id=? and user_name=? and team_id=?`, [taskForUser, teamUser_id, user_name, team_id]);
//       if(result.affectedRows === 0) return res.status(400).json({Message:`Failed to assign Task`});
//         res.status(200).json({ Message: `Task ${taskForUser} assigned to ${user_name} with Team_id ${team_id}` });
//     }
//     catch (err) {
//         res.status(500).json({ Message: `DataBase Error`, Details: err.message });
//     }
// })


router.put('/assignTask/:user_id/:team_id',verifyToken,verifyAdmin,async(req,res)=>{
    try{
        let admin_id = req.user.id;
        let {user_id,team_id} = (req.params);
        if(!user_id||!team_id) return res.status(400).json({Message:`Missing Details`});
        let [checkForUser] = await db.query(`select user_id from users where user_id =? and team_id=?`,[user_id,team_id]);
        if(!checkForUser.length) return res.status(400).json({Message:`User with user_id ${user_id} and Team-id ${team_id} Not Found`});
        let {title,description,taskDeadline,assigned_by} = req.body;
        if(!title||!description) return res.status(400).json({Message:`Task Title or Description missing`});
        let [result] = await db.query(`insert into tasks (title,description,assigned_to,assigned_by,team_id,deadline) values (?,?,?,?,?,?)`,[title,description,user_id,assigned_by,team_id,taskDeadline]);
        if(result.affectedRows===0) return res.status(400).json({Message:`Task not Assigned`});
        res.status(200).json({
            Message:`Task ${title} assigned to User with user_id ${user_id}`,
            task_id:result.insertId
        });
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})
export default router;