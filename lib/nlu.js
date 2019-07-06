const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
require('dotenv');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2018-11-16',
    iam_apikey: process.env.NLU_IAM_APIKEY,
    url: process.env.NLU_URL
});

console.log(process.env);


class nluWatson {

    analyzeReviews(keyword1, keyword2, keyword3) {
        return new Promise((resolve, reject) => {
            console.log("inside analyzeReviews of nluWatson Class");
            const analyzeParams = {
                'url': 'http://one-view-reviews-api.herokuapp.com/api/reviews',
                // 'text': "I do not like this watch. it is not lightweight and hard to adjust.",
                'features': {
                    'categories': {
                        'emotion': true,
                        'sentiment': true,
                        // 'limit': 3
                    },
                    'concepts': {
                        'emotion': true,
                        'sentiment': true,
                        // 'limit': 3
                    },
                    'emotion': {
                        'targets': [
                            keyword1,
                            keyword2,
                            keyword3
                        ]
                    },
                    'entities': {
                        'emotion': true,
                        'sentiment': true,
                        //   'limit': 1
                    },
                    'keywords': {
                        'sentiment': true,
                        'emotion': true,
                        //   'limit': 3
                    }
                }
            };

            naturalLanguageUnderstanding.analyze(analyzeParams, function (err, response) {
                if (err) {
                    console.log(`err : ${err}`);
                    reject(err);
                } else {
                    resolve(response);
                    console.log(JSON.stringify(response, null, 2));
                }
            });
        });
    }
}

module.exports = nluWatson;

