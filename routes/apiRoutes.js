// Require all models
const db = require("../models");

// Require axios to make the AJAX call
const axios = require("axios");

// Require cheerio for scraping the website
const cheerio = require("cheerio");

const Watson = require("../lib/nlu");
const watson = new Watson();

const Scrape = require("../lib/scrape");
const scrape = new Scrape();

module.exports = function (app) {

    // A GET route for scraping the amazon page
    app.get("/api/scrape", function (req, res) {

        console.log(req.body); // currently undefined

        
        let totalReviewCount = 0; // could be more or less, but having trouble finding this out and then looping through the pages
        let averageStarRating = 0;

        // First, we grab the total number of reviews with axios
        axios.get("https://www.amazon.com/product-reviews/B07TD89MX1/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=avp_only_reviews&pageNumber=1&sortBy=recent")
            .then(response => {

                    // Then, we load that into cheerio and save it to $ for a shorthand selector
                    var $ = cheerio.load(response.data);

                    $(".a-fixed-left-grid").each(function (i, element) {
                        if ($(this).find(".totalReviewCount").text()) {
                            totalReviewCount = $(this).find(".totalReviewCount").text();
                        }
                        if ($(this).find(".averageStarRating").text()) {
                            averageStarRating = $(this).find(".averageStarRating").text();
                        }
                        console.log(`totalReviews: ${totalReviewCount}`)
                        console.log(`Average Star Rating: ${averageStarRating}`)
                    });
        }).then((response) => { scrape.scrapeReviews(totalReviewCount) })
        .catch((error) => {console.log(error)})
                
                
            
            // The below code is not currently working. Error is saying nluWatson.analyzeReviews() is not a function
            // and that there is Unhandled Promise Rejection originating by throwing inside of an async function without 
            //a catch block or by rejecting a promise which was not handed with .catch() (rejection id: 100)

            // .then(reviews => {
            //     console.log("right before watson analysis")
            //     res.send(nluWatson.analyzeReviews());
            // })
        

        // console.log(nluWatson.analyzeReviews('waterproof'));

        // Redirect to see the json with all the reviews and data
        // res.redirect("/api/analyze");
        res.redirect("/api/reviews");
    });

    // Route for getting all analyzing reviews using Watson
    app.get("/api/analyze", function (req, res) {
        // grabs all of the reviews
        // nluWatson.analyzeReviews('waterproof')
        watson.logSomething('hello World')
            .then(function (analysis) {
                console.log(analysis);
                console.log('analysis from Watson');
                res.json(analysis);
            })
            .catch(function (error) {
                res.json(error);
            });
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
