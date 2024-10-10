const Note = require("../model/note.model");
const Appointment = require("../model/appointment.model");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

// Add a new note to an appointment
const addNote = async (req, res) => {
  try {
    const { appointmentId, title, content } = req.body;
    if (!appointmentId || !content) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("appointmentId and content fields are required"));
    }
    // const userId = req.user._id; // Assuming user is available in req.user after authentication
    const { userId } = req.body; // Assuming user is available in req.user after authentication
    if (!userId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("userId field is required"));
    }
    //

    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found"));
    }

    // Create a new note
    const newNote = await Note.create({
      title,
      content,
      appointmentId,
      addedBy: userId,
    });

    // Add the note reference to the appointment
    appointment.notes.push(newNote._id);
    await appointment.save();

    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Note added successfully", { note: newNote }));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Get notes by appointment ID
const getNotesByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find the notes for the given appointment
    const notes = await Note.find({ appointmentId }).populate(
      "addedBy",
      "email -_id"
    );

    if (!notes.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("No notes found for this appointment"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Notes retrieved successfully", { notes }));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Edit a note
const editNoteByNoteId = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;
    // const userId = req.user._id; // Assuming user is available in req.user after authentication

    const userId = req.body.userId; // Assuming user is available in req.user after authentication

    // Find the note
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Note not found"));
    }

    // Only the user who created the note can edit it
    if (note.addedBy.toString() !== userId.toString()) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .send(failure("You are not authorized to edit this note"));
    }

    // Update the note fields
    note.title = title || note.title;
    note.content = content || note.content;

    // Save the updated note
    await note.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Note updated successfully", { note }));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    // const userId = req.user._id; // Assuming user is available in req.user after authentication

    const userId = req.body.userId; // Assuming user is available in req.user after authentication

    // Find the note
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Note not found"));
    }

    // Only the user who created the note can delete it
    if (note.addedBy.toString() !== userId.toString()) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .send(failure("You are not authorized to delete this note"));
    }

    // Set the isDeleted property to true
    note.isDeleted = true;
    await note.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Note deleted successfully", note));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

module.exports = {
  addNote,
  getNotesByAppointment,
  editNoteByNoteId,
  deleteNote,
};
