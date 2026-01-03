import bcrypt from "bcrypt";
import { generateAccessToken } from "../helpers/authentication.js";
import User from "../models/user-model.js";
import mongoose from "mongoose";
import generateOtp from "../utils/generateOtp.js";
import { sendOtpEmail, sendWelcomeEmail } from "../services/emailService.js";
import dotenv from "dotenv";

dotenv.config();

export const createUser = async (req, res) => {
  const { username, lastName, mobileNumber, emailId, password } = req.body;

  try {
    const existing = await User.findOne({ emailId: emailId });
    if (existing) {
      return res.status(400).json({
        status: true,
        message: "EmailId already exists",
        data: [],
      });
    }
    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword----", hashedPassword);

    const data = await User.create({
      username: username,
      lastName: lastName,
      mobileNumber: mobileNumber,
      emailId: emailId,
      password: hashedPassword,
    });

      // Send welcome email
    await sendWelcomeEmail(emailId, username);
    
    return res.status(200).json({
      status: true,
      message: "Account registered successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Error creating user ${err.message}`,
      data: [],
    });
  }
};

export const findUser = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findById(id);
    console.log({ data });

    if (!data) {
      return res.status(404).json({
        status: true,
        message: "user not found",
        data: [],
      });
    }
    return res.status(201).json({
      status: true,
      message: "user fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Error come find user${err.message}`,
      data: [],
    });
  }
};

// export const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const user_profile = req.file;
//   const { username, mobileNumber, emailId, age, gender, address, lastName } =
//     req.body;
//   const objectId = new mongoose.Types.ObjectId(String(id));

//   console.log('req.file-------',req.file)
//   console.log('user_profile-----',user_profile);


//     const publicPath = `/uploads/users/${user_profile}`;

//     console.log('publicPath-------',publicPath)

//   try {
//     const existing = await User.findById(id);
//     if (!existing) {
//       return res.status(404).json({
//         status: true,
//         message: "user not found",
//         data: [],
//       });
//     }
//     const duplicateEmail = await User.findOne({
//       emailId,
//       _id: { $ne: objectId },
//     });
//     if (duplicateEmail) {
//       return res.status(404).json({
//         status: true,
//         message: "EmailId already exists",
//         data: [],
//       });
//     }
//     (existing.username = username),
//       (existing.lastName = lastName),
//       (existing.mobileNumber = mobileNumber),
//       (existing.emailId = emailId),
//       (existing.updatedBy = objectId),
//       (existing.address = address),
//       (existing.age = age),
//       (existing.gender = gender);
//     // Update profile image if uploaded
//     if (req.file) {
//       existing.file_name = req.file.originalname; // original file name
//       existing.file_path = req.file.path; // Cloudinary URL
//     }
//     await existing.save();

//     return res.status(201).json({
//       status: true,
//       message: "user updated successfully",
//       data: existing,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: `Error occur update user${err.message}`,
//       data: [],
//     });
//   }
// };

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, lastName, mobileNumber, emailId, age, gender, address } = req.body;

    console.log("req.file =>", req.file); // DEBUG

    const existing = await User.findById(id);
    if (!existing) return res.status(404).json({ status: false, message: "User not found" });

    const duplicateEmail = await User.findOne({ emailId, _id: { $ne: id } });
    if (duplicateEmail) return res.status(409).json({ status: false, message: "Email already exists" });

    // Update fields
    existing.username = username;
    existing.lastName = lastName;
    existing.mobileNumber = mobileNumber;
    existing.emailId = emailId;
    existing.address = address;
    existing.age = age;
    existing.gender = gender;

    // ✅ Cloudinary file
    if (req.file) {
      console.log("Uploaded file:", req.file); // DEBUG
      existing.file_name = req.file.originalname;
      existing.file_path = req.file.path; // Cloudinary URL
    }



    await existing.save();

    return res.status(200).json({ status: true, message: "User updated successfully", data: existing });

  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};



export const userLogin = async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const findUser = await User.findOne({ emailId });
    if (!findUser) {
      return res.status(400).json({
        status: true,
        message: "EmailId is invalid please enter registered emailId",
        data: [],
      });
    }

    //password hash...
    const hashedPassword = await bcrypt.compare(password, findUser.password);

    if (!hashedPassword) {
      return res.status(400).json({
        status: true,
        message: "Password is mismatched",
        data: [],
      });
    }
    //generate access-token
    const token = await generateAccessToken(findUser);

    return res.status(201).json({
      status: true,
      message: "user logged in successfully",
      data: {
        data: findUser,
        access_token: token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Error occur login${err.message}`,
      data: [],
    });
  }
};

export const forgotOtp = async (req, res) => {
  const { emailId } = req.body;
  const OTP_EXPIRY_MINUTES = parseInt(
    process.env.OTP_EXPIRY_MINUTES || "5",
    10
  );

  try {
    let userEmailId = await User.findOne({ emailId: emailId });
    if (!userEmailId) {
      return res.status(404).json({
        status: true,
        message: "emailId is not found,Please Enter registered emailId",
        data: [],
      });
    }

    //generate otp...
    const otp = generateOtp();
    console.log("otp is---", otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    //send otp to email
    await sendOtpEmail(otp, emailId);

    //store the otp,minutes and date...
    const findData = await User.findOne({ emailId: emailId });
    (findData.otp = otp),
      (findData.expiresAt = expiresAt),
      (findData.expiryMinutes = OTP_EXPIRY_MINUTES);

    await findData.save();

    return res.status(201).json({
      status: true,
      message: "otp was successfully send",
      data: findData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error sending otp...${error.message}`,
      data: null,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { emailId, otp, password } = req.body;
  console.log("req.body----", req.body);
  try {
    const findEmail = await User.findOne({ emailId: emailId });
    //check otp is valid...
    if (Date.now() > findEmail.expiresAt) {
      return res.status(501).json({ message: "OTP expired" });
    }

    console.log("email---", findEmail.otp === +otp);

    if (findEmail.otp !== +otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    //password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword----", hashedPassword);

    findEmail.password = hashedPassword;

    await findEmail.save();

    return res.status(201).json({
      status: true,
      message: "password reset successfully",
      data: findEmail,
    });
  } catch (error) {
    return res.status(500).json({ message: "OTP expired" });
  }
};
