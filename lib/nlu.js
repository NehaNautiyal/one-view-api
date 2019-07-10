const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
require('dotenv');
const db = require('../models');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2018-11-16',
    iam_apikey: process.env.NLU_IAM_APIKEY,
    url: process.env.NLU_URL
});

class nluWatson {

    analyzeReviews(textToAnalyze, keyword1, keyword2, keyword3) {
        return new Promise((resolve, reject) => {
            console.log("inside analyzeReviews of nluWatson Class");

            let autoTargets = [
                'price', 'quality', 'assembly'
            ]
            let userTargets = [];
            if (keyword3) {
                userTargets = [keyword1, keyword2, keyword3];
            } else if (keyword2) {
                userTargets = [keyword1, keyword2];
            } else if (keyword1) {
                userTargets = [keyword1];
            }
            let targetArray = autoTargets.concat(userTargets);
            console.log(targetArray);

            const analyzeParams = {
                // 'url': 'http://one-view-reviews-api.herokuapp.com/api/reviews',
                'text': textToAnalyze,
                // 'clean': true,
                // 'return_analyzed_text': true,
                'features': {
                    'sentiment': {
                        'document': true,
                        'targets': targetArray,
                        'limit': 6
                    },
                    'keywords': {
                        'sentiment': true,
                        'limit': 5
                    }
                }
            };

            naturalLanguageUnderstanding.analyze(analyzeParams, function (err, response) {
                if (err) {
                    console.log(`err : ${err}`);
                    reject(err);
                } else {
                    // console.log(response.sentiment);
                    resolve(response);
                    // console.log(JSON.stringify(response, null, 2));

                }
            });
        });
    }

    analyzeAllReviews(reviews, keywordString) {

        let keywordArray;
        let keyword1;
        let keyword2;
        let keyword3;
        let reviewStr;

        console.log("inside function 5, about to analyze in watson");
        // console.log(reviews);
        console.log(`keywordString: ${keywordString}`);

        for (let i = 0; i < reviews.length; i++) {
            reviewStr += ' ' + reviews[i].reviewTitle + ' ' + reviews[i].reviewText;
        }
        console.log(reviewStr);

        if (keywordString) {
            keywordArray = keywordString.split(',');
            if (keywordArray.length === 3) {
                keyword1 = keywordArray[0];
                keyword2 = keywordArray[1];
                keyword3 = keywordArray[2];
                return this.analyzeReviews(reviewStr, keyword1, keyword2, keyword3);
            } else if (keywordArray.length === 2) {
                keyword1 = keywordArray[0];
                keyword2 = keywordArray[1];
                return this.analyzeReviews(reviewStr, keyword1, keyword2);
            } else if (keywordArray.length === 1) {
                keyword1 = keywordArray[0];
                return this.analyzeReviews(reviewStr, keyword1);
            }
        } else {
            return this.analyzeReviews(reviewStr);
        }
    }
}

module.exports = nluWatson;

