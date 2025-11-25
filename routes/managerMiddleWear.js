import express from 'express'

const checkManager = (req,res,next)=>{
    let role = req.user.role;
    if(role.toLowerCase()!=='manager') return res.status(400).json({Message:`Access Denied`})
        next();
}

export default checkManager;