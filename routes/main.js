import express from 'express'
import authentication from './auth.js'
import user from './users.js';
import adminAccess from './admin.js';
import mangerAccess from './manager.js';
import teams from './team.js';
import morgan from 'morgan'

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({ Message: `No Issues Found,Server is running...`, timeStamp: new Date().toLocaleString() })
})

app.use('/auth', authentication);
app.use('/users', user);
app.use('/admin', adminAccess);
app.use('/manager', mangerAccess);
app.use('/teams', teams);

export default app
