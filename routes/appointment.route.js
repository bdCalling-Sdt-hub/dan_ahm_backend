const express = require("express");
const routes = express();
const {
  bookAppointment,
  addZoomLinkToAppointment,
  cancelAppointment,
  completeAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentByPatientId,
  getAppointmentByDoctorId,
} = require("../controller/appointment.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const { isAuthorizedUser } = require("../middleware/authValidationJWT");
// const { authValidator } = require("../middleware/authValidation");

routes.post(
  "/book-service",
  // userValidator.create,
  // authValidator.create,
  bookAppointment
);

routes.post(
  "/add-zoom-link",
  // userValidator.create,
  // authValidator.create,
  addZoomLinkToAppointment
);

routes.get(
  "/get-all-appointments",
  // userValidator.create,
  // authValidator.create,
  getAllAppointments
);

routes.get(
  "/get-appointment-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  getAppointmentById
);

routes.get(
  "/get-appointment-by-patientId/:id",
  // userValidator.create,
  // authValidator.create,
  getAppointmentByPatientId
);

routes.get(
  "/get-appointment-by-doctorId/:id",
  // userValidator.create,
  // authValidator.create,
  getAppointmentByDoctorId
);

routes.patch(
  "/cancel-appointment-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  cancelAppointment
);

routes.patch(
  "/complete-appointment-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  completeAppointment
);

module.exports = routes;
