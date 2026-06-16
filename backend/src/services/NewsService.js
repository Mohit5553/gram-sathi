const CMSContent = require('../models/CMSContent');

// Clean CDATA from XML strings
function cleanCData(str) {
  if (!str) return '';
  return str.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
}

// Decode HTML entities
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

exports.refreshNews = async () => {
  try {
    console.log('[NewsService] Refreshing live news from Google News RSS...');
    
    // Fetch local and agriculture news feeds from Google News
    const feeds = [
      {
        url: 'https://news.google.com/rss/search?q=gonda+uttar+pradesh&hl=en-IN&gl=IN&ceid=IN:en',
        category: 'local'
      },
      {
        url: 'https://news.google.com/rss/search?q=agriculture+india&hl=en-IN&gl=IN&ceid=IN:en',
        category: 'agriculture'
      }
    ];

    const allItems = [];

    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url);
        if (!response.ok) {
          console.warn(`[NewsService] Failed to fetch feed: ${feed.url}, status: ${response.status}`);
          continue;
        }

        const xmlText = await response.text();
        
        // Parse item blocks using regex
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        let count = 0;

        while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
          const itemContent = match[1];
          
          const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
          const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
          const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
          const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
          const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);

          if (titleMatch && linkMatch) {
            const rawTitle = decodeHtmlEntities(cleanCData(titleMatch[1]));
            
            // Extract title and publisher from the title format: "Headline - Source"
            let title = rawTitle;
            let author = 'Google News';

            const lastDashIndex = rawTitle.lastIndexOf(' - ');
            if (lastDashIndex !== -1) {
              title = rawTitle.substring(0, lastDashIndex).trim();
              author = rawTitle.substring(lastDashIndex + 3).trim();
            } else if (sourceMatch) {
              author = decodeHtmlEntities(cleanCData(sourceMatch[1]));
            }

            const link = cleanCData(linkMatch[1]);
            const pubDate = pubDateMatch ? new Date(cleanCData(pubDateMatch[1])) : new Date();
            const desc = descMatch ? decodeHtmlEntities(cleanCData(descMatch[1])).replace(/<[^>]*>/g, '').trim() : '';

            allItems.push({
              title,
              content: desc || title,
              contentType: 'news',
              link,
              author,
              createdAt: pubDate,
              isActive: true,
              village: feed.category === 'local' ? 'Gonda' : 'All'
            });
            count++;
          }
        }
      } catch (feedErr) {
        console.error(`[NewsService] Error reading feed ${feed.url}:`, feedErr.message);
      }
    }

    if (allItems.length === 0) {
      console.log('[NewsService] No news items parsed from RSS feeds.');
      return false;
    }

    // Clean out previous RSS-cached news items (where author is not Admin)
    await CMSContent.deleteMany({ contentType: 'news', author: { $ne: 'Admin' } });

    // Store parsed news items with high-quality landscape placeholder images
    const farmImages = [
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1605000797499-95a51c7769ae?auto=format&fit=crop&w=400&q=80'
    ];
    const generalImages = [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1588681664899-f142ff2bac99?auto=format&fit=crop&w=400&q=80'
    ];

    const docsToSave = allItems.map((item, idx) => {
      const isFarm = item.title.toLowerCase().includes('farm') || 
                     item.title.toLowerCase().includes('crop') || 
                     item.title.toLowerCase().includes('kisan') || 
                     item.title.toLowerCase().includes('agriculture') || 
                     item.village === 'All';
      
      const images = isFarm ? farmImages : generalImages;
      const imageUrl = images[idx % images.length];

      return {
        ...item,
        imageUrl,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
      };
    });

    await CMSContent.insertMany(docsToSave);
    console.log(`[NewsService] Successfully cached ${docsToSave.length} news items.`);
    return true;
  } catch (error) {
    console.error('[NewsService] General error refreshing news:', error.message);
    return false;
  }
};
