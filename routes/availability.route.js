const express = require("express");
const routes = express();
const {
  addAvailability,
  getAllServices,
  getServiceById,
  getAvailabilityByDoctorId,
  updateServiceById,
} = require("../controller/availability.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const {
  isAuthorizedUser,
  isAuthorizedAdmin,
} = require("../middleware/authValidationJWT");
// const { authValidator } = require("../middleware/authValidation");

routes.post("/add-availability", addAvailability);

routes.get("/get-all-services", getAllServices);

routes.get(
  "/get-service-by-id/:id",

  getServiceById
);

routes.get(
  "/get-availability-by-doctorId/:id",

  getAvailabilityByDoctorId
);

routes.put("/update-service-by-id/:id", isAuthorizedAdmin, updateServiceById);

module.exports = routes;
