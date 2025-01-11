const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prescriptionTemplate = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("prescriptionTemplate", prescriptionTemplate);
