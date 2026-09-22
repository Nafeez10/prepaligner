import * as cheerio from 'cheerio';
import { SafeHttpClient } from '../../crawler/SafeHttpClient';
import { IExternalDataSource, ExternalDataSourceResult } from '../IExternalDataSource';

/**
 * GlassdoorSource attempts a best-effort scrape of Glassdoor interview pages.
 *
 * IMPORTANT: Glassdoor uses heavy Cloudflare protection and obfuscated CSS classes.
 * This source will FREQUENTLY fail with 403/captcha errors. It is designed as an
 * "optimistic enrichment" — great when it works, harmless when it doesn't.
 *
 * The architecture intentionally treats this as a non-critical data source.
 */
export class GlassdoorSource implements IExternalDataSource {
  public readonly sourceName = 'glassdoor';
  private httpClient: SafeHttpClient;

  constructor() {
    this.httpClient = new SafeHttpClient();
  }

  public async search(companyName: string, roleName: string): Promise<ExternalDataSourceResult> {
    const result: ExternalDataSourceResult = {
      source: this.sourceName,
      interviewQuestions: [],
      interviewExperiences: [],
      companyInsights: [],
      confidence: 'low',
    };

    try {
      const slug = this.normalizeForUrl(companyName);
      // Glassdoor interview URL pattern: /Interview/{Company}-Interview-Questions-E{id}.htm
      // Without the company ID, we try the search-based URL pattern
      const searchUrl = `https://www.glassdoor.com/Interview/${slug}-interview-questions-SRCH_KE0,${slug.length}.htm`;

      const res = await this.httpClient.get(searchUrl);

      if (!res.data || typeof res.data !== 'string') {
        return result;
      }

      const extracted = this.extractInterviewData(res.data, roleName);
      result.interviewQuestions = extracted.questions;
      result.interviewExperiences = extracted.experiences;

      if (result.interviewQuestions.length > 0) {
        result.confidence = result.interviewQuestions.length >= 5 ? 'high' : 'medium';
      }
    } catch {
      // Glassdoor blocked us (expected). Return empty result gracefully.
    }

    return result;
  }

  private normalizeForUrl(name: string): string {
    return name
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  }

  private extractInterviewData(
    html: string,
    roleName: string
  ): { questions: string[]; experiences: string[] } {
    const $ = cheerio.load(html);
    const questions: string[] = [];
    const experiences: string[] = [];

    // Glassdoor obfuscates class names, so we use structural selectors
    // and text-content heuristics rather than specific CSS classes

    // Look for interview question blocks — these typically appear as quoted text
    // within list items or specific containers
    $('span, p, li, div').each((_, el) => {
      const text = $(el).text().trim();

      // Filter for text that looks like interview questions
      if (
        text.length > 30 &&
        text.length < 500 &&
        (text.includes('?') || text.toLowerCase().startsWith('how') ||
         text.toLowerCase().startsWith('what') || text.toLowerCase().startsWith('why') ||
         text.toLowerCase().startsWith('describe') || text.toLowerCase().startsWith('explain') ||
         text.toLowerCase().startsWith('tell me'))
      ) {
        // Avoid duplicates and navigation/boilerplate text
        const isDuplicate = questions.some((q) => q === text);
        const isBoilerplate =
          text.toLowerCase().includes('sign in') ||
          text.toLowerCase().includes('cookie') ||
          text.toLowerCase().includes('privacy');

        if (!isDuplicate && !isBoilerplate && questions.length < 15) {
          questions.push(text);
        }
      }

      // Look for interview process descriptions
      if (
        text.length > 100 &&
        text.length < 1000 &&
        (text.toLowerCase().includes('interview process') ||
         text.toLowerCase().includes('phone screen') ||
         text.toLowerCase().includes('onsite') ||
         text.toLowerCase().includes('rounds'))
      ) {
        if (experiences.length < 5) {
          experiences.push(text);
        }
      }
    });

    return { questions, experiences };
  }
}
