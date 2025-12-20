import mongoose, { Schema } from "mongoose";
import { baseSchema } from "./base-model.js";

const ExpenseSchema = new Schema({

    expense_category:{
        type: String,
        required:[true,'expense category is required']
    },
    expense_amount:{
        type:Number,
        required: [true,'expense_amount is required']
    },
    expense_date:{
        type:Date,
        required:[true,'expense date is required'],
    },
    budget_category:{
        type:String,
        required:[false]
    },
    is_recurring:{
        type:Boolean,
        required:[false]
    },
    notes: {
        type:String,
        required:[false]
    },
    payment_mode:{
        type:String,
        required:[true,'payment mode is required']
    },
    tags:{
        type:[String],
        
    }
})

    ExpenseSchema.add(baseSchema)
export const Expense = mongoose.model('Expense',ExpenseSchema)

