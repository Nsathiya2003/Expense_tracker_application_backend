import mongoose from "mongoose";
import { baseSchema } from "./base-model.js";

const UserSchema = new mongoose.Schema({
    username: {
        type:String,
        required:[true,'username is required']
    },
    lastName: {
        type:String,
        required:[false]
    },
    mobileNumber:{
        type:String,
        required:[true, 'mobile number is required']
    },
    emailId:{
        type:String,
        required:[true, 'emailId is required']
    },
    password:{
        type:String,
        required:[true,'password is required']
    },
    otp: {
        type:Number,
        default:5,
        required:[false]
    },
     expiryMinutes: { type: Number, default: 5 }, 
       expiresAt: { type: Date, required: true },

})

    UserSchema.add(baseSchema);

export const User = mongoose.model('User',UserSchema);
export default User;
