import { describe, it, expect } from 'vitest';
import { LinkRanker } from '../src/pipeline/crawler/LinkRanker';

describe('LinkRanker', () => {
  const ranker = new LinkRanker();

  it('should rank career and about links higher', () => {
    const html = `
      <html>
        <body>
          <a href="/about-us">About Us</a>
          <a href="/products">Products</a>
          <a href="/careers/engineering">Engineering Jobs</a>
          <a href="https://external.com">External</a>
        </body>
      </html>
    `;
    const baseUrl = 'https://company.com';

    const ranked = ranker.rankLinks(html, baseUrl);

    // Filtered out external.com
    expect(ranked.some(l => l.url.includes('external.com'))).toBe(false);

    // Highest score should be engineering careers
    expect(ranked[0].url).toBe('https://company.com/careers/engineering');
    
    // Check if about is also ranked
    const aboutLink = ranked.find(l => l.url.includes('about-us'));
    expect(aboutLink).toBeDefined();
    
    // Products should have lower score
    const prodLink = ranked.find(l => l.url.includes('products'));
    expect(aboutLink!.score).toBeGreaterThan(prodLink?.score || 0);
  });
});
