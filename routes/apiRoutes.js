// Require all models
var db = require("../models");
var Review = require("../models/review");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function (app) {

    // A GET route for scraping the echoJS website
    app.get("/api/scrape", function (req, res) {

        console.log(req.body);

        let reviewText = [];
        let numReviews = 0;
        let rating = [];
        let author = [];
        let reviewDate = [];
        let totalReviewCount = 1000;
        let averageStarRating = 0;

        // // First, we grab the body of the html with axios
        // axios.get("https://www.amazon.com/King-Koil-Luxury-Raised-Mattress/product-reviews/B06XWG7H3S/ref=cm_cr_arp_d_paging_btm_next_2?ie=UTF8&reviewerType=all_reviews&pageNumber=1")
        //     .then(response => {

        //             // Then, we load that into cheerio and save it to $ for a shorthand selector
        //             var $ = cheerio.load(response.data);

        //             // Now, we grab every h2 within an article tag, and do the following:
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


        for (let page = 1; page < (totalReviewCount / 10); page++) {
            axios.get("https://www.amazon.com/product-reviews/B06XWG7H3S/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=avp_only_reviews&pageNumber=" + page + "&sortBy=recent")
                .then((response) => {

                    var $ = cheerio.load(response.data);

                    $(".review-text").each(function (i, element) {
                        // Push to an empty array
                        if ($(this).text().trim()) {
                            reviewText = ($(this).text().trim());
                        }
                        numReviews++;
                        // console.log(reviewText);
                        // console.log("reviewText");
                        console.log(`Total reviews added: ${numReviews}`);

                        let result = {
                            reviewText: reviewText
                        }

                        db.Review.create(result)
                        .then(function (dbReview) {
                            console.log("Created!")
                        })
                        .catch(function (err) {
                            // If an error occurred, log it
                            console.log(err);
                        });

                    });

                    $(".review-date").each(function (i, element) {
                        // Push to an empty array
                        if ($(this).text().trim()) {
                            reviewDate.push($(this).text().trim());
                        }
                        // console.log(reviewDate);
                    });

                    $(".review-rating").each(function (i, element) {
                        // Push to an empty array
                        if ($(this).text().trim()) {
                            rating.push($(this).text().trim());
                        }    
                        // console.log(rating);
                    });

                    $(".a-profile-name").each(function (i, element) {
                        // Push to an empty array
                        if ($(this).text().trim()) {
                        author.push($(this).text().trim());
                        }
                    });

                   
                })
        }

         // Create a new document in Mongo by creating a `result` object built from scraping
        //  for (let i = 0; i < reviewText.length; i++) {
        //     let result = {};
        //     // result.author = author[i];
        //     // result.starRating = rating[i];
        //     result.reviewText += reviewText[i];
            
           
        //     }

        // Send a message to the client
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
        // grabs all of the reviews
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
        // grabs all of the reviews
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
