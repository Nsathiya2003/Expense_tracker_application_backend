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
    deadline_date: {
        type: Date,
        required: [true]
    },
    notes:{
        type: String
    },

},
)
GoalSchema.add(baseSchema)

export const Goal = mongoose.model('Goal',GoalSchema)