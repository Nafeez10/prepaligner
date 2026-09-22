import { SafeHttpClient } from './SafeHttpClient';
import { LinkRanker } from './LinkRanker';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';

export class CompanyCrawlerService {
  private httpClient: SafeHttpClient;
  private linkRanker: LinkRanker;

  constructor() {
    this.httpClient = new SafeHttpClient();
    this.linkRanker = new LinkRanker();
  }

  public async crawl(companyUrl: string): Promise<{
    summaryContent: string;
    pagesCrawled: string[];
  }> {
    const pagesCrawled: string[] = [];
    let summaryContent = '';

    try {
      // 1. Check robots.txt (best effort)
      let isAllowed = true;
      try {
        const urlObj = new URL(companyUrl);
        const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
        const robotsRes = await this.httpClient.get(robotsUrl);
        const robots = robotsParser(robotsUrl, robotsRes.data);
        isAllowed = robots.isAllowed(companyUrl, 'Trao-Interview-Prep-Bot') ?? true;
      } catch (e) {
        // robots.txt not found or inaccessible, assume allowed
      }

      if (!isAllowed) {
        throw new Error("Crawling disallowed by robots.txt");
      }

      // 2. Fetch Homepage
      const homeRes = await this.httpClient.get(companyUrl);
      pagesCrawled.push(companyUrl);
      summaryContent += this.cleanHtml(homeRes.data);

      // 3. Rank inner links and fetch the top 2
      const rankedLinks = this.linkRanker.rankLinks(homeRes.data, companyUrl);
      const topLinks = rankedLinks.slice(0, 2);

      for (const link of topLinks) {
        try {
          const innerRes = await this.httpClient.get(link.url);
          pagesCrawled.push(link.url);
          summaryContent += '\n\n' + this.cleanHtml(innerRes.data);
        } catch (innerErr) {
          // Skip failures for individual inner pages
        }
      }

    } catch (error) {
      throw new Error(`Failed to crawl company URL: ${(error as any).message}`);
    }

    return { summaryContent, pagesCrawled };
  }

  private cleanHtml(html: string): string {
    const $ = cheerio.load(html);
    
    // Remove noise
    $('script, style, nav, footer, header, iframe, noscript, svg, img').remove();
    
    let text = $('body').text();
    // Collapse excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Truncate to avoid blowing up context windows (max ~3000 chars per page)
    return text.substring(0, 3000);
  }
}
