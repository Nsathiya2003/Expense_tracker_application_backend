import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateAccessToken = async (user) => {
    if(!user._id) {
        return res.status(404).json({
            status:false,
            message:'id is required for generate access token',
        })
    }
    const payload = {
        id: user._id,
        emailId: user.emailId
    }
    return jwt.sign(payload,process.env.JWT_SECRET_KEY,process.env.EXPIRES_IN)

}