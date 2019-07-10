// Require all models
const db = require("../models");

class Mongo {

    deleteAllInMongo() {
        // grabs all of the reviews to delete
        db.Review.deleteMany()
            .then((reviews) => {
                console.log("function 3: All deleted");
            })
    }

    inputReviewInMongo(reviews) {
        console.log("function 4: right before input");

        //  Create a new document in Mongo by creating a `result` object built from scraping
        db.Review.insertMany(reviews)
            .then(response => {
                console.log("function 4: Database populated!")
            });
    }

    findReviewsContainingKeyword(keywordString) {
        console.log("inside function 6: text searching mongo reviews");
        let textToSearchFor = 'price quality service';
        let keywordArray;
        let keyword1;
        let keyword2;
        let keyword3;

        console.log(`keywordString: ${keywordString}`);
        if (keywordString) {
            keywordArray = keywordString.split(',');
            if (keywordArray.length === 3) {
                keyword1 = keywordArray[0];
                keyword2 = keywordArray[1];
                keyword3 = keywordArray[2];
                textToSearchFor += ' ' + keyword1 + ' ' + keyword2 + ' ' + keyword3;
                console.log(`textToSearchFor: ${textToSearchFor}`);
            } else if (keywordArray.length === 2) {
                keyword1 = keywordArray[0];
                keyword2 = keywordArray[1];
                textToSearchFor += ' ' + keyword1 + ' ' + keyword2;
                console.log(`textToSearchFor: ${textToSearchFor}`);
            } else if (keywordArray.length === 1) {
                keyword1 = keywordArray[0];
                textToSearchFor += ' ' + keyword1;
                console.log(`textToSearchFor: ${textToSearchFor}`);
            }
        }
        console.log(`textToSearchFor: ${textToSearchFor}`);
        return this.searchReviewFunction(textToSearchFor);
    }

    searchReviewFunction(textToSearchFor) {
        return db.Review.aggregate(
            [
                { $match: { $text: { $search: textToSearchFor } } },
                { $project: { reviewTitle: 1, reviewText: 1, _id: 0, score: { $meta: "textScore" } } },
                { $match: { score: { $gt: 1 } } },
                { $sort: { score: { $meta: "textScore" } } },
                // { $group: { _id:  { $meta: "textScore" }, count: { $sum: 2 } } },
                
            ]
        ).then((response) => {
            console.log("found a match");
            console.log(response);
            return response;
        });
    }

}

module.exports = Mongo;