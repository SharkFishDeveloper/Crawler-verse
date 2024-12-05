

export function calculateTFIDF(results) {
    // Step 1: Calculate IDF for each term
    const totalDocuments = results.length;
    const documentFrequency = {};

    results.forEach(result => {
        const seenWords = new Set();
        result.word.forEach(({ word }) => {
            if (!seenWords.has(word)) {
                seenWords.add(word);
                documentFrequency[word] = (documentFrequency[word] || 0) + 1;
            }
        });
    });

    const idf = {};
    Object.entries(documentFrequency).forEach(([word, freq]) => {
        idf[word] = Math.log(totalDocuments / (1 + freq));
    });

    // Step 2: Calculate TF and TF-IDF for each word in each website
    const tfidfResults = results.map(result => {
        const totalImportance = result.word.reduce((sum, w) => sum + w.importance, 0);
        const tfidfWords = result.word.map(({ word, importance }) => {
            const tf = importance / totalImportance;
            return {
                word,
                tfidf: tf * idf[word] // TF-IDF Score
            };
        });

        return {
            websiteName: result.websiteName,
            metadata: result.metadata,
            domain:result.domain,
            tfidfWords: tfidfWords.sort((a, b) => b.tfidf - a.tfidf) 
        };
    });
    let resultAns = rankResultsByTFIDF(tfidfResults)
    return resultAns;
}


function rankResultsByTFIDF(results) {
    return results
        .map((website) => {
            const totalTFIDF = website.tfidfWords.reduce((sum, word) => sum + word.tfidf, 0);
            return {
                ...website,
                totalTFIDF
            };
        })
        .sort((a, b) => b.totalTFIDF - a.totalTFIDF); // Sort by totalTFIDF in descending order
}