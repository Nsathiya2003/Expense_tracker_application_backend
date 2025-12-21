import mongoose from "mongoose";
import { baseSchema } from "./base-model.js";

export const BalanceSchema = new mongoose.Schema({
    totalIncome:{
        type:Number
    },
    totalExpense:{
        type:Number
    },
    balanceAmount:{
        type:Number
    }
})

BalanceSchema.add(baseSchema);

export const BalanceModel = mongoose.model('Balance',BalanceSchema);