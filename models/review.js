const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  ASIN: { 
      type: String, 
      // required: true 
    },
  reviewText: { 
      type: String,
    required: true },
  starRating: Number,
  author: String,
  date: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
