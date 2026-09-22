import * as cheerio from 'cheerio';
import { URL } from 'url';

export class LinkRanker {
  private readonly HIGH_VALUE_PATTERNS = [
    /career/i,
    /jobs/i,
    /about/i,
    /culture/i,
    /team/i,
    /values/i,
    /handbook/i,
    /engineering/i,
    /hiring/i,
    /interview/i
  ];

  public rankLinks(html: string, baseUrl: string): { url: string; score: number }[] {
    const $ = cheerio.load(html);
    const links = new Map<string, number>();

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      try {
        // Resolve relative links
        const fullUrl = new URL(href, baseUrl).href;
        
        // Skip external links to keep focus on company
        if (new URL(fullUrl).hostname !== new URL(baseUrl).hostname) {
            return; 
        }

        const text = $(el).text().trim();
        const score = this.calculateScore(fullUrl, text);

        if (score > 0) {
          // Keep the highest score if duplicate links exist
          const existingScore = links.get(fullUrl) || 0;
          if (score > existingScore) {
            links.set(fullUrl, score);
          }
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    });

    return Array.from(links.entries())
      .map(([url, score]) => ({ url, score }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateScore(url: string, linkText: string): number {
    let score = 0;
    for (const pattern of this.HIGH_VALUE_PATTERNS) {
      if (pattern.test(url)) score += 10;
      if (pattern.test(linkText)) score += 5;
    }
    return score;
  }
}
