import mongoose, { Schema } from "mongoose";
import { baseSchema } from "./base-model.js";

export const GoalSchema = new Schema({
    goal_name:{
        type: String,
        required: [true]
    },
    target_amount:{
        type: String,
        required: [true]
    },
    allocated_amount: {
        type: Number, 
        default: 0
    },
    deadline_date: {
        type: Date,
        required: [true]
    },
    notes:{
        type: String
    },
    status:{
        type:String,
        default:'PENDING',
        required: [true]
    }

},
)
GoalSchema.add(baseSchema)

export const Goal = mongoose.model('Goal',GoalSchema)