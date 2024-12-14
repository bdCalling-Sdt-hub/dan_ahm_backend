const express = require("express");
const routes = express();
const {
  addAvailability,
  getAvailabilityByDoctorId,
  deleteAvailabilityById,
  getAllAvailabilities,
  getServiceById,
  updateServiceById,
} = require("../controller/availability.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const {
  isAuthorizedUser,
  isAuthorizedAdmin,
} = require("../middleware/authValidationJWT");
// const { authValidator } = require("../middleware/authValidation");

routes.post("/add-availability", addAvailability);

routes.get("/get-all-availabilities", getAllAvailabilities);

routes.get(
  "/get-service-by-id/:id",

  getServiceById
);

routes.get(
  "/get-availability-by-doctorId/:id",

  getAvailabilityByDoctorId
);

routes.put("/update-service-by-id/:id", isAuthorizedAdmin, updateServiceById);

routes.delete("/delete-availability-by-id/:id", deleteAvailabilityById);

module.exports = routes;
