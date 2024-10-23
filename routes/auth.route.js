const express = require("express");
const routes = express();
const {
  signup,
  verifyEmail,
  login,
  logout,
  signupAsDoctor,
  approveDoctor,
  cancelDoctor,
  loginAsDoctor,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controller/auth.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const {
  isAuthorizedUser,
  isAuthorizedAdmin,
} = require("../middleware/authValidationJWT");
// const { authValidator } = require("../middleware/authValidation");

// for signing up
routes.post(
  "/auth/signup",
  // userValidator.create,
  // authValidator.create,
  signup
  //   (req, res) => res.send("hello")
);

// for signing up as doctor
routes.post(
  "/auth/signup-as-doctor",
  // userValidator.create,
  // authValidator.create,
  signupAsDoctor
);

routes.post(
  "/auth/verify-email",
  // userValidator.create,
  // authValidator.create,
  verifyEmail
);

routes.post(
  "/auth/forgot-password",
  // userValidator.create,
  // authValidator.create,
  forgotPassword
);

routes.post(
  "/auth/reset-password",
  // userValidator.create,
  // authValidator.create,
  resetPassword
);

routes.post(
  "/auth/change-password",
  // userValidator.create,
  // authValidator.create,
  changePassword
);

// for approving doctor
routes.post(
  "/auth/approve-doctor",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  approveDoctor
);

// for canceling doctor
routes.post(
  "/auth/cancel-doctor",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  cancelDoctor
);

// for logging in
routes.post("/auth/login", authValidator.login, login);

// for logging in
routes.post("/auth/login-as-doctor", authValidator.login, loginAsDoctor);

// for logging in
routes.post("/auth/logout", logout);

module.exports = routes;
