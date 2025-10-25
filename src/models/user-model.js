import mongoose from "mongoose";
import { baseSchema } from "./base-model.js";

const UserSchema = new mongoose.Schema({
    username: {
        type:String,
        required:[true,'username is required']
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
    }
})

    UserSchema.add(baseSchema);

export const User = mongoose.model('User',UserSchema);
export default User;
