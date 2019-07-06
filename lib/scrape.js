// Require all models
const db = require("../models");

// Require axios to make the AJAX call
const axios = require("axios");

// Require cheerio for scraping the website
const cheerio = require("cheerio");

class Scrape {

    inputReviewInMongo(amazonReviewText, amazonRating, amazonAuthor, amazonReviewDate) {
        console.log("inside input review function");
        //  Create a new document in Mongo by creating a `result` object built from scraping
        for (let i = 0; i < amazonReviewText.length; i++) {
            let result = {
                reviewText: amazonReviewText[i],
                starRating: amazonRating[i],
                author: amazonAuthor[i],
                date: amazonReviewDate[i]
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

    scrapeReviews(totalReviewCount, ASIN) {

        let amazonReviewText = [];
        let numReviews = 0;
        let amazonRating = [];
        let amazonAuthor = [];
        let amazonReviewDate = [];

        // Loop through all the pages of reviews
        for (let page = 1; page <= (Math.ceil(totalReviewCount / 10)); page++) {
            let asin = "B07TD89MX1"; // what we need to get from front-end with extension
            let queryURL = "https://www.amazon.com/product-reviews/" + asin + "/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=avp_only_reviews&pageNumber=" + page + "&sortBy=recent";

            axios.get(queryURL).then((response) => {

                var $ = cheerio.load(response.data);

                $(".review-text").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonReviewText.push($(this).text().trim());
                    }
                    numReviews++;
                    // console.log(reviewText);
                    // console.log("reviewText");
                    console.log(`Total reviews added: ${numReviews}`);

                });

                $(".review-date").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonReviewDate.push($(this).text().trim());
                    }
                    // console.log(reviewDate);
                });

                $(".review-rating").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonRating.push($(this).text().trim());
                    }
                    // console.log(rating);
                });

                $(".a-profile-name").each(function (i, element) {
                    // Push to an empty array
                    if ($(this).text().trim()) {
                        amazonAuthor.push($(this).text().trim());
                    }
                });

                if (numReviews === parseInt(totalReviewCount)) {
                    this.inputReviewInMongo(amazonReviewText, amazonRating, amazonAuthor, amazonReviewDate);
                }

            });

        }
    }

}

module.exports = Scrape