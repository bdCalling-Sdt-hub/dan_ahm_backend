const express = require("express");
const routes = express();
const {
  signup,
  login,
  logout,
  signupAsDoctor,
  approveDoctor,
  cancelDoctor,
} = require("../controller/auth.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const { isAuthorizedUser } = require("../middleware/authValidationJWT");
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

// for approving doctor
routes.post(
  "/auth/approve-doctor",
  // userValidator.create,
  // authValidator.create,
  approveDoctor
);

// for canceling doctor
routes.post(
  "/auth/cancel-doctor",
  // userValidator.create,
  // authValidator.create,
  cancelDoctor
);

// for logging in
routes.post("/auth/login", authValidator.login, login);

// for logging in
routes.post("/auth/logout", logout);

module.exports = routes;
