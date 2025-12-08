import express from 'express'
import authentication from './auth.js'
import user from './users.js';
import adminAccess from './admin.js';
import mangerAccess from './manager.js';
import teams from './team.js';
const app = express();
const PORT = 3000;
 
app.use(express.json());

app.use('/auth',authentication);
app.use('/users',user);
app.use('/admin',adminAccess);
app.use('/manager',mangerAccess);
app.use('/teams',teams);




app.listen(PORT,()=>{
    console.log(`Server running at port ${PORT}`);
})
