const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
    nhsNumber: { type: String, required: true, unique: true },
    consultationHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
