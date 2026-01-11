import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import verifyToken from "../routes/verifyToken";
import jwt from 'jsonwebtoken'

describe(`Unit Test verifyToken middlwear`,()=>{
    let req,res,next;
    beforeEach(()=>{
        req = {get:jest.fn()};
        res={status:jest.fn().mockReturnThis(),json:jest.fn()};
        next = jest.fn()
    });
    it(`Should call next() if Token is valid`,()=>{
        const mockUSer = {id:1,email:`Dawn@gmail.com`}
        req.get.mockReturnValue('Bearer validToken')
        jest.spyOn(jwt,'verify').mockImplementation((token,secret,cb)=>{
            cb(null,mockUSer)
        });
        verifyToken(req,res,next);
        expect(req.user).toEqual(mockUSer);
        expect(next).toHaveBeenCalled();
    });
    it(`Should return 401 if Authorization header is missing`,()=>{
        req.get.mockReturnValue(null);
        verifyToken(req,res,next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({Message:`Token not recieved`});
        expect(next).not.toHaveBeenCalled()
    });
})