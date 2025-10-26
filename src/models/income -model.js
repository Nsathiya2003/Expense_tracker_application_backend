import mongoose, { Schema } from "mongoose";
import { baseSchema } from "./base-model.js";

const IncomeSchema = new Schema({
    category:{
        type:String,
        required:[true,'income is required']
    },
    other_category:{
        type:String,
        required:[false]
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
    }
})

    IncomeSchema.add(baseSchema);
 const Income = mongoose.model('Income',IncomeSchema)
 export default Income;
