const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    division: {
      type: String,
      required: true,
      //   enum: [
      //     "General Doctor",
      //     "Psychiatry",
      //     "Dentist",
      //     "Pediatrics",
      //     "Hormone",
      //     "Medicine",
      //     "Gastrologic",
      //     "Pulmonology",
      //     "Sexual Health",
      //     "Allergy",
      //   ],
    },
    doctorType: {
      type: String,
      required: true,
      //   enum: [
      //     "General Doctor",
      //     "Cardiologist",
      //     "Dentist",
      //     "Psychiatrist",
      //     "Dermatologist",
      //     "Pulmonologist",
      //     "Endocrinologist",
      //   ],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    dateTimes: [
      {
        type: Date,
        required: true,
      },
    ],
    daysOfWeek: [
      {
        type: String,
        required: true,
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
    consultationType: {
      type: String,
      required: true,
      enum: ["video", "audio"],
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
        required: true,
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
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
