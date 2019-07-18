// Require all models
const db = require("../models");

class Mongo {

    async deleteAllInMongo() {
        // grabs all of the reviews to delete
        await db.Review.deleteMany()
            .then((reviews) => {
                console.log("function 3: All deleted");
            })
    }

    async inputReviewInMongo(reviews) {
        console.log("function 4: right before input");

        //  Create a new document in Mongo by creating a `result` object built from scraping
        await db.Review.insertMany(reviews)
            .then(response => {
                console.log("function 4: Database populated!")
            });
    }

    // Function to sort the reviews by date so when they are sent to Watson, the results are relatively consistent
    async sortReviewsInMongo() {
        const sortedReviews = await db.Review.find({}, (err, result) => {
            return result
        }).sort({ date: 1 });

        return sortedReviews
    }

    findReviewsContainingKeyword(keywordString) {
        console.log("inside function 6: text searching mongo reviews");
        let textToSearchFor = '';
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
        if (textToSearchFor) {
            return db.Review.aggregate(
                [
                    { $match: { $text: { $search: textToSearchFor } } },
                    { $project: { reviewTitle: 1, reviewText: 1, _id: 0, score: { $meta: "textScore" } } },
                    { $match: { score: { $gt: 0.5 } } },
                    { $sort: { score: { $meta: "textScore" } } }

                ]
            ).then((response) => {
                console.log("found a match");
                // console.log(response);
                return response;
            });
        } else {
            return db.Review.find({});
        }
    }

    allReviews(){
        return db.Review.find({});
    }

}

module.exports = Mongo;