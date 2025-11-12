import nodemailer  from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure:true,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

transporter.verify((error, success) => {
    if(error){
        console.log('Error connecting nodemailer',error)
    }
    else{
        console.log('mail connected successfully')
    }
});
export default transporter;