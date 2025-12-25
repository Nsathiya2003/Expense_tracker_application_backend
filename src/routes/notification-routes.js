
import express from "express";
import { isAuthenticated } from '../middleware/authorization-middleware.js';
import { deleteNotifications, filterNotifications, markNotificationsRead } from "../controller/notification-controller.js";


const notificationRouter = express.Router();

notificationRouter.post("/findAll",isAuthenticated,filterNotifications);

notificationRouter.put("/mark-read", isAuthenticated, markNotificationsRead);

notificationRouter.delete("/delete", isAuthenticated, deleteNotifications);


export default notificationRouter;
