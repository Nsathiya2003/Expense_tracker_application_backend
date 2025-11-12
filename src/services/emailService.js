import dotenv  from 'dotenv';
import transporter from '../config/mailer.js';

dotenv.config();

export const sendOtpEmail = async (otp,to) => {
    console.log('otp is----',otp);
        console.log('otp is----',to);
    console.log('otp is----',process.env.EMAIL_USER);

    try{
        const mailOptions = {
            from: `Expense tracker ${process.env.EMAIL_USER}`,
            to,
            subject:'Forgot password Otp code',
            html:` <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:10px;">
            <h2 style="color:#333;">Email Verification</h2>
            <p>Use the following OTP to verify your email address:</p>
            <h1 style="letter-spacing: 5px; color:#007bff;">${otp}</h1>
            <p>This code will expire in <b>5 minutes</b>.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
            </div>`
        }
        await transporter.sendMail(mailOptions);
        console.log(`otp was successfully send to ${otp}`)
    }
    catch(error){
        console.log('Failed to send OTP email',error)
        return res.status(500).json({
            status:false,
            message:`Failed to send otp..${error.message}`,
            data:null
        })
    }
}