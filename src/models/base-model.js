import mongoose from "mongoose";

const options = {
    timestamps:true
}

export const baseSchema = new mongoose.Schema({
    createdBy:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        default:null
    },
    updatedBy:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        default:null
    },
    isDeleted:{
        type:Boolean,
        default:false
    }   
},
    options
)