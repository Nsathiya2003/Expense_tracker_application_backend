import mongoose, { Schema } from "mongoose";
import { baseSchema } from "./base-model.js";

export const BudgetSchema = new Schema({
  budget_category: {
    type: String,
    required: [true, "budget_category is required"],
  },
  budget_amount: {
    type: Number,
    required: [true],
  },
  budget_month: {
    type: String,
    required: [false],
  },
  budget_start_date: {
    type: Date,
    required: true,
  },
  budget_end_date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    required: [false],
  },
  need_notification: {
    type: Boolean,
    default: false,
  },
  budget_exceeded: {
    type: Boolean,
    default: false,
  },
  budget_reaches: {
    type: Boolean,
    default: false,
  },
  reach_percentage: {
    type: Number,
    default: 0,
  },
  budget_exceeded_counts: {
    type: Number,
    default: 0,
  },
});
BudgetSchema.add(baseSchema);
export const Budget = mongoose.model("Budget", BudgetSchema);
