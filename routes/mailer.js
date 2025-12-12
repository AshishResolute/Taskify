import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';


dotenv.config();


let transport = nodemailer.createTransport({
    host:process.env.MAILER_HOST,
    port:Number(process.env.MAILER_PORT),
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASSWORD
    }
})


export default transport;