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

module.exports = routes;
