var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors");

var PORT = process.env.PORT || 3000;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/oneviewreviews";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Import routes and give the server access to them.
require("./routes/apiRoutes")(app);

app.listen(PORT, function() {
  console.log("App now listening at localhost:" + PORT);
});
