export const stopWords = new Set([
    "the", "and", "for", "with", "this", "that", "of", "to", "is", "in", "on", "at", "a", "an", "by", "it", "as", "from", "be",
    "or", "but", "not", "are", "were", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing",
    "will", "just", "about", "above", "below", "after", "before", "during", "between", "under", "over", "each", "any",
    "all", "some", "more", "few", "less", "most", "least", "own", "other", "another", "such", "so", "than", "too", "very",
    "s", "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn",
    "didn", "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren","was",
    "won", "wouldn","mwparseroutput","hlist","olmwparseroutput","sisterprojectslist","dlmwparseroutput","ddlastchildaftermwparseroutput","dtlastchildaftermwparseroutput","wikisource","plainlist","mainpageboxbluemwparseroutput","mainpageboxgreenmwparseroutput","emmwparseroutput","mainpageheading","mainpageboxorange","mainpagemaintable","mainpageboxgreen","mainpageboxblue"
]);

// Function to clean and tokenize text into words
export function extractWords(text) {
    // Remove non-alphabetic characters (including numbers) and convert to lowercase
    return text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
}

// Function to count the frequency of words
export function countWords(text, minLength = 3, maxFrequency = 100) {
    const wordCount = new Map();
    const words = extractWords(text);

    words.forEach(word => {
        // Filter out stop words, words too short, or words with too high frequency
        if (word && !stopWords.has(word) && word.length >= minLength && word.length <= 30) {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        }
    });

    // Filter out words that occur too frequently
    for (const [word, count] of wordCount.entries()) {
        if (count > maxFrequency) {
            wordCount.delete(word);
        }
    }

    const totalWords = words.filter(word => word && !stopWords.has(word) && word.length >= minLength && word.length <= 30).length;

    // Normalize word count by dividing by total word count
    const normalizedWordCount = [...wordCount.entries()].map(([word, count]) => {
        const normalizedCount = Math.floor((count / totalWords)*10000);
        return [word, normalizedCount];
    });

    // Sort by normalized frequency in descending order
    const sortedWordCount = normalizedWordCount.sort((a, b) => b[1] - a[1]);
    return sortedWordCount.slice(0, 40);
}
