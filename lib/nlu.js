const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2018-11-16',
    iam_apikey: process.env.NLU_IAM_APIKEY,
    url: process.env.NLU_URL
});


class nluWatson {


    analyzeReviews() {
        return new Promise((resolve, reject) => {
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
                            'lightweight',
                            'adjust'
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
            })
        })
    }
}

module.exports = nluWatson;

