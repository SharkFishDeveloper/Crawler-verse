
import crawl from "./util/getLinks.js"
import express from "express";
import prisma from "./util/prisma.js";
import natural from 'natural';
import stopword from 'stopword';
import {calculateTFIDF} from "./util/calculateTidf.js";
import { blue, blueBright, gray, green, greenBright, magenta, red, redBright, yellow } from "colorette";
import INITIAL_CRAWL from "./util/crawl-topics.js";
import fs from "fs/promises";
import { encode, decode } from "@msgpack/msgpack";


const STATE_FILE = './util/saved-state.json'; 

function delay() {
    const randomDelay = Math.floor(Math.random() * 500) + 500; 
    return new Promise(resolve => setTimeout(resolve, randomDelay));
}

async function startCrawling() {
    //* on other sites remove the below comment
    // wiki_robots_blocked_sites = await checkRobotsTxt("https://en.wikipedia.org")
    await bfsCrawl();
}


    async function saveState(queue, visited) {
        const state = {
            queue,
            visited: Array.from(visited), // Convert Set to Array for JSON serialization
        };
        const serializedState = encode(state);
        await fs.writeFile(STATE_FILE, serializedState);
        console.log("State saved.");
    }

async function loadState() {
    try {
        const data = await fs.readFile(STATE_FILE); // Read binary data
        const state = decode(data); // Decode using MessagePack
        console.log(yellow("State loaded."));
        return {
            queue: state.queue || [],
            visited: new Set(state.visited || []), // Convert Array back to Set
        };
    } catch (err) {
        console.log(yellow("No saved state found. Starting fresh."));
        return { queue: [...INITIAL_CRAWL], visited: new Set() };
    }
}

async function bfsCrawl() {
    
    let crawled = 0;
    const { queue, visited } = await loadState(); // Load the state
    console.log(queue[0])

    console.log(magenta(`Starting crawl with ${visited.size} visited links and ${queue.length} links in the queue.`));

    while (queue.length !== 0) {
        const currentSite = queue.shift(); // Get the next site to crawl
        if (visited.has(currentSite)) {
            continue;
        }
        visited.add(currentSite);

        console.log(blue(`Visiting: ${currentSite}`,crawled));
        await delay();
        crawled++;
        const newLinks = await crawl(currentSite);
        const limitedLinks = newLinks ?  newLinks.slice(0, 20) : undefined;
        if(limitedLinks!==undefined && limitedLinks!==null){
            for (let link of limitedLinks) {
                if (!visited.has(link)) {
                    queue.push(link); 
                }
            }
        }
        console.log(greenBright(`Total visited: ${visited.size}, Queue size: ${queue.length}`));
        if (crawled % 50 === 0) { // Adjust frequency as needed
            await saveState(queue, visited);
        }
    }

    console.log(gray("Crawl complete."));
}


startCrawling();


const app = express();
app.use(express.json());
app.listen(4000,()=>{
    console.log("Listening on port : 4000")
})

app.get("/",(req,res)=>{
    return res.json({message:"Alive is working"})
})

app.post("/search", async (req, res) => {
    const { query } = req.body;  
    const processedTokens = preprocessText(query);

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
            take:10
        });

        if (searchResults.length === 0) {
            return res.json({ message: "No words found for your search query.",status:300 });
        }

        const formattedResults = searchResults.map(result => ({
            word: result.word,
            importance: result.importance,
            websiteName: result.name,
            metadata: result.metadata ,
            domain:result.domain
        }));

        var result = calculateTFIDF(formattedResults);


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