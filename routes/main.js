import express from 'express'
import authentication from './auth.js'
const app = express();
const PORT = 3000;
 
app.use(express.json());

app.use('/auth',authentication);








app.listen(PORT,()=>{
    console.log(`Server running at port ${PORT}`);
})
