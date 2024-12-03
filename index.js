
import crawl from "./util/getLinks.js"
import { wiki_robots } from "./util/wikipedia-robots.js";

let wiki_robots_blocked_sites = wiki_robots;
let crawlable_list = [];

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
    let queue = [];
    let visited = new Set();
    let crawlableList = await crawl(url); 
    queue.push(crawlableList[0]);

    while (queue.length !== 0) {
        const currentSite = queue.shift(); 
        if (visited.has(currentSite)) {
            continue;
        }

        visited.add(currentSite);

        console.log(`Visiting: ${currentSite}`);
        await delay();
        const newLinks = await crawl(currentSite);
        for (let link of newLinks) {
            if (!visited.has(link)) {
                queue.push(link); 
            }
        }
    }

    console.log("Crawl complete.");
}


startCrawling();