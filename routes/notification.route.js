const express = require("express");
const routes = express();
const {
  getNotificationsByUserId,
} = require("../controller/notification.controller");

// Route to get notifications by userId
routes.get("/user/notifications/:userId", getNotificationsByUserId);

module.exports = routes;
