import express from 'express';
import verifyToken from './verifyToken.js';
import verifyAdmin from './adminMiddleWear.js';
import db from './db.js';
import nodemailer from 'nodemailer';
import transporter from './mailer.js';
import emailQueue from './emailQueue.js';
import { AppError } from './errorClass.js';
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';
import fs from 'fs'

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


router.put('/assignTask/:user_id/:team_id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        let admin_id = req.user.id;
        let { user_id, team_id } = (req.params);
        if (!user_id || !team_id) return res.status(400).json({ Message: `Missing Details` });
        let [checkForUser] = await db.query(`select user_id from users where user_id =? and team_id=?`, [user_id, team_id]);
        if (!checkForUser.length) return res.status(400).json({ Message: `User with user_id ${user_id} and Team-id ${team_id} Not Found` });
        let { title, description, taskDeadline } = req.body;
        if (!title || !description) return res.status(400).json({ Message: `Task Title or Description missing` });
        let [result] = await db.query(`insert into tasks (title,description,assigned_to,assigned_by,team_id,deadline) values (?,?,?,?,?,?)`, [title, description, user_id, admin_id, team_id, taskDeadline]);
        if (result.affectedRows === 0) return res.status(400).json({ Message: `Task not Assigned` });
        let [userDetails] = await db.query(`select email,user_name from users where user_id=?`, [user_id]);
        await emailQueue.add({
            to:userDetails[0].email,
            subject:description,
            taskTitle:title,
            deadline:taskDeadline
        })
        // const mailDeatails = {
        //     from: "ashish@taskifyPro.dev",
        //     to: userDetails[0].email,
        //     subject: `New Task Assigned ${title}`,
        //     html: `
        //        <h3> Hi,${userDetails[0].user_name},</h3>
        //        <p> You've been assigned a new Task <strong>${title}</strong></p>
        //        <p> Task Decription: <strong>${description}</strong></p>
        //        <p> Deadline: ${taskDeadline}</p>
        //        <p> --> TaskifyPro <-- </p>
        //     `
        // }
        // transporter.sendMail(mailDeatails, (err, info) => {
        //     if (err) console.log(`Error:${err.message}`)
        //     else {
        //         console.log(`Mail Sent: ${info.response}`)
        //     }
        // })
        res.status(200).json({
            Message: `Task ${title} assigned to User with user_id ${user_id}`,
             task_id: result.insertId
        });
    }
    catch (err) {
        res.status(500).json({ Message: `DataBase Error`, Details: err.message });
    }
})

router.get('/get-UserStats/:teamMemberId/:teamId',verifyToken,verifyAdmin,async(req,res,next)=>{
    try{
          let admin_id = req.user.id;
          let {teamMemberId,teamId} = req.params; 
          let [userData] = await db.query(`select * from tasks where assigned_to=? and team_id=?`,[teamMemberId,teamId]);
          if(!userData.length) return res.status(404).json({Message:`No Tasks Found For user`});
          const pdf_doc = await PDFDocument.create()
          const addPage = pdf_doc.addPage([2480, 3508]);
          const font = await pdf_doc.embedFont(StandardFonts.Helvetica);
          let y = 3400;
          userData.forEach((data)=>{
            addPage.drawText(`Title: ${data.title}`,{x:50,y:y-60,size:24,font,color: rgb(0.95, 0.1, 0.1)})
            addPage.drawText(`Description: ${data.description}`,{x:50,y:y-90,size:24,font})
            addPage.drawText(`Status: ${data.status}`,{x:50,y:y-120,size:24,font})
            addPage.drawText(`Deadline:${data.deadline}`,{x:50,y:y-150,size:24,font})
            y-=120;
          })

          const pdfBites = await pdf_doc.save();
          fs.writeFileSync('userstats.pdf',pdfBites)
          let totalTasksAssigned = userData.length;
          let pendingTaskscount=0
          userData.forEach(data=>{if(data.status==='Pending')pendingTaskscount++})
          res.status(200).json({Message:`User Tasks status stats`,
            taskCompleted:totalTasksAssigned-pendingTaskscount,
            pendingTasks:`User still has ${pendingTaskscount} Tasks Left`,
          })
    }
    catch(err)
    {
        next(err)
    }
})
export default router;