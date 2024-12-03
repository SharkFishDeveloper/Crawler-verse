
import {  redBright } from "colorette";
import fs from "fs";

export default async function checkRobotsTxt(url) {
    try {
        const baseUrl = new URL(url); 
        const robotsUrl = new URL("/robots.txt", baseUrl.origin); 
        const response = await fetch(robotsUrl);
        if (!response.ok) return {crawlable:true,notCrawlableList:[]}; // No robots.txt, assume allowed

        const robotsTxt = await response.text();
        const disallowedPaths = robotsTxt
        .split("\n")
        .filter(line => line.startsWith("Disallow:")) 
        .map(line => line.split(":")[1]?.trim())
        .filter(path => path && path !== '/' && path !== ''); 
    
        const content = `export var wiki_robots = ${JSON.stringify(disallowedPaths, null, 2)};`;
        fs.writeFileSync("./util/wikipedia-robots.js",content);
        return {
            crawlable: true,
            notCrawlableList: disallowedPaths
        };
    } catch (error) {
        console.error(redBright("Error fetching robots.txt:", error));
        return { crawlable: true, notCrawlableList: [] }; // Fail-safe: assume allowed
    }
}