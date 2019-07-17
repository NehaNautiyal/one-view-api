const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaveReviewSchema = new Schema({
    score: {
        type: String,
        required: true
    },
    reviews: {
        type: Array,
        required: true
    },
    targets: {
        type: Array,
        required: true
    },
    usage: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: false
    }
});

SaveReviewSchema.index({ '$**': 'text' });

const SaveReview = mongoose.model("SaveReview", SaveReviewSchema);

module.exports = SaveReview;