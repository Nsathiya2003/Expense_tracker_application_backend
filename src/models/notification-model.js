import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "budget_percentage",
        "budget_exceeded",
        "reminder",
        "goal",
        "goal_completed",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    fullMessage: {
      type: String,
      required: true,
    },

    category: {
      type: String,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

export default mongoose.model("Notification", NotificationSchema);
