import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const isAuthenticated = async (req,res,next) =>{
    const isAuthToken = req.headers['authorization'];
    console.log('isAuthToken------',isAuthToken)
    try{
    if(!isAuthToken || !isAuthToken.startsWith('Bearer')){
        res.status(401).json({
            status:false,
            message: "Access denied. No token provided.",
        });
    }
    const token = isAuthToken.split(" ")[1];
    console.log('token-------',token)
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    console.log(decoded,"decoded---------")
    req.user = decoded;
    next()
    }
    catch(error){
        res.status(403).json({
            status:false,
            message: "Invalid or expired token.",
        })
    }
    


}