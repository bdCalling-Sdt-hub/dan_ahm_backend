const jsonWebToken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const { failure } = require("../utilities/common");

const isAuthorized = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization);
    const token = authorization.split(" ")[1];
    console.log("token", token);
    const validate = jsonWebToken.verify(token, process.env.JWT_SECRET);
    console.log("validate", validate.role);
    if (validate.role == "admin") {
      next();
    } else {
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Something went wrong"));
    }
  } catch (error) {
    console.log(error);
    if (error instanceof jsonWebToken.TokenExpiredError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Access expired"));
    } else if (error instanceof jsonWebToken.JsonWebTokenError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Unauthorized access"));
    } else {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
    }
  }
};

const isAuthorizedUser = (req, res, next) => {
  try {
    const userId = req.params.id;

    const { authorization } = req.headers;
    console.log(authorization);
    const token = authorization.split(" ")[1];
    console.log("token", token);
    const validate = jsonWebToken.verify(token, process.env.JWT_SECRET);
    console.log("validate", validate.role);
    console.log("validate _id", validate._id);
    console.log("validate userId", userId);
    if (validate._id == userId && validate.role == "user") {
      next();
    } else {
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Something went wrong"));
    }
  } catch (error) {
    console.log(error);
    if (error instanceof jsonWebToken.TokenExpiredError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Access expired"));
    } else if (error instanceof jsonWebToken.JsonWebTokenError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Unauthorized access"));
    } else {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
    }
  }
};

module.exports = { isAuthorized, isAuthorizedUser };
