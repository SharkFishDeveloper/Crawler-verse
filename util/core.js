import stopwords from 'stopwords';
import natural from 'natural';

// Load default English stop words
const englishStopWords = new Set(stopwords.english);

// Additional stop words that you want to include
const extraStopWords = new Set([
    "mwparseroutput", "hlist", "olmwparseroutput", "sisterprojectslist", 
    "dlmwparseroutput", "ddlastchildaftermwparseroutput", "dtlastchildaftermwparseroutput",
    "wikisource", "plainlist", "mainpageboxbluemwparseroutput", "mainpageboxgreenmwparseroutput",   
    "emmwparseroutput", "mainpageheading", "mainpageboxorange", "mainpagemaintable", 
    "mainpageboxgreen", "mainpageboxblue","navbox","wikipedia","blue","button","main","width","height","text","title","heading","content","mainpage","vector","content","padding","wikimedia","parser","output","mont","displaystyle","disabled","identificadors"
]);

export const stopWords = new Set([...englishStopWords, ...extraStopWords]);

export function extractWords(text) {
    const tokenizer = new natural.WordTokenizer();
    return tokenizer.tokenize(text.toLowerCase()).filter(word => /^[a-z]+$/.test(word)); // only keep alphabetic words
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
        const normalizedCount = Math.floor((count / totalWords) * 10000); // Scaling for more precision
        return [word, normalizedCount];
    });

    // Sort by normalized frequency in descending order
    const sortedWordCount = normalizedWordCount.sort((a, b) => b[1] - a[1]);
    return sortedWordCount.slice(0, 40); // Return top 40 words
}
