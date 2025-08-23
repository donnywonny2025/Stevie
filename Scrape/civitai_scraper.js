const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class CivitAIScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.scrapedData = {
            models: [],
            discussions: [],
            techniques: [],
            trends: []
        };
        this.outputDir = './scraped_data';
    }

    async initialize() {
        console.log('🚀 Initializing CivitAI Scraper...');
        
        // Create output directory
        await fs.mkdir(this.outputDir, { recursive: true });
        
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for production
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set user agent to avoid bot detection
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Add some random delays to seem more human-like
        await this.page.setDefaultTimeout(30000);
        
        console.log('✅ Browser initialized');
    }

    async login() {
        console.log('🔐 Attempting to login...');
        
        try {
            await this.page.goto('https://civitai.com/login', { waitUntil: 'networkidle2' });
            
            console.log('📋 Login page loaded. Please login manually...');
            console.log('⏳ Waiting for manual login (checking for dashboard URL)...');
            
            // Wait for user to manually login - detect successful login by URL change
            // The script will now pause indefinitely until you have manually logged in.
            // Once you have logged in, the script will detect the URL change and continue.
            await this.page.waitForNavigation({ timeout: 0 });
            
            console.log('✅ Login detected, proceeding with scraping...');
            
        } catch (error) {
            console.error('❌ Login timeout or error:', error);
            throw new Error('Login failed or timed out');
        }
    }

    async scrapeModelCategories() {
        console.log('📂 Scraping model categories and trending content...');
        
        const categories = [
            'checkpoint',
            'textualinversion',
            'hypernetwork',
            'aestheticgradient',
            'lora',
            'controlnet',
            'poses'
        ];

        for (const category of categories) {
            console.log(`🔍 Scraping category: ${category}`);
            
            const url = `https://civitai.com/models?types=${category}&sort=Highest%20Rated&period=AllTime`;
            console.log(`Navigating to: ${url}`);
            const response = await this.page.goto(url, {
                waitUntil: 'networkidle2'
            });

            if (response.status() >= 500) {
                console.log(`Server error for category: ${category}. Status: ${response.status()}`);
                continue;
            }

            if (!response.ok()) {
                console.log(`Failed to load page for category: ${category}. Status: ${response.status()}`);
            }

            await this.randomDelay();

            // Scroll to load more content
            await this.autoScroll();
            
            const modelData = await this.page.evaluate(() => {
                const models = [];
                const modelCards = document.querySelectorAll('[data-testid="model-card"]') || document.querySelectorAll('.model-card');
                
                modelCards.forEach(card => {
                    try {
                        const title = card.querySelector('h3, .model-title, [data-testid="model-title"]')?.textContent?.trim();
                        const rating = card.querySelector('.rating, [data-testid="rating"]')?.textContent?.trim();
                        const downloads = card.querySelector('.downloads, [data-testid="downloads"]')?.textContent?.trim();
                        const tags = Array.from(card.querySelectorAll('.tag, [data-testid="tag"]')).map(tag => tag.textContent.trim());
                        const description = card.querySelector('.description, [data-testid="description"]')?.textContent?.trim();
                        const imageUrl = card.querySelector('img')?.src;
                        
                        if (title) {
                            models.push({
                                title,
                                rating,
                                downloads,
                                tags,
                                description,
                                imageUrl,
                                category: '${category}',
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    } catch (e) {
                        console.log('Error parsing model card:', e);
                    }
                });
                
                return models;
            });

            if (modelData.length === 0) {
                console.log(`No models found for category: ${category}. Dumping page content for analysis.`);
                const content = await this.page.content();
                console.log(content);
            }
            this.scrapedData.models.push(...modelData);
            console.log(`✅ Scraped ${modelData.length} models from ${category}`);
            
            await this.randomDelay();
        }
    }

    async scrapeDiscussions() {
        console.log('💬 Scraping forum discussions and threads...');
        
        const discussionUrls = [
            'https://civitai.com/discussions',
            'https://civitai.com/articles'
        ];

        for (const url of discussionUrls) {
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await this.autoScroll();
            
            const discussions = await this.page.evaluate(() => {
                const threads = [];
                const threadElements = document.querySelectorAll('.discussion-thread, .article-card, [data-testid="discussion"], [data-testid="article"]');
                
                threadElements.forEach(thread => {
                    try {
                        const title = thread.querySelector('h3, h2, .title, [data-testid="title"]')?.textContent?.trim();
                        const author = thread.querySelector('.author, [data-testid="author"]')?.textContent?.trim();
                        const replies = thread.querySelector('.replies, [data-testid="replies"]')?.textContent?.trim();
                        const votes = thread.querySelector('.votes, .likes, [data-testid="votes"]')?.textContent?.trim();
                        const content = thread.querySelector('.content, .preview, [data-testid="content"]')?.textContent?.trim();
                        const threadUrl = thread.querySelector('a')?.href;
                        
                        if (title && threadUrl) {
                            threads.push({
                                title,
                                author,
                                replies,
                                votes,
                                content,
                                threadUrl,
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    } catch (e) {
                        console.log('Error parsing thread:', e);
                    }
                });
                
                return threads;
            });

            this.scrapedData.discussions.push(...discussions);
            console.log(`✅ Scraped ${discussions.length} discussions from ${url}`);
        }
    }

    async scrapeDetailedThreads() {
        console.log('🔍 Deep scraping individual threads...');
        
        const threadsToScrape = this.scrapedData.discussions.slice(0, 50); // Limit to avoid overwhelming
        
        for (const thread of threadsToScrape) {
            if (!thread.threadUrl) continue;
            
            try {
                console.log(`📖 Scraping thread: ${thread.title}`);
                
                await this.page.goto(thread.threadUrl, { waitUntil: 'networkidle2' });
                await this.randomDelay();
                
                const threadDetails = await this.page.evaluate(() => {
                    const comments = [];
                    const commentElements = document.querySelectorAll('.comment, .reply, [data-testid="comment"]');
                    
                    commentElements.forEach(comment => {
                        try {
                            const author = comment.querySelector('.author, [data-testid="author"]')?.textContent?.trim();
                            const content = comment.querySelector('.content, .text, [data-testid="content"]')?.textContent?.trim();
                            const votes = comment.querySelector('.votes, .likes, [data-testid="votes"]')?.textContent?.trim();
                            const timestamp = comment.querySelector('.timestamp, [data-testid="timestamp"]')?.textContent?.trim();
                            
                            if (content) {
                                comments.push({
                                    author,
                                    content,
                                    votes,
                                    timestamp
                                });
                            }
                        } catch (e) {
                            console.log('Error parsing comment:', e);
                        }
                    });
                    
                    return {
                        fullContent: document.querySelector('main, .content, [data-testid="main-content"]')?.textContent?.trim(),
                        comments
                    };
                });
                
                // Add detailed thread data
                thread.fullContent = threadDetails.fullContent;
                thread.comments = threadDetails.comments;
                
                await this.randomDelay();
                
            } catch (error) {
                console.log(`❌ Error scraping thread ${thread.title}:`, error.message);
            }
        }
        
        console.log('✅ Detailed thread scraping complete');
    }

    async scrapeTrendingTechniques() {
        console.log('🔥 Scraping trending techniques and popular approaches...');
        
        const trendingPages = [
            'https://civitai.com/models?sort=Most%20Downloaded&period=Week',
            'https://civitai.com/models?sort=Highest%20Rated&period=Month',
            'https://civitai.com/models?sort=Most%20Liked&period=Week'
        ];

        for (const url of trendingPages) {
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await this.autoScroll();
            await this.randomDelay();
            
            const techniques = await this.page.evaluate(() => {
                const trends = [];
                const elements = document.querySelectorAll('.model-card, [data-testid="model-card"]');
                
                elements.forEach(element => {
                    try {
                        const techniques = Array.from(element.querySelectorAll('.tag, .technique, [data-testid="tag"]'))
                            .map(tag => tag.textContent.trim())
                            .filter(tag => tag.length > 0);
                        
                        const stats = {
                            downloads: element.querySelector('.downloads, [data-testid="downloads"]')?.textContent?.trim(),
                            rating: element.querySelector('.rating, [data-testid="rating"]')?.textContent?.trim(),
                            likes: element.querySelector('.likes, [data-testid="likes"]')?.textContent?.trim()
                        };
                        
                        if (techniques.length > 0) {
                            trends.push({
                                techniques,
                                stats,
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    } catch (e) {
                        console.log('Error parsing trending item:', e);
                    }
                });
                
                return trends;
            });

            this.scrapedData.trends.push(...techniques);
        }
        
        console.log(`✅ Scraped trending techniques data`);
    }

    async autoScroll() {
        await this.page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    async randomDelay() {
        const delay = Math.random() * 3000 + 1000; // 1-4 seconds
        console.log(`⏳ Waiting ${Math.round(delay/1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async saveData() {
        console.log('💾 Saving scraped data...');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Save individual files
        await fs.writeFile(
            path.join(this.outputDir, `models_${timestamp}.json`),
            JSON.stringify(this.scrapedData.models, null, 2)
        );
        
        await fs.writeFile(
            path.join(this.outputDir, `discussions_${timestamp}.json`),
            JSON.stringify(this.scrapedData.discussions, null, 2)
        );
        
        await fs.writeFile(
            path.join(this.outputDir, `trends_${timestamp}.json`),
            JSON.stringify(this.scrapedData.trends, null, 2)
        );
        
        // Save combined file
        await fs.writeFile(
            path.join(this.outputDir, `civitai_full_scrape_${timestamp}.json`),
            JSON.stringify(this.scrapedData, null, 2)
        );
        
        console.log(`✅ Data saved to ${this.outputDir}`);
        console.log(`📊 Scraped: ${this.scrapedData.models.length} models, ${this.scrapedData.discussions.length} discussions, ${this.scrapedData.trends.length} trends`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }

    async fullScrape() {
        try {
            await this.initialize();
            await this.login();
            await this.scrapeModelCategories();
            await this.scrapeDiscussions();
            await this.scrapeDetailedThreads();
            await this.scrapeTrendingTechniques();
            await this.saveData();
            
            console.log('🎉 Full scrape completed successfully!');
            
        } catch (error) {
            console.error('❌ Scraping failed:', error);
        } finally {
            await this.cleanup();
        }
    }
}

// Usage
async function main() {
    const scraper = new CivitAIScraper();
    await scraper.fullScrape();
}

// Export for use in other modules
module.exports = CivitAIScraper;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}