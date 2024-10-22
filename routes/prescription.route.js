const express = require("express");
const routes = express();
const {
  addPrescription,
  getPrescriptionByAppointment,
  editPrescriptionByPrescriptionId,
  deletePrescription,
} = require("../controller/prescription.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const { isAuthorizedUser } = require("../middleware/authValidationJWT");
// const { authValidator } = require("../middleware/authValidation");

routes.post(
  "/add-prescription",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedUser,
  addPrescription
);

routes.get(
  "/get-prescriptions-by-appointment/:appointmentId",
  // userValidator.create,
  // authValidator.create,
  getPrescriptionByAppointment
);

routes.put(
  "/edit-prescription/:noteId",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedUser,
  editPrescriptionByPrescriptionId
);

routes.delete(
  "/delete-prescription/:noteId",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedUser,
  deletePrescription
);

module.exports = routes;
