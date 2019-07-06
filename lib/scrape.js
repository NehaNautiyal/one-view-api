// Require all models
const db = require("../models");

// Require axios to make the AJAX call
const axios = require("axios");

// Require cheerio for scraping the website
const cheerio = require("cheerio");

class Scrape {

    scrapeReviews(totalReviewCount, ASIN) {

        let amazonReviewText = [];
        let numReviews = 0;
        let amazonRating = [];
        let amazonAuthor = [];
        let amazonReviewDate = [];
        let amazonReviewTitle = [];

        // Loop through all the pages of reviews
        for (let page = 1; page <= (Math.ceil(totalReviewCount / 10)); page++) {
    
            let queryURL = "https://www.amazon.com/product-reviews/" + ASIN + "/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=avp_only_reviews&pageNumber=" + page + "&sortBy=recent";

            axios.get(queryURL).then((response) => {

                var $ = cheerio.load(response.data);

                $(".review-text").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonReviewText.push($(this).text().trim());
                    }
                    numReviews++;
                    console.log(`Total reviews added: ${numReviews}`);

                });

                $(".review-date").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonReviewDate.push($(this).text().trim());
                    }
                });

                $(".review-title").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonReviewTitle.push($(this).text().trim());
                    }
                });

                $(".review-rating").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonRating.push($(this).text().trim());
                    }
                });

                $(".a-profile-name").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonAuthor.push($(this).text().trim());
                    }
                });

                if (numReviews === parseInt(totalReviewCount)) {
                    this.deleteAllInMongo(amazonReviewText, amazonReviewDate, amazonReviewTitle);
                }

            });

        }
    }

    deleteAllInMongo(amazonReviewText, amazonReviewDate, amazonReviewTitle) {
        // grabs all of the reviews to delete
        db.Review.deleteMany()
            .then((reviews) => {
                console.log("All deleted");
                this.inputReviewInMongo(amazonReviewText, amazonReviewDate, amazonReviewTitle);
            })
            .catch(function (error) {
                res.json(error);
            });
    }

    inputReviewInMongo(amazonReviewText, amazonReviewDate, amazonReviewTitle) {
        console.log("inside input review function");
        //  Create a new document in Mongo by creating a `result` object built from scraping
        for (let i = 0; i < amazonReviewText.length; i++) {
            let result = {
                reviewText: amazonReviewText[i],
                // starRating: amazonRating[i],
                // author: amazonAuthor[i],
                date: amazonReviewDate[i],
                reviewTitle: amazonReviewTitle[i]
            };

            db.Review.create(result)
                .then(function (dbReview) {
                    console.log("Created!")
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        }
    }
}

module.exports = Scrape