import express from 'express';
import verifyToken from './verifyToken.js';
import verifyAdmin from './adminMiddleWear.js';
import db from './db.js';
const router = express();


router.get('/teamCurrentMembers', verifyToken, verifyAdmin, async (req, res) => {
    try {
        let admin_id = req.user.id;
        // console.log(admin_id)
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
        let [team_id] =await db.query(`select team_id from teams where team_admin=?`, [admin_id]);
        console.log(team_id[0].team_id)
        if (!team_id.length) return res.status(400).json({ Message: `No Team Found or Created` });
        let [count]= await db.query(`select count(*) as CurrentMembers from users where team_id=?`, [team_id[0].team_id]);
        //  console.log(count[0].CurrentMembers)
         await db.query(`update teams set team_currentMembers = ? where team_admin=?`,[count[0].CurrentMembers,admin_id])
        res.status(200).json({ TeamMembersCount:`${count[0].CurrentMembers} Updated`});
    }
    catch(err)
    {
        res.status(500).json({Message:`DataBase Error`,Details:err.message});
    }
})

export default router;