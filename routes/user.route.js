const express = require("express");
const routes = express();
const UserController = require("../controller/user.controller");
const AuthController = require("../controller/auth.controller");
const fileUpload = require("../middleware/fileUpload");
const {
  getAllUsers,
  getAllPatients,
  getAllDoctors,
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

routes.get("/patients", getAllPatients);

routes.get("/doctors", getAllDoctors);

// Route to get notifications by userId
routes.get("/notifications-by-user", getNotificationsByUserId);

// Route to get notifications by userId
routes.get("/all-notifications", getAllNotifications);

// // get one user data
routes.get("/:id", getOneUserById);

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

module.exports = routes;
