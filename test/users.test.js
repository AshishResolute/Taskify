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
        console.log(res.body)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('user');
        let user = res.body.user;
        expect(user.user_id).toBe(7)
    })
})
