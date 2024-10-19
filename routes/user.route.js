const express = require("express");
const routes = express();
const UserController = require("../controller/user.controller");
const AuthController = require("../controller/auth.controller");
const fileUpload = require("../middleware/fileUpload");
const {
  getAllUsers,
  getOneUserById,
  getNotificationsByUserId,
  getAllNotifications,
  updateUserById,
} = require("../controller/user.controller");

const {
  isAuthorized,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");
const { userValidator } = require("../middleware/validation");

// gets all user data
// routes.get("/", isAuthorized, UserController.getAll);
routes.get("/", getAllUsers);

// Route to get notifications by userId
routes.get("/notifications-by-user", getNotificationsByUserId);

// Route to get notifications by userId
routes.get("/all-notifications", getAllNotifications);

// // get one user data
routes.get("/:id", getOneUserById);

// // adds balance to user
// routes.patch("/add-balance/:id",
//   isAuthorizedUser,
//   UserController.addBalance);

// updates user data
routes.patch(
  "/profile/:id",
  fileUpload(),
  // isAuthorizedUser,
  // userValidator.update,
  updateUserById
);

// // updates user data
// routes.patch(
//   "/auth/update-user-by-admin/:id",
//   isAuthorized,
//   userValidator.update,
//   UserController.updateUserByAdmin
// );

// for signing up
// routes.post('/signup', AuthController.signup)

// for logging in
// routes.post('/login', AuthController.login)

module.exports = routes;
