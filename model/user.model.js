const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: [true, "please provide email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 5,
      select: false,
    },
    role: {
      type: String,
      enum: ["doctor", "patient", "admin"],
      default: "patient",
    },
    doctorApplicationStatus: {
      type: String,
      enum: ["notApplied", "pending", "approved", "cancelled"],
      default: "notApplied",
    },
    phone: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    balance: {
      type: Number,
      min: 0,
      default: 0,
    },
    dateOfBirth: {
      type: Date,
      // required: true
    },
    nhsNumber: {
      type: String,
      required: false,
      // unique: true,
    },
    consultationHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
    ],
    upcomingHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
    ],
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    isDoctor: {
      type: Boolean,
      required: false,
      default: false,
    },

    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },

    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },

    isLocked: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
