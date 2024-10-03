const mongoose = require("mongoose");
// const validator = require("validator")
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "please provide email"],
      unique: true,
      lowercase: true,
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

    wrongAttempts: {
      type: Number,
      required: false,
      default: 0,
    },

    isLocked: {
      type: Boolean,
      required: false,
      default: false,
    },

    lockedTill: {
      type: Date,
      required: false,
      default: 0,
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
