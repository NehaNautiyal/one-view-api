
const yellow = async function (totalReviewCount, ASIN, keywordString) {
    try {
        let totalReviews = await scrape.scrapeTotalReviews(totalReviewCount, ASIN);
        let reviews = await scrape.scrapeReviews(totalReviews, ASIN);
        await scrape.deleteAllInMongo();
        await scrape.inputReviewInMongo(reviews);
        let analysis = await analyzeAllReviews(reviews, keywordString);
        return analysis;
    }
    catch (err) {
        console.log(err);
    }
}






