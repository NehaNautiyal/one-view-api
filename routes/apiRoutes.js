// Require all models
const db = require("../models");

// Require axios to make the AJAX call
const axios = require("axios");

// Require cheerio for scraping the website
const cheerio = require("cheerio");

const nluWatson = require("../lib/nlu");

module.exports = function (app) {

    // A GET route for scraping the amazon page
    app.get("/api/scrape", function (req, res) {

        //Delete all the current reviews in the database first
        db.Review.deleteMany()
            .then(function (reviews) {
                res.json(reviews);
            })
            .catch(function (error) {
                res.json(error);
            });

        console.log(req.body); // currently undefined

        let amazonReviewText = [];
        let numReviews = 0;
        let amazonRating = [];
        let amazonAuthor = [];
        let amazonReviewDate = [];
        let totalReviewCount = 1000; // could be more or less, but having trouble finding this out and then looping through the pages
        let averageStarRating = 0;

        // // First, we grab the total number of reviews with axios
        // axios.get("https://www.amazon.com/King-Koil-Luxury-Raised-Mattress/product-reviews/B06XWG7H3S/ref=cm_cr_arp_d_paging_btm_next_2?ie=UTF8&reviewerType=all_reviews&pageNumber=1")
        //     .then(response => {

        //             // Then, we load that into cheerio and save it to $ for a shorthand selector
        //             var $ = cheerio.load(response.data);

        //             $(".a-fixed-left-grid").each(function (i, element) {
        //                 if ($(this).find(".totalReviewCount").text()) {
        //                     totalReviewCount = $(this).find(".totalReviewCount").text();
        //                 }
        //                 if ($(this).find(".averageStarRating").text()) {
        //                     averageStarRating = $(this).find(".averageStarRating").text();
        //                 }
        //                 console.log(`totalReviews: ${totalReviewCount}`)
        //                 console.log(`Average Star Rating: ${averageStarRating}`)
        //             });
        // }).then((response) => {

        // Loop through all the pages of reviews
        for (let page = 1; page < (totalReviewCount / 10); page++) {
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


                }).then((response) => {
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
                })
                // The below code is not currently working. Error is saying nluWatson.analyzeReviews() is not a function
                // and that there is Unhandled Promise Rejection originating by throwing inside of an async function without 
                //a catch block or by rejecting a promise which was not handed with .catch() (rejection id: 100)
                
                // .then(reviews => {
                //     console.log("right before watson analysis")
                //     res.send(nluWatson.analyzeReviews());
                // })
        }

        // Redirect to see the json with all the reviews and data
        res.redirect("/api/reviews");
    });

    // Route for getting all Reviews from the db
    app.get("/api/reviews", function (req, res) {
        // grabs all of the reviews
        db.Review.find({})
            .then(function (reviews) {
                res.json(reviews);
            })
            .catch(function (error) {
                res.json(error);
            });
    });

    // Route for deleting all Reviews from the db
    app.delete("/api/reviews", function (req, res) {
        // grabs all of the reviews to delete
        db.Review.deleteMany()
            .then(function (reviews) {
                res.json(reviews);
            })
            .catch(function (error) {
                res.json(error);
            });
    });

    // Route to get only saved reviews
    app.get("/api/reviews/saved", function (req, res) {
        db.Review.find({ saved: true })
            .then(function (reviews) {
                res.json(reviews);
            })
            .catch(function (error) {
                res.json(error);
            });
    });


    app.put("/reviews/saved/:id", function (req, res) {
        // changes unsaved to saved (or vice verse)
        db.Review.findOneAndUpdate({ _id: req.params.id }, { saved: false }, { new: true })
            .then(function (reviews) {
                res.json(reviews);
            })
            .catch(function (error) {
                res.json(error);
            });
    });

    app.get("/reviews/saved/:id", function (req, res) {
        // grabs all of the reviews
        db.Review.findOne({ _id: req.params.id })
            .then(function (reviews) {
                res.json(reviews);
            })
            .catch(function (error) {
                res.json(error);
            });
    });

};
