import checkRobotsTxt from "./checkRobots.js";
import linksFilterer from "./linksFilterer.js";
import { countWords } from "./core.js";
import prisma from "./prisma.js";
import { red, redBright } from "colorette";
import { wiki_robots } from "./wikipedia-robots.js";


export default async function crawl(urlString) {
    var url;
    try {
        url = new URL(urlString);
    } catch (error) {
       console.log(error)
       return [];
    }
    let notCrawlableList =[];
    //! hardcode first site
    // const websiteResponse = await checkRobotsTxt("https://en.wikipedia.org");
    const websiteResponse = wiki_robots;
    if (websiteResponse.crawlable) {
        notCrawlableList = Array.isArray(websiteResponse.notCrawlableList) 
        ? websiteResponse.notCrawlableList 
        : [];  
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
    const metadata = extractMetadata(html,urlString);
    await saveWordFrequencies(urlString,wordFrequency,metadata);
    //* AFTER SAVINGING TO DB

    let listOfFilteredLinks = linksFilterer(links);
    listOfFilteredLinks = listOfFilteredLinks.filter(link => {
        const url = new URL(link);
        return !notCrawlableList.some(disallowedPath => url.pathname.includes(disallowedPath));
    });
    return listOfFilteredLinks;
}

function extractMetadata(html,url) {
    const metaDescriptionMatch = html.match(/<meta name="description" content="([^"]+)"/);
    const description = metaDescriptionMatch ? metaDescriptionMatch[1] : "No description available";

    const logo = extractLogo(html, url);

    return { description, image:logo };
}


function extractLogo(html, url) {
    let logo = null;

    // Check for <link rel="icon">
    const faviconMatch = html.match(/<link rel="(?:shortcut )?icon" href="([^"]+)"/);
    if (faviconMatch) {
        logo = resolveUrl(faviconMatch[1], url);
    }

    // Check for <link rel="apple-touch-icon">
    if (!logo) {
        const appleIconMatch = html.match(/<link rel="apple-touch-icon" href="([^"]+)"/);
        if (appleIconMatch) {
            logo = resolveUrl(appleIconMatch[1], url);
        }
    }

    // Check for <meta property="og:image">
    if (!logo) {
        const metaImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (metaImageMatch) {
            logo = resolveUrl(metaImageMatch[1], url);
        }
    }

    // Fallback to favicon at the root of the domain
    if (!logo && url) {
        try {
            const domain = new URL(url).origin;
            logo = `${domain}/favicon.ico`;
        } catch (err) {
            console.error("Invalid URL:", err);
        }
    }

    return logo;
}

// Helper function to resolve relative URLs
function resolveUrl(relativePath, baseUrl) {
    try {
        const base = new URL(baseUrl);
        const resolvedUrl = new URL(relativePath, base);
        return resolvedUrl.toString(); // Returns absolute URL
    } catch (err) {
        console.error("Error resolving URL:", err);
        return relativePath; // Return original path if resolution fails
    }
}

function extractDomain(urlString) {
    try {
        const url = new URL(urlString);
        return url.hostname; // e.g., "example.com"
    } catch (err) {
        console.error("Invalid URL:", err);
        return null;
    }
}

async function saveWordFrequencies(websiteName, wordFrequency,metadata) {
    try {
        const domain = extractDomain(websiteName); // Extract the domain
        const image = metadata.image || null;  

        const website = await prisma.website.create({
            data: {
                name: websiteName, // Create the website
                metadata: metadata,
                domain,
                image
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
  