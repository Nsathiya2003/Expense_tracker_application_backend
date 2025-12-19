import mongoose, { Schema } from "mongoose";
import { baseSchema } from "./base-model.js";

export const GoalHistorySchema = new Schema({
    goal_id:{
        type:mongoose.Schema.ObjectId,
        ref:'Goal',
        default:null
    },
    allocated_amount:{
        type:Number,
        required:[false]
    },
    income_type:{
        type:String,
        required:[false]
    }
},
)
    GoalHistorySchema.add(baseSchema)
    export const GoalHistory = mongoose.model('Goal-history',GoalHistorySchema)