
import crawl from "./util/getLinks.js"
import express from "express";
import prisma from "./util/prisma.js";
import natural from 'natural';
import stopword from 'stopword';
import {calculateTFIDF} from "./util/calculateTidf.js";
import { red, redBright } from "colorette";


function delay() {
    const randomDelay = Math.floor(Math.random() * 4000) + 1000; 
    return new Promise(resolve => setTimeout(resolve, randomDelay));
}

async function startCrawling() {
    //* on other sites remove the below comment
    // wiki_robots_blocked_sites = await checkRobotsTxt("https://en.wikipedia.org")
    await bfsCrawl('https://en.wikipedia.org/wiki/History');
}

async function bfsCrawl(url) {
    let crawled = 1;
    let queue = [];
    let visited = new Set();
    let crawlableList = await crawl(url); 
    console.log(crawlableList)
    queue.push(crawlableList[1]);
    while (queue.length !== 0) {
        const currentSite = queue.shift(); 
        if (visited.has(currentSite)) {
            continue;
        }
        visited.add(currentSite);

        console.log(`Visiting: ${currentSite}`,crawled);
        await delay();
        crawled++;
        const newLinks = await crawl(currentSite);
        if(newLinks!==undefined && newLinks!==null){
            for (let link of newLinks) {
                if (!visited.has(link)) {
                    queue.push(link); 
                }
            }
        }
    }

    console.log("Crawl complete.");
}


// startCrawling();


const app = express();
app.use(express.json());
app.listen(4000,()=>{
    console.log("Listening on port : 3000")
})

app.get("/",(req,res)=>{
    return res.json({message:"Alive is working"})
})

app.post("/search", async (req, res) => {
    const { query } = req.body;  
    const processedTokens = preprocessText(query);
    console.log(processedTokens);

    try {
        const searchResults = await prisma.website.findMany({
            where: {
                word: {
                    some: {
                        word: {
                            in: processedTokens, 
                            mode: 'insensitive'
                        }
                    }
                }
            },
            select: {
                name: true,
                image: true,
                domain: true,
                metadata: true,
                word: {
                    where: {
                        word: {
                            in: processedTokens, 
                            mode: 'insensitive'
                        }
                    },
                    select: {
                        word: true, 
                        importance: true,                        
                    }
                },
            },
        });
        
        console.log(searchResults)
        // If no results are found, send an appropriate message
        if (searchResults.length === 0) {
            return res.json({ message: "No words found for your search query.",status:300 });
        }

        const formattedResults = searchResults.map(result => ({
            word: result.word,
            importance: result.importance,
            websiteName: result.name,
            metadata: result.metadata 
        }));

        var result = calculateTFIDF(formattedResults);
        console.log(JSON.stringify(result, null, 2));


        return res.json({
            message: `Your search query "${query}" returned the following results:`,
            results: result,
            status:200
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while processing your search." });
    }
});

function preprocessText(text) {
    text = text.toLowerCase();
    const tokenizer = new natural.WordTokenizer();
    let tokens = tokenizer.tokenize(text);

    //? is NLP important, to include (I haven't)
    tokens = stopword.removeStopwords(tokens);
    return tokens;

}