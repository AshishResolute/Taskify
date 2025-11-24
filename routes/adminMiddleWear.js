const checkAdmin = (req,res,next)=>{
    const isAdmin = req.user.role;
    if(isAdmin.toLowerCase()!=='admin') return res.status(400).json({Message:`Access Denied Admins Only`});
    next();
}

export default checkAdmin;