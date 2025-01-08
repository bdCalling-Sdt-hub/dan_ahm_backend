const express = require("express");
const routes = express();
const {
  bookAppointment,
  addZoomLinkToAppointment,
  addEmailForZoomLink,
  assignDoctorToAppointment,
  cancelAppointment,
  completeAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentByPatientId,
  getAppointmentByDoctorId,
  getAllDocumentsByAppointmentId,
  deleteADocumentByAppointmentId,
  addDocumentToAppointment,
} = require("../controller/appointment.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const {
  isAuthorizedUser,
  isAuthorizedAdmin,
} = require("../middleware/authValidationJWT");
const fileUpload = require("../middleware/fileUpload");
// const { authValidator } = require("../middleware/authValidation");

routes.post(
  "/book-service",
  // userValidator.create,
  // authValidator.create,
  fileUpload(),
  isAuthorizedUser,
  bookAppointment
);

routes.post(
  "/add-zoom-link",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  addZoomLinkToAppointment
);

routes.post(
  "/add-email-for-zoom-link",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedUser,
  addEmailForZoomLink
);

routes.get(
  "/get-all-appointments",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  getAllAppointments
);

routes.get(
  "/get-appointment-by-id/:id",
  // userValidator.create,
  // authValidator.create,
  getAppointmentById
);

routes.get(
  "/get-appointment-by-patientId",
  isAuthorizedUser,
  getAppointmentByPatientId
);

routes.get(
  "/get-appointment-by-doctorId",
  isAuthorizedUser,
  getAppointmentByDoctorId
);

routes.get(
  "/get-all-documents-by-appointmentId/:id",

  getAllDocumentsByAppointmentId
);

routes.patch(
  "/cancel-appointment-by-id",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  cancelAppointment
);

routes.patch(
  "/complete-appointment-by-id",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  completeAppointment
);

routes.patch(
  "/assign-doctor-to-appointment",
  // userValidator.create,
  // authValidator.create,
  isAuthorizedAdmin,
  assignDoctorToAppointment
);

routes.delete(
  "/delete-a-document-by-appointmentId/:id",
  deleteADocumentByAppointmentId
);

routes.post(
  "/add-document-to-appointment/:id",
  fileUpload(),
  addDocumentToAppointment
);

module.exports = routes;
