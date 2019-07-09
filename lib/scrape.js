// Require all models
const db = require("../models");

// Require axios to make the AJAX call
const axios = require("axios");

// Require cheerio for scraping the website
const cheerio = require("cheerio");

const Watson = require("./nlu");
const watson = new Watson();

class Scrape {

    scrapeTotalReviews(ASIN) {
        return new Promise((resolve, reject) => {
            let totalReviewCount = 0;
            console.log(`totalReviewCount: ${totalReviewCount} inside function 1 before axios call`);

            // First, we grab the total number of reviews with axios
            axios.get("https://www.amazon.com/product-reviews/" + ASIN + "/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=avp_only_reviews&pageNumber=1&sortBy=recent")
                .then(response => {
                    console.log("function 1: inside first axios call");

                    // Then, we load that into cheerio and save it to $ for a shorthand selector
                    var $ = cheerio.load(response.data);

                    $(".a-fixed-left-grid").each(function (i, element) {
                        if ($(this).find(".totalReviewCount").text()) {
                            totalReviewCount = $(this).find(".totalReviewCount").text();
                            console.log(`totalReviewCount inside scraping .each: ${totalReviewCount}`);
                        }
                        console.log(`totalReviews: ${totalReviewCount}`);
                    });
                    resolve(totalReviewCount);

                });
        });
    }


    scrapeReviews(totalReviewCount, ASIN) {
        return new Promise((resolve, reject) => {

            let numReviews = 0;

            let reviews = [];
            let reviewText = [];
            let reviewTitle = [];
            let date = [];
            let reviewStr = '';

            console.log(`function 2: total num of pages: ${Math.ceil(parseInt(totalReviewCount) / 10)}`);

            let promises = [];
            // Loop through all the pages of reviews
            for (let page = 1; page <= (Math.ceil(parseInt(totalReviewCount) / 10)); page++) {

                let queryURL = "https://www.amazon.com/product-reviews/" + ASIN + "/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&pageNumber=" + page + "&sortBy=recent";

                let p = axios.get(queryURL).then((response) => {

                    

                    var $ = cheerio.load(response.data);

                    $(".review-text").each(function (i, element) {
                        // Push to an empty array
                        if ($(this).text().trim()) {
                            reviewText.push(($(this).text().trim()));
                        }
                        numReviews++;
                        console.log(`Total reviews added: ${numReviews}`);

                    });

                    $(".review-date").each(function (i, element) {
                        // Push to an empty array
                        if ($(this).text().trim()) {
                            date.push(($(this).text().trim()));
                        }
                    });

                    $(".review-title").each(function (i, element) {
                        // Push to an empty array
                        if ($(this).text().trim()) {
                            reviewTitle.push(($(this).text().trim()));
                        }
                    });

                    for (let i = 0; i < reviewText.length; i++) {
                        let review = {
                            reviewTitle: reviewTitle[i],
                            reviewText: reviewText[i],
                            date: date[i]
                        }
                        reviews.push(review);
                    }

                });
                console.log(reviews);
                console.log("reviews inside function2");
                promises.push(p);

            }
            Promise.all(promises).then(() => resolve(reviews));
        });

    }

    deleteAllInMongo() {
        // grabs all of the reviews to delete
        db.Review.deleteMany()
            .then((reviews) => {
                console.log("function 3: All deleted");
            })
    }

    inputReviewInMongo(reviews) {
        console.log("function 4: inside input review function");

        //  Create a new document in Mongo by creating a `result` object built from scraping
        db.Review.insertMany(reviews)
            .then(response => {
                console.log("Created!")
            });
    }
}

module.exports = Scrape