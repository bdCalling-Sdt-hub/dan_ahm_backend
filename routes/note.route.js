const express = require("express");
const routes = express();
const {
  addNote,
  editNoteByNoteId,
  deleteNote,
  getNotesByAppointment,
} = require("../controller/note.controller");
const { userValidator, authValidator } = require("../middleware/validation");
const { isAuthorizedUser } = require("../middleware/authValidationJWT");
// const { authValidator } = require("../middleware/authValidation");

routes.post(
  "/add-note",
  // userValidator.create,
  // authValidator.create,
  addNote
);

routes.get(
  "/get-notes-by-appointment/:appointmentId",
  // userValidator.create,
  // authValidator.create,
  getNotesByAppointment
);

routes.put(
  "/edit-note/:noteId",
  // userValidator.create,
  // authValidator.create,
  editNoteByNoteId
);

routes.delete(
  "/delete-note/:noteId",
  // userValidator.create,
  // authValidator.create,
  deleteNote
);

// routes.get(
//   "/get-appointment-by-doctorId/:id",
//   // userValidator.create,
//   // authValidator.create,
//   getAppointmentByDoctorId
// );

// routes.patch(
//   "/cancel-appointment-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   cancelAppointment
// );

// routes.patch(
//   "/complete-appointment-by-id/:id",
//   // userValidator.create,
//   // authValidator.create,
//   completeAppointment
// );

module.exports = routes;
