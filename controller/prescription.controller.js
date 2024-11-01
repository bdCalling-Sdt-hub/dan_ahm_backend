const Prescription = require("../model/prescription.model");
const Appointment = require("../model/appointment.model");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

// Add a new note to an appointment
const addPrescription = async (req, res) => {
  try {
    const { appointmentId, title, content } = req.body;
    if (!appointmentId || !content) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("appointmentId and content fields are required"));
    }
    const userId = req.user._id; // Assuming user is available in req.user after authentication
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
    const newPrescription = await Prescription.create({
      title,
      content,
      appointmentId,
      addedBy: userId,
    });

    // Add the note reference to the appointment
    appointment.prescription.push(newPrescription._id);
    await appointment.save();

    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Prescription added successfully", { newPrescription }));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Get notes by appointment ID
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find the notes for the given appointment
    const prescription = await Prescription.find({ appointmentId }).populate(
      "addedBy",
      "email -_id"
    );

    if (!prescription.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("No prescription found for this appointment"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("prescription retrieved successfully", { prescription }));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Edit a note
const editPrescriptionByPrescriptionId = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { title, content } = req.body;
    const userId = req.user._id; // Assuming user is available in req.user after authentication

    // const userId = req.body.userId; // Assuming user is available in req.user after authentication

    // Find the note
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("prescription not found"));
    }

    // Only the user who created the note can edit it
    if (prescription.addedBy.toString() !== userId.toString()) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .send(failure("You are not authorized to edit this prescription"));
    }

    // Update the note fields
    prescription.title = title || prescription.title;
    prescription.content = content || prescription.content;

    // Save the updated note
    await prescription.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("prescription updated successfully", { prescription }));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

// Delete a note
const deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const userId = req.user._id; // Assuming user is available in req.user after authentication

    // Find the note
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("prescription not found"));
    }

    // Only the user who created the note can delete it
    if (prescription.addedBy.toString() !== userId.toString()) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .send(failure("You are not authorized to delete this prescription"));
    }

    // Set the isDeleted property to true
    prescription.isDeleted = true;
    await prescription.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("prescription deleted successfully", prescription));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

module.exports = {
  addPrescription,
  getPrescriptionByAppointment,
  editPrescriptionByPrescriptionId,
  deletePrescription,
};
