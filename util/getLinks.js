import checkRobotsTxt from "./checkRobots.js";
import linksFilterer from "./linksFilterer.js";



export default async function crawl(urlString) {
    const url = new URL(urlString);
    let notCrawlableList =[];
    //! hardcode first site
    const websiteResponse = await checkRobotsTxt("https://en.wikipedia.org");
    if (websiteResponse.crawlable) {
        notCrawlableList = Array.isArray(websiteResponse.notCrawlableList) 
        ? websiteResponse.notCrawlableList 
        : [];  // Default to an empty array if it's not an array
    }

    let response;
    try {
        response = await fetch(url);
    } catch (error) {
        console.error(red(`Error fetching URL: ${url}`, error));
        return;
    }

    if (!response.ok) {
        console.error(red(`Failed to fetch: ${url} (Status: ${response.status})`));
        return;
    }

    const html = await response.text();

    // Extract URLs
    const links = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(match => match[1]);
    // console.log(`Found ${links.length} links on ${url.href}:`, links);

    // Extract title and metadata
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "No title";
    let listOfFilteredLinks = linksFilterer(links);
    listOfFilteredLinks = listOfFilteredLinks.filter(link => {
        const url = new URL(link);
        return !notCrawlableList.some(disallowedPath => url.pathname.includes(disallowedPath));
    });

    console.log("FINAL CRAWLABLE LIST ->",listOfFilteredLinks)
    return listOfFilteredLinks;
}
