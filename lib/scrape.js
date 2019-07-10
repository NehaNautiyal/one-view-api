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
                    if (totalReviewCount > 300) {
                        return totalReviewCount = 300;
                    }
                    return totalReviewCount;
        });
    }

    scrapeReviews(totalReviewCount, ASIN) {
        return new Promise((resolve, reject) => {

            let numReviews = 0;
            let reviews = [];
            let reviewText = [];
            let reviewTitle = [];
            let date = [];
            let allPages = 0;

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
                    
                    console.log(page);
                    allPages += page;
                    console.log(allPages);
                    let totalPages = Math.ceil(parseInt(totalReviewCount) / 10);
                    totalPageAddition(totalPages);
                    function totalPageAddition (pages) {
                        if (pages === 0) {
                            return;
                        } else {
                            totalPages += pages -1;
                            totalPageAddition(pages-1);
                        }
                    }
                    console.log(totalPages);
                    // console.log(reviewTitle);
                    if (allPages === totalPages) {
                        console.log('conditional met');
                        for (let i = 0; i < reviewText.length; i++) {
                            let review = {
                                reviewTitle: reviewTitle[i],
                                reviewText: reviewText[i],
                                date: date[i]
                            }
                            reviews.push(review);
                            
                        }
                        console.log(reviews.length);
                    }
                });

                console.log("reviews inside function2");
                promises.push(p);

            }
            // console.log(reviews);
            Promise.all(promises).then(() => resolve(reviews));
        });

    }
}

module.exports = Scrape