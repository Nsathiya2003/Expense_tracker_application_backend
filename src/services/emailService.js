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

export const sendWelcomeEmail = async (to, username) => {
  try {
    const mailOptions = {
      from: `Expense Tracker <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Welcome to Expense Tracker 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0; padding:0; background-color:#f2f4f6; font-family:Arial, Helvetica, sans-serif;">

  <!-- Outer Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f4f6; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#2563eb; padding:30px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">
                Welcome to Expense Tracker
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <p style="margin:0 0 16px; font-size:16px;">
                Hi <strong>${username}</strong>,
              </p>

              <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">
                Thanks for joining <strong>Expense Tracker</strong> 🎯  
                You’re all set to manage your <strong>income, expenses, goals, and budgets</strong> — all in one place.
              </p>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.6;">
                Start tracking your finances and take control of your money today.
              </p>

              <p style="margin:30px 0 0; font-size:14px; color:#666666; text-align:center;">
                If you didn’t create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:20px; text-align:center;">
              <p style="margin:0; font-size:13px; color:#999999;">
                © ${new Date().getFullYear()} Expense Tracker. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send welcome email', error);
  }
};

