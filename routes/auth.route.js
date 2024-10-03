const express = require("express");
const routes = express();
const { signup, login, logout } = require("../controller/auth.controller");
const ProductController = require("../controller/ProductController");
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

// for logging in
routes.post("/auth/login", authValidator.login, login);

// for logging in
routes.post("/auth/logout", logout);

module.exports = routes;
