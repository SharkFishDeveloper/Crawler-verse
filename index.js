import { blueBright, greenBright, red } from "colorette";
import linksFilterer from "./linksFilterer.js";

let invalidCount = 0;
let count = 0;

async function checkRobotsTxt(url) {
    try {
        const baseUrl = new URL(url); 
        const robotsUrl = new URL("/robots.txt", baseUrl.origin); 
        const response = await fetch(robotsUrl);
        if (!response.ok) return true; // No robots.txt, assume allowed

        const robotsTxt = await response.text();

        const disallowedPaths = robotsTxt
        .split("\n")
        .filter(line => line.startsWith("Disallow:"))
        .map((line) => {
            const path = line.split(":")[1]?.trim();
            if (path) {
                invalidCount++; 
            }
        });
        console.log("NOT ALLOWED ->",invalidCount);

        try {
            for (const path of disallowedPaths) {
                if (url.pathname.startsWith(path)) {
                    console.log(`Blocked by robots.txt: ${url}`);
                    return false;
                }
        }
        } catch (error) {
         console.log("Error",error.message.substring(0,100));   
        }
        return true;
    } catch (error) {
        console.error("Error fetching robots.txt:", error);
        return true; // Fail-safe: assume allowed
    }
}

async function crawl(urlString) {
    const url = new URL(urlString);
    console.log(greenBright(`Crawling: ${url.href}`));

    //* CHECK FOR CRAWLER PERMISSIONS - https://en.wikipedia.org
    // const isAllowed = await checkRobotsTxt("https://en.wikipedia.org");
    // if (!isAllowed){
    //     console.log(red("Cannot crawl - ",urlString))
    //     return
    // } 

    let response;
    // try {
    //     response = await fetch(url);
    // } catch (error) {
    //     console.error(red(`Error fetching URL: ${url}`, error));
    //     return;
    // }

    // if (!response.ok) {
    //     console.error(red(`Failed to fetch: ${url} (Status: ${response.status})`));
    //     return;
    // }

    // const html = await response.text();

    // // Extract URLs
    // const links = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(match => match[1]);
    // console.log(`Found ${links.length} links on ${url.href}:`, links);

    // // Extract title and metadata
    // const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    // const title = titleMatch ? titleMatch[1] : "No title";
    const list = [
        'https://map-bms.wikipedia.org/wiki/Ijo',
  'https://ba.wikipedia.org/wiki/%D0%99%D3%99%D1%88%D0%B5%D0%BB',
  'https://be.wikipedia.org/wiki/%D0%97%D1%8F%D0%BB%D1%91%D0%BD%D1%8B_%D0%BA%D0%BE%D0%BB%D0%B5%D1%80',
  'https://be-tarask.wikipedia.org/wiki/%D0%97%D1%8F%D0%BB%D1%91%D0%BD%D1%8B_%D0%BA%D0%BE%D0%BB%D0%B5%D1%80',
  'https://bg.wikipedia.org/wiki/%D0%97%D0%B5%D0%BB%D0%B5%D0%BD_%D1%86%D0%B2%D1%8F%D1%82',
  'https://bar.wikipedia.org/wiki/Grea',
  'https://bo.wikipedia.org/wiki/%E0%BD%A3%E0%BE%97%E0%BD%84%E0%BC%8B%E0%BD%81%E0%BD%B4%E0%BC%8D',
  'https://bs.wikipedia.org/wiki/Zelena',
  'https://br.wikipedia.org/wiki/Gwer_(liv)',
  'https://ca.wikipedia.org/wiki/Verd',
  'https://cv.wikipedia.org/wiki/%D0%A1%D0%B8%D0%BC%C4%95%D1%81_%D1%82%C4%95%D1%81',
  'https://cs.wikipedia.org/wiki/Zelen%C3%A1',
  'https://ch.wikipedia.org/wiki/Betde',
  'https://sn.wikipedia.org/wiki/Zerere',
  'https://cy.wikipedia.org/wiki/Gwyrdd',
  'https://da.wikipedia.org/wiki/Gr%C3%B8n',
  'https://pdc.wikipedia.org/wiki/Grie',
  'https://de.wikipedia.org/wiki/Gr%C3%BCn',
  'https://dty.wikipedia.org/wiki/%E0%A4%B9%E0%A4%B0%E0%A4%BF%E0%A4%AF%E0%A5%8B',
  'https://et.wikipedia.org/wiki/Roheline',
  'https://el.wikipedia.org/wiki/%CE%A0%CF%81%CE%AC%CF%83%CE%B9%CE%BD%CE%BF',
  'https://myv.wikipedia.org/wiki/%D0%9F%D0%B8%D0%B6%D0%B5_(%D1%82%D1%8E%D1%81)',
  'https://es.wikipedia.org/wiki/Verde',
  'https://eo.wikipedia.org/wiki/Verdo',
  'https://ext.wikipedia.org/wiki/Verdi',
  'https://eu.wikipedia.org/wiki/Berde',
  'https://fa.wikipedia.org/wiki/%D8%B3%D8%A8%D8%B2',
  'https://fr.wikipedia.org/wiki/Vert',
  'https://fy.wikipedia.org/wiki/Grien',
  'https://fur.wikipedia.org/wiki/Vert',
  'https://ga.wikipedia.org/wiki/Glas',
  'https://gl.wikipedia.org/wiki/Verde',
  'https://gu.wikipedia.org/wiki/%E0%AA%B2%E0%AB%80%E0%AA%B2%E0%AB%8B',
  'https://hak.wikipedia.org/wiki/Liu%CC%8Dk-set',
  'https://ko.wikipedia.org/wiki/%EB%85%B9%EC%83%89',
  'https://ha.wikipedia.org/wiki/Kore',
  'https://haw.wikipedia.org/wiki/%CA%BB%C5%8Dma%CA%BBoma%CA%BBo',
  'https://hy.wikipedia.org/wiki/%D4%BF%D5%A1%D5%B6%D5%A1%D5%B9',
  'https://hi.wikipedia.org/wiki/%E0%A4%B9%E0%A4%B0%E0%A4%BE',
  'https://hr.wikipedia.org/wiki/Zelena',
  'https://id.wikipedia.org/wiki/Hijau',
  'https://os.wikipedia.org/wiki/%D0%9A%C3%A6%D1%80%D0%B4%C3%A6%D0%B3%D1%85%D1%83%D1%8B%D0%B7',
  'https://zu.wikipedia.org/wiki/Eluhlaza',
  'https://is.wikipedia.org/wiki/Gr%C3%A6nn',
  'https://it.wikipedia.org/wiki/Verde',
  'https://he.wikipedia.org/wiki/%D7%99%D7%A8%D7%95%D7%A7',
  'https://jv.wikipedia.org/wiki/Ijo',
  'https://kbp.wikipedia.org/wiki/T%C9%A9%C5%8B_hat%CA%8A_tomna%C9%A3',
  'https://pam.wikipedia.org/wiki/Aluntiang',
  'https://ka.wikipedia.org/wiki/%E1%83%9B%E1%83%AC%E1%83%95%E1%83%90%E1%83%9C%E1%83%94',
  'https://ks.wikipedia.org/wiki/%D8%B3%D9%8E%D8%A8%D9%95%D8%B2_(%D8%B1%D9%86%D9%9B%DA%AF)',
  'https://kk.wikipedia.org/wiki/%D0%96%D0%B0%D1%81%D1%8B%D0%BB_%D1%82%D2%AF%D1%81',
  'https://sw.wikipedia.org/wiki/Kijani',
  'https://ht.wikipedia.org/wiki/V%C3%A8t',
  'https://ku.wikipedia.org/wiki/Kesk',
  'https://lld.wikipedia.org/wiki/Vert',
  'https://lad.wikipedia.org/wiki/Vedre',
  'https://lbe.wikipedia.org/wiki/%D0%A9%D1%8E%D0%BB%D0%BB%D0%B8%D1%81%D1%81%D0%B0',
  'https://la.wikipedia.org/wiki/Viridis',
  'https://lv.wikipedia.org/wiki/Za%C4%BC%C4%81_kr%C4%81sa',
  'https://lb.wikipedia.org/wiki/Gr%C3%A9ng',
  'https://lt.wikipedia.org/wiki/%C5%BDalia',
  'https://ln.wikipedia.org/wiki/L%C3%A1ngi_la_mp%C9%94nd%C3%BA',
  'https://lfn.wikipedia.org/wiki/Verde',
  'https://lmo.wikipedia.org/wiki/Verd',
  'https://hu.wikipedia.org/wiki/Z%C3%B6ld',
  'https://mk.wikipedia.org/wiki/%D0%97%D0%B5%D0%BB%D0%B5%D0%BD%D0%B0_%D0%B1%D0%BE%D1%98%D0%B0',
  'https://ml.wikipedia.org/wiki/%E0%B4%AA%E0%B4%9A%E0%B5%8D%E0%B4%9A',
  'https://mt.wikipedia.org/wiki/A%C4%A7dar',
  'https://mr.wikipedia.org/wiki/%E0%A4%B9%E0%A4%BF%E0%A4%B0%E0%A4%B5%E0%A4%BE',
  'https://xmf.wikipedia.org/wiki/%E1%83%AC%E1%83%95%E1%83%90%E1%83%9C%E1%83%94',
  'https://arz.wikipedia.org/wiki/%D8%A7%D8%AE%D8%B6%D8%B1_(%D9%84%D9%88%D9%86)',
  'https://mzn.wikipedia.org/wiki/%D8%B3%D9%88%D8%B2',
  'https://ms.wikipedia.org/wiki/Hijau',
  'https://mni.wikipedia.org/wiki/%EA%AF%91%EA%AF%81%EA%AF%AA%EA%AF%95',
  'https://cdo.wikipedia.org/wiki/Lu%C5%8Fh-s%C3%A1ik',
  "https://example.com"
    ];
    const listOfFilteredLinks = linksFilterer(list);
    console.log("AFTER FILTER",listOfFilteredLinks)
}

async function startCrawling() {
    crawl("https://en.wikipedia.org/wiki/Green");
}

startCrawling();