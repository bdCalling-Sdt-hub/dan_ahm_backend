const express = require("express");
const routes = express();
const { accessChat, fetchChats } = require("../controller/chat.controller");

routes.post("/access-chat/:id", accessChat);
// routes.route("/get-users-all-chat").get(protect, fetchChats);
routes.get("/get-users-all-chat/:id", fetchChats);

module.exports = routes;
