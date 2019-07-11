// Require all models
const db = require("../models");

// Require axios to make the AJAX call
const axios = require("axios");

// Require cheerio for scraping the website
const cheerio = require("cheerio");

class Scrape {

    scrapeTotalReviews(ASIN) {
        let totalReviewCount = 0;
        let queryURL = "https://www.amazon.com/product-reviews/" + ASIN + "/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&pageNumber=1&sortBy=recent";

        // First, we grab the total number of reviews with axios
        return axios.get(queryURL).then(response => {

            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            $(".a-fixed-left-grid").each(function (i, element) {
                if ($(this).find(".totalReviewCount").text()) {
                    totalReviewCount = $(this).find(".totalReviewCount").text();
                }
                console.log(`totalReviews: ${totalReviewCount}`);
            });
            if (totalReviewCount > 250) {
                return totalReviewCount = 250;
            }
            return totalReviewCount;
        });
    }

    scrapeReviews(totalReviewCount, ASIN) {
        return new Promise((resolve, reject) => {

            let numReviews = 0;
            let reviewText = [];
            let reviewTitle = [];
            let date = [];

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
                });
                promises.push(p);

            }
            Promise.all(promises)
                .then(() => {
                    resolve({
                        reviewTitle,
                        reviewText,
                        date
                    });
                });
        });

    }

    makeReviewObject(reviewArrays) {
        console.log(reviewArrays);

        let reviews = [];

        for (let i = 0; i < reviewArrays.reviewText.length; i++) {
            let review = {
                reviewTitle: reviewArrays.reviewTitle[i],
                reviewText: reviewArrays.reviewText[i],
                date: reviewArrays.date[i]
            }
            reviews.push(review);

        }

        return reviews;
    }
}

module.exports = Scrape