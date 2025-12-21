import mongoose, { Schema } from "mongoose";
import { baseSchema } from "./base-model.js";

const IncomeSchema = new Schema({
    income_category:{
        type:String,
        required:[true,'income is required']
    },
    income_date:{
        type:Date,
        required:[true,'date is required']
    },
    income_amount:{
        type:Number,
        required:[true,'income amount is required']
    },
    notes:{
        type:String,
        required:[false]
    },
    payment_receive_mode:{
        type:String,
        required:[false]
    },
    saving_contribution:{
        type:Boolean,
        required:[false]
    },
    goal_id:{
        type: mongoose.Schema.ObjectId,
        ref:'Goal',
        required:[false]
    },
    goal_contribute_amount:{
        type:Number,
        required:[false]
    },
    status:{
        type:String,
        default:'active'
    },
    current_income_amount:{
        type:Number,
        required:[true,'current income is required..']
    }
})

    IncomeSchema.add(baseSchema);
 const Income = mongoose.model('Income',IncomeSchema)
 export default Income;
