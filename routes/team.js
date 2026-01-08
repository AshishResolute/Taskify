import express from 'express'
import verifyToken from './verifyToken.js'
import verifyAdmin from './adminMiddleWear.js'
import db from './db.js';
const router = express.Router();

router.get('/teamTaskStatusSummary/:team_id',verifyToken,verifyAdmin,async(req,res)=>{
    try{
          let {team_id} = req.params;
          if(!team_id||team_id.trim()==='') return res.status(400).json({Message:`Team-id required`});
          let [findTeam] =await db.query(`select team_id from teams where team_id=?`,[team_id]);
          if(!findTeam.length) return res.status(400).json({Message:`Team with team_id ${team_id} not Found`});
          let [teamTaskStatus] = await db.query(`select * from tasks as t1 join teams as t2 on t1.team_id = t2.team_id`);
          let teamTaskMap = new Map()
          teamTaskStatus.forEach((data)=>{
            teamTaskMap.set(data.status,(teamTaskMap.get(data.status)||0)+1)
          })
          let resultStatus = Object.fromEntries(teamTaskMap)
          res.status(200).json({Message:`TeamTask_statusSummary`,TaskStatus:resultStatus})
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})


router.get('/teamMemberWithTasks/:team_id',verifyToken,verifyAdmin,async(req,res)=>{
  try{
       let team_id = req.params.team_id;
       if(!team_id||team_id.trim()==='') return res.status(400).json({Message:`Team_id required!`});
       let [findTeam] = await db.query(`select team_id from users where team_id=?`,[team_id]);
       if(!findTeam.length) return res.status(400).json({Message:`NO Team Found with ${team_id} Team_id`});
       let [userData] = await db.query(`select u.user_id as user_id ,u.user_name as userName,t.task_id as task_id,t.title as title,t.status as status from users as u join tasks as t on u.user_id = t.assigned_to where t.team_id=?`,[team_id]);
       if(!userData.length) return res.status(400).json({Message:`Users Tasks not Assigned`});
       let userTasksMap = new Map();
       userData.forEach((data)=>{
         if(!userTasksMap.has(data.user_id))
         {
             userTasksMap.set(data.user_id,{user_id:data.user_id,userName:data.userName,tasks:[]});
         }
         if(data.task_id)
         {
          userTasksMap.get(data.user_id).tasks.push({Title:data.title,Status:data.status,Title:data.title});
         }
       })
       let result = Array.from(userTasksMap.values())
       res.status(200).json({result})
  }
  catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

export default router;
