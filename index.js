
import crawl from "./util/getLinks.js"
import express from "express";
import prisma from "./util/prisma.js";

function delay() {
    const randomDelay = Math.floor(Math.random() * 4000) + 1000; 
    return new Promise(resolve => setTimeout(resolve, randomDelay));
}

async function startCrawling() {
    //* on other sites remove the below comment
    // wiki_robots_blocked_sites = await checkRobotsTxt("https://en.wikipedia.org")
    await bfsCrawl("https://en.wikipedia.org/wiki/Main_Page");
}

async function bfsCrawl(url) {
    let crawled = 0;
    let queue = [];
    let visited = new Set();
    let crawlableList = await crawl(url); 
    queue.push(crawlableList[1]);

    while (queue.length !== 0) {
        const currentSite = queue.shift(); 
        if (visited.has(currentSite)) {
            continue;
        }

        visited.add(currentSite);

        console.log(`Visiting: ${currentSite}`,crawled);
        await delay();
        const newLinks = await crawl(currentSite);
        for (let link of newLinks) {
            if (!visited.has(link)) {
                crawled++;
                queue.push(link); 
            }
        }
    }

    console.log("Crawl complete.");
}


// startCrawling();


const app = express();
app.use(express.json());
app.listen(3000,()=>{
    console.log("Listening on port : 3000")
})

app.get("/",(req,res)=>{
    return res.json({message:"Alive is working"})
})

app.post("/search", async (req, res) => {
    const { query } = req.body;  // Extract the search query from the request body

    if (!query) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        // Query the Word model in Prisma, searching for words that match the query
        const searchResults = await prisma.word.findMany({
            where: {
                word: {
                    contains: query,  // Match the query in the word field
                    mode: 'insensitive' // Case-insensitive search
                }
            },
            orderBy: {
                importance: 'desc'  // Order by importance in descending order
            },
            include: {
                website: {
                    select: {
                        name: true ,
                        metadata:true 
                    }
                }
            },
            take: 10
        });

        // If no results are found, send an appropriate message
        if (searchResults.length === 0) {
            return res.json({ message: "No words found for your search query." });
        }

        const formattedResults = searchResults.map(result => ({
            word: result.word,
            importance: result.importance,
            websiteName: result.website.name,
            metadata: result.website.metadata // Flatten the website name
        }));

        // Return the search results
        return res.json({
            message: `Your search query "${query}" returned the following results:`,
            results: formattedResults
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while processing your search." });
    }
});