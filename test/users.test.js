import request from 'supertest'
import app from '../routes/main.js';
// import { token } from 'morgan';


describe(`Get user Details`, () => {
    let token;
    it(`Should Get the Token`, async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: `Dawn@gmail.com`,
                password: "dawn@gmail.com"
            });
         token = res.body.token;
    });
    it(`Should get the user Details`, async () => {
        const res = await request(app)
        .get('/users/userDetails')
        .set('Authorization',`Bearer ${token}`);
        // console.log(token)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('user');
        let user = res.body.user;
        expect(user.user_id).toBe(7)
    }) 
})


describe('Get /getTasks',()=>{
    let token;
    it('Should get the Token',async()=>{
        const res = await request(app) .post('/auth/login')
            .send({
                email: `Barry@gmail.com`,
                password: "barry@gmail.com"
            });
         token = res.body.token;
        //  console.log(token)
    })
    it('Should Get all the Tasks of an User',async()=>{
        const res =  await request(app)
        .get('/users/getTasks')
        .set('Authorization',`Bearer ${token}`)
        // console.log(res.body)
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('Tasks')
    })
})


describe('Get /userTaskStatusSummary',()=>{
    let token;
    beforeAll(async()=>{
       const res = await request(app)
       .post('/auth/login')
       .send({
        email:`Barry@gmail.com`,
        password:`barry@gmail.com`
       })
      token = res.body.token;
      if(!token) console.error(`Token not recieved`)
    })
    it('Should get the Task Status of all Tasks assigned to an User',async()=>{
        const res = await request(app)
        .get('/users/userTaskStatusSummary')
        .set('Authorization',`Bearer ${token}`)
        console.log(res.body)
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('statusSummary')
    })
})