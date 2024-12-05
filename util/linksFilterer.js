
const linksFilterer = (links)=>{
    try {
    return links.filter(link => {
        const urlObj = new URL(link);
    
        return (
            ( 
                (urlObj.pathname.includes("/wiki/") || urlObj.pathname.includes("/wikipedia/")) &&       // Ensures the path includes /wiki/
                urlObj.pathname.length > 5 &&                // Avoid overly short paths
                urlObj.pathname.length <= 40) && 

//             urlObj.hostname.includes("example.com") ||  // Matches primary domain
//             urlObj.hostname.includes("contestsite.com") || // Matches contest-specific domain
//             urlObj.hostname.includes("leaderboard.com") || // Matches leaderboard-related site
    
//             // 2. Specific Path Matching
//             urlObj.pathname.includes("/contest/") ||       // Links containing 'contest'
//             urlObj.pathname.includes("/challenges/") ||    // Links containing 'challenges'
//             urlObj.pathname.includes("/problems/") ||      // Links containing 'problems'
//             urlObj.pathname.includes("/register/") ||      // Links to registration pages
//             urlObj.pathname.includes("/leaderboard/") ||   // Links to leaderboards
//             urlObj.pathname.includes("/results/") ||       // Links to contest results
    

//             !urlObj.pathname.endsWith(".jpg") &&           // Excludes images
//             !urlObj.pathname.endsWith(".png") &&           // Excludes images
//             !urlObj.pathname.endsWith(".gif") &&           // Excludes gifs
//             !urlObj.pathname.endsWith(".pdf") &&           // Excludes PDFs
    
//             // 4. Include HTTP and HTTPS Links
//             (urlObj.protocol === "http:" || urlObj.protocol === "https:") &&
    
//             // 5. Length Filtering
//             urlObj.pathname.length > 5 &&                  // Exclude overly short paths
//             urlObj.pathname.length < 500 &&                // Exclude excessively long paths
    
//             // 6. Exclude Login or Authentication Pages
//             !urlObj.pathname.includes("%D") &&
//             !urlObj.pathname.includes("/login") &&         // Avoids login pages
//             !urlObj.pathname.includes("/signup") &&        // Avoids signup pages
//             !urlObj.pathname.includes("/auth/") &&         // Avoids authentication routes
    
//             // 7. Exclude Common Ad or Tracking Parameters
            
//             !urlObj.search.includes("utm_source") &&       // Avoids tracking links
//             !urlObj.search.includes("utm_medium") &&       // Avoids tracking links
//             !urlObj.search.includes("ref=") &&             // Avoids referral links
//             !urlObj.search.includes("affiliate=") &&       // Avoids affiliate links
    
//             // 8. Prioritize Contest-Related Keywords
//             (urlObj.pathname.includes("coding") ||         // Prioritizes paths with 'coding'
//             urlObj.pathname.includes("competition") ||     // Prioritizes 'competition'
//             urlObj.pathname.includes("hackathon") ||       // Prioritizes 'hackathon'
//             urlObj.pathname.includes("tournament")) &&  
            
//  // Prioritizes 'tournament'
    
//             // 9. Exclude Irrelevant File Paths
//             !urlObj.pathname.includes("/ads/") &&          // Avoid ads
//             !urlObj.pathname.includes("/promo/") &&        // Avoid promotional pages
//             !urlObj.pathname.includes("/download/") &&     // Avoid download links
    
            // 10. Allow Only Valid Hostnames
            urlObj.hostname !== ""                         // Ensures hostname exists
        );
    });
} catch (error) {
    console.error("Error filtering links:", error);
    return []; // Return an empty array if an error occurs
}
    
}

export default linksFilterer;