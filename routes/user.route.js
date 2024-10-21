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
  profile,
  updateProfileByUser,
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
routes.get("/get-one-user/:id", getOneUserById);

// updates user data
routes.patch(
  "/get-one-user/:id",
  fileUpload(),
  // isAuthorizedUser,
  // userValidator.update,
  updateUserById
);

routes.get("/profile", isAuthorizedUser, profile);

routes.patch(
  "/update-profile-by-user",
  isAuthorizedUser,
  fileUpload(),
  updateProfileByUser
);

// // updates user data
// routes.patch(
//   "/auth/update-user-by-admin/:id",
//   isAuthorized,
//   userValidator.update,
//   UserController.updateUserByAdmin
// );

module.exports = routes;
