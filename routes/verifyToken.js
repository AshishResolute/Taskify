import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
let verifyToken = (req, res, next) => {
   let auth = req.get('Authorization');
   if (!auth) return res.status(401).json({ Message: `Token not recieved` });
   let token = auth.split(' ')[1];
   jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) return res.status(401).json({ Error: err.message });
      req.user = decode;
         next();
   })

}

export default verifyToken; 