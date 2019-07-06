// Require all models
const db = require("../models");

const cors = require("cors");

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

        let totalReviewCount = 0;
        let averageStarRating = 0;
        let ASIN = "B07TD89MX1"; // ideally data from the front-end... EVENTUALLY!

       scrape.scrapeTotalReviews(totalReviewCount, averageStarRating, ASIN)

        // Redirect to see the json with all the reviews and data
        res.redirect("/api/reviews");
    });

    // Route for getting all analyzing reviews using Watson
    app.get("/api/analyze", function (req, res) {
        
        
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

    app.post("/api/post", cors(), function(req, res) {
        console.log("post successful");
        res.json({message: "post successful"});
    })

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
