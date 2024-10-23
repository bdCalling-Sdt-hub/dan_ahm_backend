const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nhsNumber: {
      type: String,
      required: false,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
    type: { type: String, enum: ["video", "phone"], required: true },
    zoomLink: { type: String },
    patientEmail: { type: String },
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
    prescription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prescription",
      },
    ],
    description: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
