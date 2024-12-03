import checkRobotsTxt from "./checkRobots.js";
import linksFilterer from "./linksFilterer.js";
import { countWords } from "./core.js";
import prisma from "./prisma.js";
import { red, redBright } from "colorette";


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

    const links = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(match => match[1]);

    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "No title";

    //! count no. of words per page and arrange them
    const bodyText = html.replace(/<\/?[^>]+(>|$)/g, " ");  // Remove HTML tags
    const wordFrequency = countWords(bodyText);

    //* save to DATABASE
    const metadata = extractMetadata(html);
    await saveWordFrequencies(urlString,wordFrequency,metadata);
    //* AFTER SAVINGING TO DB

    let listOfFilteredLinks = linksFilterer(links);
    listOfFilteredLinks = listOfFilteredLinks.filter(link => {
        const url = new URL(link);
        return !notCrawlableList.some(disallowedPath => url.pathname.includes(disallowedPath));
    });
    return listOfFilteredLinks;
}

function extractMetadata(html) {
    // Example: Extract a description from the <meta name="description" content="..."> tag
    const metaDescriptionMatch = html.match(/<meta name="description" content="([^"]+)"/);
    const description = metaDescriptionMatch ? metaDescriptionMatch[1] : "No description available";


    // Combine them into a JSON object to store in the metadata field
    return description
}

async function saveWordFrequencies(websiteName, wordFrequency,metadata) {
    try {

        const website = await prisma.website.create({
            data: {
                name: websiteName, // Create the website
                metadata: metadata, // Add the metadata
            },
        });

        const wordData = wordFrequency.map(([word, importance]) => ({
            word,
            importance,
            websiteId: website.id,
        }));

        // Insert all words for the newly created website
        await prisma.word.createMany({
            data: wordData,
        });

      console.log('Word frequencies saved successfully!');
    } catch (error) {
        console.log(error)
    }
  }
  