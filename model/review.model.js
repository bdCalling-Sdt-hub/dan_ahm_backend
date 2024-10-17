const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviews: {
    type: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        review: String,
        rating: Number,
        _id: false,
      },
    ],
  },
  averageRating: Number,
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
