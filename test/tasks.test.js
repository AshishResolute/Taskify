import app from '../routes/main.js'
import request from 'supertest'
import dotenv from 'dotenv'
dotenv.config()
describe('Get response from main Server',()=>{
    it('Should return the health of the Server',async()=>{
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('Message');
    })
})


describe('Test the Login Route',()=>{
    it('Should return the Token',async()=>{
        const res = await request(app).post('/auth/login')
        .send({
            email:`Dawn@gmail.com`,
            password:"dawn@gmail.com"
        }); 
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    })
})
