const express = require("express");
const routes = express();
const {
  addService,
  getAllServices,
  getServiceById,
  getServiceByDoctorId,
  updateServiceById,
  deleteServiceById,
  disableServiceById,
  enableServiceById,
  approveServiceById,
  cancelServiceById,
} = require("../controller/service.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const { isAuthorizedUser } = require("../middleware/authValidationJWT");
const { get } = require("mongoose");
// const { authValidator } = require("../middleware/authValidation");

routes.post(
  "/add-service",
  // userValidator.create,
  // authValidator.create,
  addService
);

routes.get(
  "/get-all-services",
  // userValidator.create,
  // authValidator.create,
  getAllServices
);

routes.get(
  "/get-service-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  getServiceById
);

routes.get(
  "/get-service-by-doctorId/:id",
  // userValidator.create,
  // authValidator.create,
  getServiceByDoctorId
);

routes.put(
  "/update-service-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  updateServiceById
);

routes.delete(
  "/delete-service-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  deleteServiceById
);

routes.patch(
  "/disable-service-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  disableServiceById
);

routes.patch(
  "/enable-service-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  enableServiceById
);

routes.patch(
  "/approve-service-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  approveServiceById
);

routes.patch(
  "/cancel-service-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  cancelServiceById
);

module.exports = routes;