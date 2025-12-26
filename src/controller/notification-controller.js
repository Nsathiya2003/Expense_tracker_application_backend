import mongoose from "mongoose";
import notificationModel from "../models/notification-model.js";

export const filterNotifications = async (req, res) => {
  try {
    let { page = 1, limit = 10, fromDate, toDate, read } = req.body;

    const user_id = req.user.id;

    page = Number(page);
    limit = Number(limit);

    /* ---------- 1. Base Query ---------- */
    let query = {
      userId: new mongoose.Types.ObjectId(user_id),
    };

    /* ---------- 2. TAB FILTER ---------- */
    if (read === true) {
      query.read = true;
    }

    if (read === false) {
      query.read = false;
    }

    // tab_type === "All" → no filter needed

    /* ---------- 3. DATE RANGE FILTER ---------- */
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    /* ---------- 4. TOTAL COUNT ---------- */
    const total_count = await notificationModel.countDocuments(query);

    /* ---------- 5. PAGINATION ---------- */
    const totalPages = Math.ceil(total_count / limit);

    const data = await notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    /* ---------- 6. RESPONSE ---------- */
    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data,
      pagination: {
        page,
        limit,
        totalRecords: total_count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("filterNotifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No notification IDs provided",
      });
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const result = await notificationModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: { read: true } }
    );

    return res.status(200).json({
      status: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// controllers/notificationController.js
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body; // expects an array of notification IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No notification IDs provided",
      });
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const result = await notificationModel.deleteMany({
      _id: { $in: objectIds },
      // createdBy: userId,
    });

    return res.status(200).json({
      status: true,
      message: `${result.deletedCount} notification(s) deleted`,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to delete notifications",
      error: error.message,
    });
  }
};
