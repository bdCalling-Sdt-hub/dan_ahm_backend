const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const availabilitySchema = new Schema(
  {
    title: {
      type: String,
      // required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    dateTimes: [
      {
        type: Date,
        // required: true,
      },
    ],
    daysOfWeek: [
      {
        type: String,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    ],
    availableDate: {
      startDateTime: {
        type: Date,
        required: true,
      },
      endDateTime: {
        type: Date,
        required: true,
      },
    },
    consultationType: {
      type: String,
      // required: true,
      enum: ["video", "audio"],
    },
    duration: {
      type: Number,
      // required: true,
    },
    division: {
      type: String,
      default: "general",
    },
    doctorType: {
      type: String,
      default: "general",
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    // status: {
    //   type: String,
    //   enum: ["pending", "approved", "cancelled"],
    //   default: "pending",
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
