// Require all models
const db = require("../models");

const cors = require("cors");

const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const User = require("../lib/user");
const user = new User();

const testuser = require("../lib/sampleuser.json");

module.exports = function (app) {

    // POST / account – Create a new user profile with account information
    app.post("/api/login", (req, res) => {
        if (!req.body.username) {
            return res.status(401).send({ "message": "A `username` is required" });
        } else if (!req.body.password) {
            return res.status(401).send({ "message": "A `password` is required" });
        }

        let userData = {
            username: req.body.username,
            password: req.body.password
        }

        db.User.save(userData, (error, result) => {
            if (error) {
                return response.status(500).send(error);
            }
            response.send(result);

        })
    })


    // POST / login – Validate account information
    // GET / account – Get account information
    // POST / blog – Create a new blog entry associated to a user
    // GET / blogs – Get all blog entries for a particular user
    // Route for getting all Reviews from the db
    app.get("/user", function (req, res) {
        // grabs all users
        db.User.find({})
            .then(function (users) {
                res.json(users);
            })
            .catch(function (error) {
                res.json(error);
            });
    });


};


// Route to post saved search results
app.post("/reviews/saved", function (req, res) {
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



// res.json({"message": "hello"});    

app.put("/users/saved/:id", function (req, res) {
    // changes unsaved to saved (or vice verse)
    db.User.findOneAndUpdate({ _id: req.params.id }, { saved: false }, { new: true })
        .then(function (users) {
            res.json(users);
        })
        .catch(function (error) {
            res.json(error);
        });
});

