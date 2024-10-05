const express = require("express");
const routes = express();
const UserController = require("../controller/user.controller");
const AuthController = require("../controller/auth.controller");
const {
  getAllUsers,
  getOneUserById,
  getNotificationsByUserId,
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

// // get one user data
routes.get("/:id", getOneUserById);

// // adds balance to user
// routes.patch("/add-balance/:id",
//   isAuthorizedUser,
//   UserController.addBalance);

// updates user data
routes.patch(
  "/profile/:id",
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

// Route to get notifications by userId
// routes.get("/notifications-by-user", getNotificationsByUserId);
routes.get("/notifications-by-user", (req, res) => {
  res.send({ message: "Notifications fetched successfully" });
});

// for signing up
// routes.post('/signup', AuthController.signup)

// for logging in
// routes.post('/login', AuthController.login)

module.exports = routes;
