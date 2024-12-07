const express = require("express");
const routes = express();
const {
  addPrescription,
  getPrescriptionByAppointment,
  editPrescriptionByPrescriptionId,
  deletePrescription,
  downloadPrescription,
  addPrescriptionTemplate,
  getPrescriptionTemplate,
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
  "/edit-prescription/:prescriptionId",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedUser,
  editPrescriptionByPrescriptionId
);

routes.delete(
  "/delete-prescription/:prescriptionId",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedUser,
  deletePrescription
);

routes.put(
  "/download-prescription/:prescriptionId",
  // // userValidator.create,
  // // authValidator.create,
  // isAuthorizedUser,
  downloadPrescription
);

routes.post(
  "/add-prescription-template",
  // userValidator.create,
  // authValidator.create,
  // isAuthorizedUser,
  addPrescriptionTemplate
);

routes.get(
  "/get-prescription-template",
  // userValidator.create,
  // authValidator.create,
  // isAuthorizedUser,
  getPrescriptionTemplate
);

module.exports = routes;
