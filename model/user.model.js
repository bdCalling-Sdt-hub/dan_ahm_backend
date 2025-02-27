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
    image: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 5,
      select: false,
    },
    address: {
      type: String,
      required: false,
    },
    currentNHSGPDetails: {
      type: String,
      required: false,
    },
    nameOfDoctor: {
      type: String,
      required: false,
    },
    surgeryAddress: {
      type: String,
      required: false,
    },
    surgeryTelephoneNumber: {
      type: String,
      required: false,
    },
    surgeryEmail: {
      type: String,
      required: false,
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
      // unique: true,
    },
    uniqueId: {
      type: String,
      // unique: true,
    },
    consultationHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
    ],
    consultationUpcoming: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
    ],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    isDoctor: {
      type: Boolean,
      required: false,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      required: false,
      default: false,
    },

    emailVerifyCode: {
      type: String,
      required: false,
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

    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
